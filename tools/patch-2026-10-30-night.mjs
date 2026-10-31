// One-off patch, 2026-10-30 night: Nathan's review changes.
//   - Websites section moves to websites.html; homepage keeps a short teaser
//   - Botticus runs the Bot's server (DigitalOcean) -> ownership wording made true
//   - Telegram, not phone/SMS
//   - stats strip -> outcomes; Columbus Mustard Club named
//   - "quote on the call" -> emailed quote via the quote form (formType 'quote')
//   - footer: "Botticus is operated by SRL Logistics LLC, Columbus, Ohio."
// Run once from the site root: node tools/patch-2026-10-30-night.mjs
import fs from 'node:fs';

const read = f => fs.readFileSync(f, 'utf8');
const write = (f, s) => fs.writeFileSync(f, s);
function rep(s, a, b, file) { if (!s.includes(a)) throw new Error(`MISS in ${file}: ${a.slice(0, 90)}`); return s.split(a).join(b); }

// ---------------------------------------------------------------- index.html
let s = read('index.html');
const F = 'index.html';

// 1. Websites section -> teaser
const wsStart = s.indexOf('<section class="section" id="websites">');
const wsEnd = s.indexOf('</section>', wsStart) + '</section>'.length;
if (wsStart < 0) throw new Error('websites section not found');
s = s.slice(0, wsStart) + `<section class="section" id="websites">
  <div class="container center">
    <span class="eyebrow">Websites</span>
    <h2>A site that loads fast, never breaks, and belongs to you.</h2>
    <p class="lead">A fast, static site with nothing on it to hack, set up in accounts with your name on them: your domain, your hosting, your forms. See a real multi-page demo of yours first, free, usually within the hour.</p>
    <div class="btn-row" style="justify-content:center;margin-top:22px">
      <a class="btn primary" href="demo.html">See a free demo of yours</a>
      <a class="btn ghost" href="websites.html" style="color:var(--ink);border-color:var(--ink)">How websites work</a>
    </div>
  </div>
</section>` + s.slice(wsEnd);

// 2. Home-too: shorter, points at Family
const htStart = s.indexOf('<section class="section soft" id="home">');
const htEnd = s.indexOf('</section>', htStart) + '</section>'.length;
s = s.slice(0, htStart) + `<section class="section soft" id="home">
  <div class="container center">
    <span class="eyebrow">Home too</span>
    <h2>It doesn't clock out when you do.</h2>
    <p class="lead">A small business owner's day has no line between work and home, so your Bot doesn't draw one either. The same Bot that builds Monday's order books the bulk pickup, moves Mom's dentist appointment, and keeps every school portal in one morning digest. One thread, your whole day. <a href="family.html"><strong>See what it does for a family.</strong></a></p>
  </div>
</section>` + s.slice(htEnd);

// 3. Ownership wording: Botticus runs the server, client owns the accounts and the files
s = rep(s, `<p>It runs in accounts you own, using systems you already pay for. There is no new platform to move your life into, and nobody else's AI training on your customers.</p>`,
  `<p>It works inside accounts you already own, using systems you already pay for, from a dedicated server we run for you alone. Nobody else's AI trains on your customers, and every rule and memory is a file you can take with you.</p>`, F);
s = rep(s, `<td class="yes">On a machine you control, logged into your real systems: TMS, portals, marketplaces, printers</td>`,
  `<td class="yes">On its own dedicated server, run by Botticus for you alone, logged into your real systems: TMS, portals, marketplaces, printers</td>`, F);
s = rep(s, `<td class="yes">Stays in accounts you own. Never used to train anything. Revoke access any time</td>`,
  `<td class="yes">Stays in accounts you own; the Bot's own files export on request. AI runs through Botticus's account and is never used for training. Revoke access any time</td>`, F);
s = rep(s, `<td class="yes">Its own name, inbox, and phone. It emails customers as itself and pings you first</td>`,
  `<td class="yes">Its own name, inbox, and Telegram line. It emails customers as itself and pings you first</td>`, F);
