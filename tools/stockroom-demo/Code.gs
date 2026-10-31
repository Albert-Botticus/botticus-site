// Botticus Stockroom demo backend.
// A tiny shared stockroom for botticus.com/stockroom-demo.html: anyone can scan a bin's QR
// code on their phone, the count drops for everyone watching the board, and when a bin
// crosses its reorder point the board shows the alert the real system would send.
//
// State lives in Script Properties (one JSON blob). No sheet, no login, nothing personal.
// Counts floor at zero and restock themselves, and the whole demo resets to its starting
// stock every night, so it can never be left broken.
//
// GET ?action=state            -> current stock, recent log
// GET ?action=scan&sku=GRN-ETH -> pick one, return the new state for that bin
// GET ?action=reset&key=...    -> restore starting stock (owner only)
//
// Runs in Nathan's nlevysrl@gmail.com account like the form relay. Deploy by targeting the
// existing deployment ID (see the site README); never a bare `clasp deploy`.

var CATALOG = [
  { sku: 'GRN-ETH', name: 'Ethiopia Yirgacheffe, green', unit: 'bags', start: 14, reorderAt: 6, reorderQty: 20, supplier: 'Royal Coffee' },
  { sku: 'GRN-COL', name: 'Colombia Huila, green', unit: 'bags', start: 9, reorderAt: 4, reorderQty: 15, supplier: 'Royal Coffee' },
  { sku: 'BAG-12K', name: 'Retail bags, 12 oz kraft', unit: 'bags', start: 31, reorderAt: 15, reorderQty: 50, supplier: 'Pacific Bag' },
  { sku: 'LBL-HSE', name: 'Labels, house blend', unit: 'labels', start: 18, reorderAt: 10, reorderQty: 100, supplier: 'Sticker Mule' },
  { sku: 'BOX-MED', name: 'Shipping boxes, medium', unit: 'boxes', start: 12, reorderAt: 5, reorderQty: 30, supplier: 'Uline' }
];
var BUSINESS = 'Clintonville Coffee Roasters (demo)';
var SCANS_PER_MINUTE = 120;   // across everyone; a booth crowd is well under this
var RESET_AFTER_HOURS = 20;   // a fresh demo every day

function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = String(p.action || 'state');
  var state = load_();
  if (action === 'scan') {
    if (overCap_()) return json_({ ok: false, error: 'busy', state: view_(state) });
    var sku = String(p.sku || '').toUpperCase().slice(0, 12);
    var item = find_(sku);
    if (!item) return json_({ ok: false, error: 'unknown bin', state: view_(state) });
    var bin = state.items[sku];
    var before = bin.stock;
    var event;
    if (bin.stock <= 0) {
      bin.stock = item.start; bin.alerted = false;
      event = { t: Date.now(), sku: sku, kind: 'restock', text: item.name + ' restocked to ' + item.start + ' ' + item.unit + ' (demo auto-restock)' };
    } else {
      bin.stock -= 1;
      state.picked += 1;
      event = { t: Date.now(), sku: sku, kind: 'pick', text: '1 ' + singular_(item.unit) + ' of ' + item.name + ' used, ' + bin.stock + ' left' };
      if (bin.stock <= item.reorderAt && !bin.alerted) {
        bin.alerted = true;
        state.alerts.unshift({ t: Date.now(), sku: sku, name: item.name, stock: bin.stock, unit: item.unit, reorderQty: item.reorderQty, supplier: item.supplier });
        state.alerts = state.alerts.slice(0, 10);
        event.alert = true;
      }
    }
    state.log.unshift(event); state.log = state.log.slice(0, 25);
    save_(state);
    return json_({ ok: true, sku: sku, name: item.name, unit: item.unit, before: before, after: bin.stock, reorderAt: item.reorderAt, alert: !!event.alert, restocked: event.kind === 'restock', state: view_(state) });
  }
  if (action === 'reset') {
    if (String(p.key || '') !== PropertiesService.getScriptProperties().getProperty('RESET_KEY')) return json_({ ok: false, error: 'no' });
    state = fresh_(); save_(state);
    return json_({ ok: true, state: view_(state) });
  }
  return json_({ ok: true, state: view_(state) });
}

function fresh_() {
  var items = {};
  CATALOG.forEach(function (i) { items[i.sku] = { stock: i.start, alerted: false }; });
  return { since: Date.now(), items: items, picked: 0, alerts: [], log: [] };
}
function load_() {
  var raw = PropertiesService.getScriptProperties().getProperty('STATE');
  var s = raw ? JSON.parse(raw) : fresh_();
  if (Date.now() - (s.since || 0) > RESET_AFTER_HOURS * 3600000) s = fresh_();
  CATALOG.forEach(function (i) { if (!s.items[i.sku]) s.items[i.sku] = { stock: i.start, alerted: false }; });
  return s;
}
function save_(s) { PropertiesService.getScriptProperties().setProperty('STATE', JSON.stringify(s)); }
function find_(sku) { for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].sku === sku) return CATALOG[i]; return null; }
function singular_(u) { return u.replace(/es$/, '').replace(/s$/, ''); }
function view_(s) {
  return {
    business: BUSINESS, since: s.since, picked: s.picked,
    items: CATALOG.map(function (i) { var b = s.items[i.sku]; return { sku: i.sku, name: i.name, unit: i.unit, stock: b.stock, start: i.start, reorderAt: i.reorderAt, reorderQty: i.reorderQty, supplier: i.supplier, low: b.stock <= i.reorderAt }; }),
    alerts: s.alerts, log: s.log
  };
}
function overCap_() {
  var cache = CacheService.getScriptCache();
  var key = 'scans-' + Math.floor(Date.now() / 60000);
  var n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 90);
  return n > SCANS_PER_MINUTE;
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
