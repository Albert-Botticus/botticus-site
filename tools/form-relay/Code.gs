// Botticus contact-form relay.
// A Google Apps Script web app that takes the botticus.com contact form (POSTed as JSON
// with Content-Type text/plain, which keeps the browser from sending a CORS preflight)
// and emails it to hello@botticus.com. Runs in Nathan's Google account; no third party.
//
// Deploy: Deploy > New deployment > Web app, Execute as Me, Who has access: Anyone.
// Later code changes: Deploy > Manage deployments > edit > New version (keeps the URL).

var TO = 'hello@botticus.com';
var MAX_FIELD = 4000;
var HOURLY_CAP = 30; // spam brake: more than this per hour and we stop emailing until the hour passes

function doGet(e) {
  // botticus.com/flyover asks which artists already have a request, so a second room can see it.
  if (e && e.parameter && e.parameter.flyover === 'requests') {
    try { return json_({ ok: true, requests: flyoverRequests_() }); }
    catch (err) { return json_({ ok: false, error: 'unavailable' }); }
  }
  return json_({ ok: true, service: 'botticus-form-relay' });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'bad json' });
  }
  var get = function (k) { return String(data[k] || '').trim().slice(0, MAX_FIELD); };

  // Honeypot: real visitors never see the field.
  if (get('_gotcha')) return json_({ ok: true });
  // Flyover (botticus.com/flyover) has its own fields and its own handler below.
  if (get('formType').indexOf('flyover') === 0) {
    try { return flyoverPost_(data, get); }
    catch (err) { return json_({ ok: false, error: 'flyover relay error' }); }
  }
  if (!get('name') || !get('email')) return json_({ ok: false, error: 'name and email required' });
  if (overCap_()) return json_({ ok: false, error: 'rate limited' });

  // Two forms share this relay. formType decides the subject, so a free-mockup request
  // is obvious in the inbox instead of reading like another general inquiry. A page that
  // posts no formType still works and still says "inquiry".
  // 'website-mockup' is the pre-2026-10-30-evening name for the same form; a cached
  // page can still send it, so both are accepted and both get the demo subject.
  var mockup = get('formType') === 'website-demo' || get('formType') === 'website-mockup';
  var quote = get('formType') === 'quote';
  var subject = (mockup ? 'Botticus demo site: ' : quote ? 'Botticus quote request: ' : 'Botticus inquiry: ') + (get('business') || get('name'));
  var body = (quote ? [
    'QUOTE REQUEST',
    '',
    'Name: ' + get('name'),
    'Business: ' + get('business'),
    'Email: ' + get('email'),
    'Phone: ' + get('phone'),
    'Looking for: ' + get('want'),
    'Team size: ' + get('size'),
    'Systems: ' + get('systems'),
    'Autonomy: ' + get('autonomy'),
    '',
    'What eats their time:',
    get('details'),
    '',
    '--',
    'Sent from the botticus.com quote form.'
  ] : mockup ? [
    'FREE DEMO SITE REQUEST',
    '',
    'Name: ' + get('name'),
    'Business: ' + get('business'),
    'Email: ' + get('email'),
    'Phone: ' + get('phone'),
    'Current website: ' + get('website'),
    'City: ' + get('city'),
    'What the business does: ' + get('what'),
    'Top three services: ' + get('services'),
    '',
    'Anything else:',
    get('notes'),
    '',
    '--',
    'Sent from the botticus.com free demo form.'
  ] : [
    'Name: ' + get('name'),
    'Business: ' + get('business'),
    'Email: ' + get('email'),
    'Phone: ' + get('phone'),
    'Team size: ' + get('size'),
    '',
    'What eats their time:',
    get('details') || get('message'),
    '',
    '--',
    'Sent from the botticus.com contact form.'
  ]).join('\n');

  var options = { name: 'botticus.com form' };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('email'))) options.replyTo = get('email');
  MailApp.sendEmail(TO, subject, body, options);
  return json_({ ok: true });
}