s = rep(s, `<p>Your Bot runs against accounts you own: your email, your Google or Microsoft workspace, your marketplaces, your portals. We don't move your business onto a platform we control, and we don't train anything on your customers. You can revoke access at any time.</p>`,
  `<p>Your Bot works inside accounts you own: your email, your Google or Microsoft workspace, your marketplaces, your portals. It runs on a dedicated cloud server that Botticus manages so you never have to, and its AI runs through Botticus's account, which is never used for training. We don't copy your business anywhere else, every rule and memory is a file you can take with you, and you can revoke access at any time.</p>`, F);

// 4. Telegram, not phone
s = rep(s, `<li>Phone alerts for what matters</li>`, `<li>Telegram alerts for what matters</li>`, F);
s = rep(s, `the cold outreach, the website, and the phone alerts.</li>`, `the cold outreach, the website, and the Telegram alerts.</li>`, F);

// 5. Stats -> outcomes
s = rep(s, `          <div class="stat"><b>24/7</b><span>scheduled jobs</span></div>
          <div class="stat"><b>5 min</b><span>fastest check cycle</span></div>
          <div class="stat"><b>1 text</b><span>to build and send a load</span></div>`,
  `          <div class="stat"><b>Nothing waits</b><span>inbox, portals and reports checked every five minutes, nights and weekends</span></div>
          <div class="stat"><b>Paperwork out</b><span>before the team logs in each morning</span></div>
          <div class="stat"><b>One text</b><span>and the order is built, sent and logged</span></div>`, F);

// 6. Name the Columbus Mustard Club
s = rep(s, `<strong>A 300-member social club:</strong>`, `<strong>The Columbus Mustard Club,</strong> a 300-member social club:`, F);

// 7. Quotes by email, not "on the call"
s = rep(s, `<p class="lead">Pricing depends on how many systems your Bot touches and how much it's allowed to do on its own. Every engagement starts with a free discovery call. A household-only Bot starts smaller than Starter; <a href="family.html">see the Family page</a> and ask on the call.</p>`,
  `<p class="lead">Pricing depends on how many systems your Bot touches and how much it's allowed to do on its own. Tell us about your business below and a written quote arrives by email within one business day. A household-only Bot starts smaller than Starter; <a href="family.html">see the Family page</a>.</p>`, F);
s = s.split(`<div class="price">Setup + monthly care <small>· quote on the call</small></div>`).join(`<div class="price">Setup + monthly care <small>· <a href="#quote">quote by email</a></small></div>`);
s = rep(s, `<a class="btn outline" href="#contact">Start here</a>`, `<a class="btn outline" href="#quote">Quote for Starter</a>`, F);
s = rep(s, `<a class="btn primary" href="#contact">Get Operator</a>`, `<a class="btn primary" href="#quote">Quote for Operator</a>`, F);
s = rep(s, `<a class="btn outline" href="#contact">Let's talk</a>`, `<a class="btn outline" href="#quote">Quote for Chief of Staff</a>`, F);
s = rep(s, `<p>A one-time setup fee plus a monthly care plan. The numbers depend on how many systems the Bot touches and how much it's trusted to do alone, so we quote after the discovery call. The call is free and there's no pressure.</p>`,
  `<p>A one-time setup fee plus a monthly care plan that includes the Bot's server and a monthly AI allowance. The numbers depend on how many systems the Bot touches and how much it's trusted to do alone. <a href="#quote">Ask for a quote</a> and a written one arrives by email within one business day, no call required.</p>`, F);

