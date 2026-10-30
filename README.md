# Botticus website

Static site for botticus.com (Botticus, tailored AI agents for small business owners; a service of SRL Logistics LLC). No build step. Same pattern as the SRL Logistics site (shipsrl-site).

- index.html, demo.html (free demo-site offer; mockup.html redirects to it), privacy.html
- demo/<slug>/ : generated demo sites, published by the pipeline in ~/.openclaw/workspace/botticus-demo (never hand-edit; re-render from the saved spec instead)
- css/, js/, img/
- Hosted on GitHub Pages from `main`; CNAME = botticus.com
- DNS at GoDaddy: A records to GitHub Pages (185.199.108.153, .109.153, .110.153, .111.153), CNAME `www` -> albert-botticus.github.io

## Contact form

`js/main.js` posts JSON (Content-Type `text/plain`, to avoid a CORS preflight) to a **Google Apps Script web
app** in Nathan's nlevysrl@gmail.com account, which emails the submission to hello@botticus.com with subject
`Botticus inquiry: <business or name>` (contact form) or `Botticus demo site: <business>` (demo form, formType
`website-demo`) and Reply-To set to the visitor. One `wireRelayForm()` serves both forms; extend it, never copy it. Source: `tools/form-relay/Code.gs`
(+ `.clasp.json`, script id `1vdIejxr4o7HJYVrZJXVD0bXaBbDlNILzIN6a4KN6HN2eTS-J8IiawLZN`). Deployment (at @4 since 2026-10-30 evening) `AKfycbxO0iHYHOCovD6Lk4eGggo_VIIYffzFMnQFjbC0NfnBqitcsJanFDpd12RApKg2coeZUA`.

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
pings Telegram, and relay leads (both subjects) are highlighted "NEW LEAD: botticus.com". Demo requests are
then picked up by the `botticus-mockup-pipeline` cron, which builds the site and emails the link from hello@.

## Wording

Botticus is the company. The product is "a Bot" ("Meet your Bot"), never "a Botticus". The free website offer
is a **demo site**, never a mockup (Nathan, 2026-10-30 evening). Messaging a Bot is the paid product; the demo
iterates by email and has no chat widget.

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
- The comparison table names Meta Muse, ChatGPT Dots and xAI's Grok Bot (Grok Bot added 2026-10-30 evening). Every claim
  came from the vendors' announcements or public reporting at that date (TechCrunch, CNBC, eesel, Syntax Dispatch;
  for Grok Bot: VentureBeat launch coverage 2026-08-11, Vellum, eesel pricing, Coursiv, Paralect's October update).
  Grok Bot is a beta whose plans changed several times in Aug-Oct 2026; re-check the Cost cell before quoting it. Re-check before
  editing: a wrong claim about a named competitor is a legal problem, a vague one is just weak copy.

## Family page and kids (2026-10-30)

`family.html` sells the household side: school portals in one digest, self-routing calendar, teens (16+)
texting the Bot, kids' sites requested by a parent, and the rest. **Nathan, 2026-10-30: children under 16
never interact with the Bot.** It runs their logistics through the parent. One site, one product; no business/personal fork and no separate
family tier. The Plans lead says a household-only Bot starts smaller than Starter.

**Kids and third-party terms, checked 2026-10-30 (re-check before any change to this section):**
- Telegram's ToS requires 18+ in the EU, UK and Australia and publishes no general minimum elsewhere;
  WhatsApp is 13+ in the US (16+ in Europe). So nobody under 16 gets a thread at all, and teens 16+ reach the Bot by SMS/iMessage from a phone on the parent's plan or a family device, with the
  Bot's number approved under Apple child-account Allowed Contacts or Google Family Link.
- Anthropic: consumer products are 18+ and the Usage Policy forbids "services that route requests
  through consumer subscriptions". Any Bot a child can talk to (and, read literally, any client Bot)
  must run on the commercial API, not a Claude.ai/Max subscription. Anthropic's "Guidelines for
  Organizations Serving Minors" then require: age verification (here: parent-controlled allowlist of
  numbers), content moderation/filtering (kid mode), monitoring and reporting (parents see every
  message), educational guidance, the child-safety system prompt, AI disclosure at the start of each
  thread, and a public compliance statement on the website. The "Kids, safely" section is that statement;
  every claim in it must stay true in the build.
- COPPA (amended rule effective 2025-06-23): Botticus does not collect children's data itself; anything
  the Bot knows about a child comes from a parent, inside the family's own accounts. Kids' sites carry
  first name only, no photo, school or address, and need parental approval. Lawyer review (Lorin
  Westfall) still recommended before marketing the kids' features hard.
