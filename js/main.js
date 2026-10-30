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

  // The site is static, so the form posts to FormSubmit (formsubmit.co), which emails
  // the request to hello@botticus.com. No account: the address was activated once by
  // clicking FormSubmit's confirmation email. If the POST fails, it falls back to
  // opening the visitor's email client with the same text.
  var CONTACT_EMAIL = 'hello@botticus.com';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + CONTACT_EMAIL;
  var form = document.getElementById('contact-form');
  if (form) {
    var sending = false;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = document.getElementById('form-status');
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
      var lines = [
        'Name: ' + get('name'),
        'Business: ' + get('business'),
        'Email: ' + get('email'),
        'Phone: ' + get('phone'),
        'Team size: ' + get('size'),
        '',
        'What eats your time:',
        get('details')
      ];
      var subject = 'Botticus inquiry: ' + (get('business') || get('name'));
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
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: subject, _template: 'table', _captcha: 'false', _replyto: get('email'),
          kind: 'BOTTICUS_INQUIRY', name: get('name'), business: get('business'),
          email: get('email'), phone: get('phone'), size: get('size'), message: text
        })
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (data) {
        if (!data || String(data.success) !== 'true') throw new Error('rejected');
        sending = false;
        if (status) status.textContent = 'Sent. I will reply within one business day.';
        form.reset();
      }).catch(function (err) { fallback(err && err.message ? err.message : 'network error'); });
    });
  }
})();
