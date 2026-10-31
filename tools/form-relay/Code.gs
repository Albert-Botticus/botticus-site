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

function doGet() {
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
