# Botticus website

Static site for botticus.com (Botticus, tailored AI agents for small business owners; a service of SRL Logistics LLC). No build step. Same pattern as the SRL Logistics site (shipsrl-site).

- index.html, privacy.html
- css/, js/, img/
- Hosted on GitHub Pages from `main`; CNAME = botticus.com
- DNS at GoDaddy: A records to GitHub Pages (185.199.108.153, .109.153, .110.153, .111.153), CNAME `www` -> albert-botticus.github.io

## Contact form

`js/main.js` posts JSON to Formspree when `FORM_ENDPOINT` is set. It is **empty** until a Botticus form is
created on Formspree, so right now every submission falls back to opening the visitor's email app addressed to
`hello@botticus.com`. To connect it: create a form on formspree.io that emails the Botticus inbox, paste its
endpoint into `FORM_ENDPOINT`, and bump `main.js?v=`.

The honeypot field `_gotcha` is checked client-side and by Formspree. No CAPTCHA, by choice.

## Things still to decide (as of 2026-10-30)

- Contact email: the site says `hello@botticus.com`, which does not exist yet. Either create it (Google Workspace or
  GoDaddy email forwarding) or change it site-wide.
- Pricing: the plans deliberately show "quote on the call" instead of numbers.
- The 3D-print shop and social club case studies are unnamed on purpose until their owners agree to be named.
- The comparison table names Meta Muse and ChatGPT Dots (added 2026-10-30). Every claim came from Meta's/OpenAI's
  announcements or public reporting at that date (TechCrunch, CNBC, eesel, Syntax Dispatch). Re-check before
  editing: a wrong claim about a named competitor is a legal problem, a vague one is just weak copy.
