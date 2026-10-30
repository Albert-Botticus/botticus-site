# Botticus website

Static site for botticus.com (Botticus, tailored AI agents for small business owners; a service of SRL Logistics LLC). No build step. Same pattern as the SRL Logistics site (shipsrl-site).

- index.html, privacy.html
- css/, js/, img/
- Hosted on GitHub Pages from `main`; CNAME = botticus.com
- DNS at GoDaddy: A records to GitHub Pages (185.199.108.153, .109.153, .110.153, .111.153), CNAME `www` -> albert-botticus.github.io

## Contact form

`js/main.js` posts JSON to **FormSubmit** (`https://formsubmit.co/ajax/hello@botticus.com`), which emails the
submission to hello@botticus.com with subject `Botticus inquiry: <business or name>`. No account and no fee;
the address was activated once (2026-10-30) by clicking FormSubmit's confirmation email in the hello@ inbox.
Formspree was not used because the free SRL Formspree account is capped at two linked emails, both in use.

Spam: the `_gotcha` honeypot is checked client-side; `_captcha: 'false'` turns off FormSubmit's captcha page
(it is an AJAX call, so the captcha page would never render anyway). If spam becomes a problem, set
`_captcha` to `'true'` and switch to a normal form POST.

Albert watches hello@ through `~/.openclaw/workspace/mail-alerts` (account `botticus`): any mail to the box
pings Telegram, and FormSubmit leads are highlighted "NEW LEAD: botticus.com".

## Things still to decide (as of 2026-10-30)

- Contact email: the site says `hello@botticus.com`, which does not exist yet. Either create it (Google Workspace or
  GoDaddy email forwarding) or change it site-wide.
- Pricing: the plans deliberately show "quote on the call" instead of numbers.
- The 3D-print shop and social club case studies are unnamed on purpose until their owners agree to be named.
- The comparison table names Meta Muse and ChatGPT Dots (added 2026-10-30). Every claim came from Meta's/OpenAI's
  announcements or public reporting at that date (TechCrunch, CNBC, eesel, Syntax Dispatch). Re-check before
  editing: a wrong claim about a named competitor is a legal problem, a vague one is just weak copy.
