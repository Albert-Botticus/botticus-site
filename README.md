# Botticus website

Static site for botticus.com (Botticus, tailored AI agents for small business owners; a service of SRL Logistics LLC). No build step. Same pattern as the SRL Logistics site (shipsrl-site).

- index.html, privacy.html
- css/, js/, img/
- Hosted on GitHub Pages from `main`; CNAME = botticus.com
- DNS at GoDaddy: A records to GitHub Pages (185.199.108.153, .109.153, .110.153, .111.153), CNAME `www` -> albert-botticus.github.io

## Contact form

`js/main.js` posts JSON (Content-Type `text/plain`, to avoid a CORS preflight) to a **Google Apps Script web
app** in Nathan's nlevysrl@gmail.com account, which emails the submission to hello@botticus.com with subject
`Botticus inquiry: <business or name>` and Reply-To set to the visitor. Source: `tools/form-relay/Code.gs`
(+ `.clasp.json`, script id `1vdIejxr4o7HJYVrZJXVD0bXaBbDlNILzIN6a4KN6HN2eTS-J8IiawLZN`). Deployed 2026-10-30
as version 1, deployment `AKfycbxO0iHYHOCovD6Lk4eGggo_VIIYffzFMnQFjbC0NfnBqitcsJanFDpd12RApKg2coeZUA`.

Why not a form service: Formspree's free SRL account is capped at two linked emails (both used); FormSubmit was
down (Cloudflare 521) and Web3Forms sits behind a bot check. The Apps Script costs nothing, has no vendor, and
fits the pitch (runs in your own account).

Changing the relay: edit `tools/form-relay/Code.gs`, then from `tools/form-relay`:

    clasp push --force
    clasp deploy --deploymentId AKfycbxO0iHYHOCovD6Lk4eGggo_VIIYffzFMnQFjbC0NfnBqitcsJanFDpd12RApKg2coeZUA --description "what changed"

`clasp push` only uploads source; visitors keep hitting the last *deployed* version until you deploy. Always
target the existing deployment ID: a bare `clasp deploy` creates a new deployment and loses the web-app entry
point. The URL never changes. Verify with a GET to `/exec`, which returns `{"ok":true,"service":"botticus-form-relay"}`.
A form field the deployed relay does not know about is silently dropped, so redeploy whenever a form gains a field.

Spam: `_gotcha` honeypot client-side (the relay also drops anything with it filled), 4,000-char field cap, and a
30-submissions-per-hour brake in the relay. No CAPTCHA, by choice.

Albert watches hello@ through `~/.openclaw/workspace/mail-alerts` (account `botticus`): any mail to the box
pings Telegram, and FormSubmit leads are highlighted "NEW LEAD: botticus.com".

## Images

`tools/make_botticus_images.py` renders `img/og-card.png` (1200x630 share card), `img/favicon-32.png`
and `img/favicon-180.png` from the brand values in `css/style.css`. Rendered with PIL rather than an
image model so the lettering is exact. Re-run `python tools/make_botticus_images.py` after a brand change.

## Things still to decide (as of 2026-10-30)

- ~~Contact email~~ **SETTLED 2026-10-30.** `hello@botticus.com` exists on Google Workspace and the lead path is
  proven end to end: the relay sends from `nlevysrl@gmail.com` and three test leads landed in the box, including
  one from the live form ("Botticus inquiry: Botticus QA (live form)"). Albert reads it over IMAP as account
  `botticus` in `mail-alerts/config.json`.
- Pricing: the plans deliberately show "quote on the call" instead of numbers.
- The 3D-print shop and social club case studies are unnamed on purpose until their owners agree to be named.
- The comparison table names Meta Muse and ChatGPT Dots (added 2026-10-30). Every claim came from Meta's/OpenAI's
  announcements or public reporting at that date (TechCrunch, CNBC, eesel, Syntax Dispatch). Re-check before
  editing: a wrong claim about a named competitor is a legal problem, a vague one is just weak copy.