// 8. Contact section -> quote form
const cStart = s.indexOf('<section class="section" id="contact">');
const cEnd = s.indexOf('</section>', cStart) + '</section>'.length;
s = s.slice(0, cStart) + `<section class="section" id="quote">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info">
        <span class="eyebrow">Get a quote</span>
        <h2>Tell me what eats your week. I'll send a price.</h2>
        <p class="lead">Fill this in and a written quote arrives by email within one business day: the plan I'd recommend, the setup fee, the monthly care plan, and what's included. No call needed, though I'm happy to have one.</p>
        <p class="big"><a href="tel:+16148559504">614-855-9504</a></p>
        <p><a href="mailto:hello@botticus.com">hello@botticus.com</a></p>
        <p>Botticus<br>Columbus, Ohio<br>Owner-built, owner-run</p>
      </div>
      <div class="card form-card">
        <form id="contact-form" novalidate>
          <div class="row">
            <div><label for="name">Your name</label><input id="name" name="name" type="text" required autocomplete="name"></div>
            <div><label for="business">Business</label><input id="business" name="business" type="text" autocomplete="organization"></div>
          </div>
          <div class="row">
            <div><label for="email">Email</label><input id="email" name="email" type="email" required autocomplete="email"></div>
            <div><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel"></div>
          </div>
          <div class="row">
            <div>
              <label for="want">What are you after?</label>
              <select id="want" name="want">
                <option value="">Choose one</option>
                <option>A Bot for my business</option>
                <option>A Bot for my household</option>
                <option>Both</option>
                <option>A website</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <div>
              <label for="size">Team size</label>
              <select id="size" name="size">
                <option value="">Choose one</option>
                <option>Just me</option>
                <option>2 to 5 people</option>
                <option>6 to 20 people</option>
                <option>More than 20</option>
              </select>
            </div>
          </div>
          <div>
            <label for="systems">Systems you live in</label>
            <input id="systems" name="systems" type="text" placeholder="Gmail, QuickBooks, Shopify, a TMS, school portals...">
          </div>
          <div>
            <label for="autonomy">How much should it do on its own?</label>
            <select id="autonomy" name="autonomy">
              <option value="">Choose one</option>
              <option>I approve everything first</option>
              <option>Routine things on its own, I approve the rest</option>
              <option>As much as possible</option>
            </select>
          </div>
          <div>
            <label for="details">What eats your time?</label>
            <textarea id="details" name="details" placeholder="Example: I spend two hours a day on email, orders get entered twice, and nobody chases unpaid invoices."></textarea>
          </div>
          <div class="hp" aria-hidden="true"><label>Leave this empty<input name="_gotcha" type="text" tabindex="-1" autocomplete="off"></label></div>
          <button class="btn primary" type="submit">Email me a quote</button>
          <p class="note" id="form-status" role="status" aria-live="polite">A written quote within one business day. No spam, no newsletter.</p>
        </form>
      </div>
    </div>
  </div>
</section>` + s.slice(cEnd);

// 9. Every #contact link -> #quote; nav button text
s = s.split('href="#contact"').join('href="#quote"');
s = s.split('>Meet your Bot</a>').join('>Get a quote</a>');
s = rep(s, `<h2>Ready to meet your Bot?</h2>`, `<h2>Ready to meet your Bot?</h2>`, F);

// 10. Footer
s = rep(s, `<p>Tailored AI agents for small business owners. Built in Columbus, Ohio by someone who runs his own business on one. Botticus is a service of SRL Logistics LLC.</p>`,
  `<p>Tailored AI agents for small business owners. Built in Columbus, Ohio by someone who runs his own business on one.</p>`, F);
s = rep(s, `<li><a href="#compare">Compare</a></li>\n        <li><a href="family.html">Family</a></li>`,
  `<li><a href="#compare">Compare</a></li>\n        <li><a href="websites.html">Websites</a></li>\n        <li><a href="family.html">Family</a></li>`, F);
s = rep(s, `<p class="legal">© 2026 Botticus. All rights reserved.`, `<p class="legal">Botticus is operated by SRL Logistics LLC, Columbus, Ohio. © 2026 Botticus. All rights reserved.`, F);

// 11. Nav: Websites -> its own page
s = rep(s, `<a href="#websites">Websites</a>`, `<a href="websites.html">Websites</a>`, F);
s = s.replace('css/style.css?v=6', 'css/style.css?v=7').replace('js/main.js?v=5', 'js/main.js?v=6');
write('index.html', s);

