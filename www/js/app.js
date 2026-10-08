(function () {
  'use strict';

  /* ---------- 5:00 countdown with rolling digits ---------- */
  var TOTAL = 5 * 60;        // seconds
  var HOLD_AT_ZERO = 2000;   // ms to show 00:00 before the demo restarts
  var digits = Array.prototype.slice.call(document.querySelectorAll('#timer .digit'));
  var endAt = 0;

  function roll(el, val) {
    if (el.dataset.v === val) return;
    var old = el.firstElementChild;
    el.dataset.v = val;
    var next = document.createElement('span');
    next.textContent = val;
    if (!old) { next.style.transition = 'none'; el.appendChild(next); return; }
    next.style.transform = 'translateY(100%)';
    el.appendChild(next);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        old.style.transform = 'translateY(-100%)';
        next.style.transform = 'translateY(0)';
      });
    });
    setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 520);
  }

  function render(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    var t = (m < 10 ? '0' : '') + m + (s < 10 ? '0' : '') + s;
    for (var i = 0; i < 4; i++) roll(digits[i], t.charAt(i));
  }

  function start() {
    endAt = Date.now() + TOTAL * 1000;
    render(TOTAL);
  }

  function tick() {
    var left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    render(left);
    if (left === 0 && !tick.waiting) {
      tick.waiting = true;
      setTimeout(function () { tick.waiting = false; start(); }, HOLD_AT_ZERO);
    }
  }

  start();
  setInterval(tick, 200);

  /* ---------- random placeholder QR (encodes a demo string only) ---------- */
  function randomPayload(n) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var out = 'DEMO-NOT-A-VALID-TICKET|';
    var buf = new Uint32Array(n);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    for (var i = 0; i < n; i++) out += chars.charAt(buf[i] % chars.length);
    return out;
  }

  function drawQR(host) {
    var qr = qrcode(0, 'L');
    qr.addData(randomPayload(520));
    qr.make();
    var n = qr.getModuleCount(), q = 2, size = n + q * 2, d = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + (c + q) + ' ' + (r + q) + 'h1v1h-1z';
      }
    }
    host.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size +
      '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/>' +
      '<path d="' + d + '" fill="#000"/></svg>';
  }

  drawQR(document.getElementById('qr'));
})();