function overCap_() {
  var cache = CacheService.getScriptCache();
  var key = 'count-' + Math.floor(Date.now() / 3600000);
  var n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 3600);
  return n > HOURLY_CAP;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------------------
// Flyover. Two kinds of post:
//   formType 'flyover-request'  a room asks for an artist on a night. Emailed to hello@ AND
//                               counted, so the site can show "1 room has asked" to the next
//                               visitor. Only a count and the city are ever given back out.
//   formType 'flyover'          any other Flyover form (join, post a trip). Emailed only.
// Counts live in script properties: no spreadsheet, no extra permissions.
var FLY_PREFIX = 'fly|';

function flyoverPost_(data, get) {
  var email = get('email') || get('contact');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ ok: false, error: 'email required' });
  if (overCap_()) return json_({ ok: false, error: 'rate limited' });

  var isRequest = get('formType') === 'flyover-request';
  var count = null;
  if (isRequest) {
    var artistId = get('artistId');
    var night = get('nightDate');
    if (!/^[a-z0-9-]{1,60}$/.test(artistId) || !/^\d{4}-\d{2}-\d{2}$/.test(night)) return json_({ ok: false, error: 'artist and night required' });
    count = flyoverCount_(artistId, night, get('city').slice(0, 40), email);
  }

  var skip = { _gotcha: 1, formType: 1, _subject: 1 };
  var lines = [isRequest ? 'FLYOVER REQUEST' + (count && count.n > 1 ? ' (' + count.n + ' rooms have now asked for this artist and night)' : '') : 'FLYOVER', ''];
  var keys = Object.keys(data).slice(0, 40);
  for (var i = 0; i < keys.length; i++) {
    if (skip[keys[i]]) continue;
    var v = get(keys[i]);
    if (v) lines.push(String(keys[i]).slice(0, 40) + ': ' + v);
  }
  lines.push('', '--', 'Sent from botticus.com/flyover.');
  var subject = (isRequest ? 'Flyover request: ' : 'Flyover: ') + (get('_subject') || get('artist') || get('name') || 'form').replace(/[\r\n]+/g, ' ').slice(0, 140);
  MailApp.sendEmail(TO, subject, lines.join('\n'), { name: 'botticus.com/flyover', replyTo: email });
  return json_({ ok: true, count: count ? count.n : null });
}

// One property per artist + night: { n: rooms that asked, cities: [...], who: [short hashes] }.
// The hash only stops one person from counting twice; no email address is stored.
function flyoverCount_(artistId, night, city, email) {
  var lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    var props = PropertiesService.getScriptProperties();
    var key = FLY_PREFIX + artistId + '|' + night;
    var rec = JSON.parse(props.getProperty(key) || '{"n":0,"cities":[],"who":[]}');
    var who = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email.toLowerCase() + '|' + key)).slice(0, 10);
    if (rec.who.indexOf(who) < 0 && rec.who.length < 40) {
      rec.who.push(who);
      rec.n = rec.who.length;
      if (city && rec.cities.indexOf(city) < 0 && rec.cities.length < 8) rec.cities.push(city);
      props.setProperty(key, JSON.stringify(rec));
    }
    if (Math.random() < 0.05) flyoverPrune_(props);
    return rec;
  } finally { lock.releaseLock(); }
}

function flyoverRequests_() {
  var all = PropertiesService.getScriptProperties().getProperties();
  var out = {};
  for (var k in all) {
    if (k.indexOf(FLY_PREFIX) !== 0) continue;
    try { var r = JSON.parse(all[k]); out[k.slice(FLY_PREFIX.length)] = { n: r.n, cities: r.cities }; } catch (err) { /* skip a bad row */ }
  }
  return out;
}

// Drop counts for nights that are more than a week gone.
function flyoverPrune_(props) {
  var cutoff = Utilities.formatDate(new Date(Date.now() - 7 * 86400000), 'America/New_York', 'yyyy-MM-dd');
  var all = props.getProperties();
  for (var k in all) if (k.indexOf(FLY_PREFIX) === 0 && k.split('|')[2] < cutoff) props.deleteProperty(k);
}
