// Botticus site: mobile nav and the contact form.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // Hero chat examples: three tabs, auto-rotate every 7s until the visitor clicks one.
  var tabs = document.querySelectorAll('.chat-tab');
  var panes = document.querySelectorAll('.chat-pane');
  if (tabs.length && panes.length) {
    var order = Array.prototype.map.call(tabs, function (t) { return t.getAttribute('data-tab'); });
    var current = 0;
    var show = function (name) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === name;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panes.forEach(function (p) {
        var on = p.getAttribute('data-pane') === name;
        p.classList.toggle('active', on);
        if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      });
      current = order.indexOf(name);
    };
    var timer = setInterval(function () { show(order[(current + 1) % order.length]); }, 7000);
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { clearInterval(timer); show(t.getAttribute('data-tab')); });
    });
  }

  // The site is static, so the form posts to a Google Apps Script web app in Nathan's
  // own Google account (source: tools/form-relay/Code.gs), which emails the request to
  // hello@botticus.com. Content-Type is text/plain on purpose: it keeps the browser from
  // sending a CORS preflight, which Apps Script cannot answer. If the POST fails, it
  // falls back to opening the visitor's email client with the same text.
  var CONTACT_EMAIL = 'hello@botticus.com';
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxO0iHYHOCovD6Lk4eGggo_VIIYffzFMnQFjbC0NfnBqitcsJanFDpd12RApKg2coeZUA/exec';
  // One relay, two forms. Both post the same JSON shape to the Apps Script and are
  // told apart by formType, so the subject line says which one it was. Generalised
  // rather than copied so a fix to validation or the fallback reaches both.
  function wireRelayForm(opts) {
    var form = document.getElementById(opts.formId);
    if (!form) return;
    var sending = false;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = document.getElementById(opts.statusId);
      var button = form.querySelector('button[type="submit"]');
      var get = function (name) { var el = form.elements[name]; return el ? String(el.value || '').trim() : ''; };
      if (sending) return;
      // Honeypot: a real visitor never sees this field, so anything in it is a bot.
      if (get('_gotcha')) {
        if (status) status.textContent = 'Sent. I will reply shortly.';
        if (button) button.disabled = true;
        return;
      }
      if (!get('name') || !get('email')) {
        if (status) status.textContent = 'Please add your name and email so I can reply.';
        return;
      }
      // The form is novalidate, so the browser never checks the address. Without this a
      // typo still submits: the lead arrives, but the relay omits Reply-To because the
      // address is malformed, leaving no way to answer the person. Same test as Code.gs.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('email'))) {
        if (status) status.textContent = 'That email address does not look right. Please check it so I can reply.';
        var emailField = form.elements['email'];
        if (emailField && emailField.focus) emailField.focus();
        return;
      }
      var payload = { _gotcha: get('_gotcha'), formType: opts.formType };
      var lines = [];
      opts.fields.forEach(function (f) {
        payload[f.name] = get(f.name);
        lines.push(f.label + ': ' + get(f.name));
      });
      var subject = opts.subjectPrefix + (get('business') || get('name'));
      var text = lines.join('\n');
      var fallback = function (reason) {
        sending = false;
        if (button) button.disabled = false;
        if (status) status.textContent = 'That did not go through (' + reason + '). Opening your email app with the same message instead.';
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      };
      if (!FORM_ENDPOINT) { fallback('form not connected yet'); return; }
      sending = true;
      if (button) button.disabled = true;
      if (status) status.textContent = 'Sending...';
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (data) {
        if (!data || data.ok !== true) throw new Error((data && data.error) || 'rejected');
        sending = false;
        if (status) status.textContent = opts.successText;
        // Clear the fields and relabel the button rather than leaving an empty form
        // behind a dead Send. The button stays disabled so a second click cannot
        // duplicate the lead, but it now says why instead of looking broken.
        form.reset();
        if (button) { button.textContent = 'Sent'; button.disabled = true; }
      }).catch(function (err) { fallback(err && err.message ? err.message : 'network error'); });
    });
  }

  wireRelayForm({
    formId: 'contact-form', statusId: 'form-status', formType: 'inquiry',
    subjectPrefix: 'Botticus inquiry: ',
    successText: 'Sent. I will reply within one business day.',
    fields: [
      { name: 'name', label: 'Name' }, { name: 'business', label: 'Business' },
      { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' },
      { name: 'size', label: 'Team size' }, { name: 'details', label: 'What eats your time' }
    ]
  });

  wireRelayForm({
    formId: 'mockup-form', statusId: 'mockup-status', formType: 'website-mockup',
    subjectPrefix: 'Botticus website mockup: ',
    successText: 'Got it. Your mockup will be in your inbox within one business day.',
    fields: [
      { name: 'name', label: 'Name' }, { name: 'business', label: 'Business' },
      { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' },
      { name: 'city', label: 'City' }, { name: 'what', label: 'What the business does' },
      { name: 'services', label: 'Top three services' }, { name: 'notes', label: 'Anything else' }
    ]
  });
})();