// ---------------------------------------------------------------- other pages
for (const file of ['demo.html', 'family.html', 'privacy.html']) {
  let t = read(file);
  t = t.split(`<a href="index.html#websites">Websites</a>`).join(`<a href="websites.html">Websites</a>`);
  t = t.split('href="index.html#contact"').join('href="index.html#quote"');
  t = t.split('>Meet your Bot</a>').join('>Get a quote</a>');
  t = t.split(`<p class="fine">A service of SRL Logistics LLC. <a href="privacy.html">Privacy</a></p>`).join(`<p class="fine">Botticus is operated by SRL Logistics LLC, Columbus, Ohio. <a href="privacy.html">Privacy</a></p>`);
  t = t.replace('css/style.css?v=6', 'css/style.css?v=7').replace('js/main.js?v=5', 'js/main.js?v=6');
  if (file === 'family.html') {
    t = rep(t, `<p>From 16, a teenager can have their own thread by text message. "When's practice?"`, `<p>From 16, a teenager can have their own Telegram thread, set up by a parent. "When's practice?"`, file);
    t = rep(t, `<li>From 16, a parent can set up a teen's thread. Only phone numbers you approve can reach the Bot, by text message. We do not put teens on a chat app whose own age rules say otherwise.</li>`,
      `<li>From 16, a parent can set up a teen's Telegram thread, where Telegram's own age rules allow it. Only accounts you approve can reach the Bot.</li>`, file);
    t = t.split(`by text message`).join(`on Telegram`);
    t = rep(t, `<a class="btn ghost" href="index.html#plans" style="color:var(--ink);border-color:var(--ink)">See the plans</a>`, `<a class="btn ghost" href="index.html#plans" style="color:var(--ink);border-color:var(--ink)">See the plans</a>`, file);
  }
  if (file === 'privacy.html') {
    t = t.replace(/<p>A Bot is built to run inside accounts the client owns and controls:([^<]*)<\/p>/, (m, rest) => `<p>A Bot works inside accounts the client owns and controls:${rest} It runs on a dedicated cloud server that Botticus provisions and manages for that client alone, and its AI requests go through Botticus's account with the model provider, which does not use them for training.</p>`);
  }
  write(file, t);
}

// ---------------------------------------------------------------- main.js: quote form
let js = read('js/main.js');
js = rep(js, `    formId: 'contact-form', statusId: 'form-status', formType: 'inquiry',
    subjectPrefix: 'Botticus inquiry: ',
    successText: 'Sent. I will reply within one business day.',
    fields: [
      { name: 'name', label: 'Name' }, { name: 'business', label: 'Business' },
      { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' },
      { name: 'size', label: 'Team size' }, { name: 'details', label: 'What eats your time' }
    ]`,
  `    formId: 'contact-form', statusId: 'form-status', formType: 'quote',
    subjectPrefix: 'Botticus quote request: ',
    successText: 'Got it. Your written quote will be in your inbox within one business day.',
    fields: [
      { name: 'name', label: 'Name' }, { name: 'business', label: 'Business' },
      { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' },
      { name: 'want', label: 'Looking for' }, { name: 'size', label: 'Team size' },
      { name: 'systems', label: 'Systems' }, { name: 'autonomy', label: 'Autonomy' },
      { name: 'details', label: 'What eats your time' }
    ]`, 'js/main.js');
write('js/main.js', js);

// ---------------------------------------------------------------- relay
let gs = read('tools/form-relay/Code.gs');
gs = rep(gs, `  var mockup = get('formType') === 'website-demo' || get('formType') === 'website-mockup';
  var subject = (mockup ? 'Botticus demo site: ' : 'Botticus inquiry: ') + (get('business') || get('name'));
  var body = (mockup ? [`,
  `  var mockup = get('formType') === 'website-demo' || get('formType') === 'website-mockup';
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
  ] : mockup ? [`, 'Code.gs');
write('tools/form-relay/Code.gs', gs);

// ---------------------------------------------------------------- sitemap
let sm = read('sitemap.xml');
sm = rep(sm, `<url><loc>https://botticus.com/family.html</loc></url>`, `<url><loc>https://botticus.com/websites.html</loc></url>\n  <url><loc>https://botticus.com/family.html</loc></url>`, 'sitemap.xml');
write('sitemap.xml', sm);
console.log('patched');
