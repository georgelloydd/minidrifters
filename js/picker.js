// ===== Custom hex colour picker (replaces the browser's colour dialog for every colour input) =====
(function () {
  const RK = 'md_recent_hex';
  let box, sv, svg, dot, hue, knob, hexIn, prevOld, prevNew, recent, target = null, old = '', cur = { h: 0, s: 1, v: 1 }, raf = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const toHex = ({ h, s, v }) => { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return '#' + [f(5), f(3), f(1)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
  const fromHex = hx => { const n = parseInt(hx.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; return { h, s: mx ? d / mx : 0, v: mx }; };
  const norm = v => { v = String(v || '').trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + [...v.slice(1)].map(x => x + x).join(''); return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null; };
  const recents = () => { try { return JSON.parse(localStorage.getItem(RK) || '[]').filter(norm).slice(0, 10); } catch (e) { return []; } };
  function build() {
    box = document.createElement('div'); box.className = 'hxp hidden';
    box.innerHTML = `<div class="hxpHead"><b>Pick a colour</b><button class="hxpX" title="Cancel (Esc)">✕</button></div>
      <div class="hxpSV"><canvas width="240" height="150"></canvas><i class="hxpDot"></i></div>
      <div class="hxpHue"><i class="hxpKnob"></i></div>
      <div class="hxpRow"><div class="hxpPrev" title="Before / after"><span class="old"></span><span class="new"></span></div><input class="hxpHex" maxlength="7" spellcheck="false"><button class="hxpOk">Done</button></div>
      <div class="hxpRecentL">Recent</div><div class="hxpRecent"></div>`;
    document.body.appendChild(box);
    sv = box.querySelector('.hxpSV'); svg = sv.querySelector('canvas').getContext('2d'); dot = box.querySelector('.hxpDot'); hue = box.querySelector('.hxpHue'); knob = box.querySelector('.hxpKnob');
    hexIn = box.querySelector('.hxpHex'); prevOld = box.querySelector('.old'); prevNew = box.querySelector('.new'); recent = box.querySelector('.hxpRecent');
    const drag = (el, fn) => { el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture(e.pointerId); fn(e); const mv = ev => fn(ev), up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); }; el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); }); };
    drag(sv, e => { const r = sv.getBoundingClientRect(); cur.s = clamp((e.clientX - r.left) / r.width, 0, 1); cur.v = 1 - clamp((e.clientY - r.top) / r.height, 0, 1); paint(true); });
    drag(hue, e => { const r = hue.getBoundingClientRect(); cur.h = clamp((e.clientX - r.left) / r.width, 0, 0.9999) * 360; paint(true); });
    hexIn.addEventListener('input', () => { const v = norm(hexIn.value); hexIn.classList.toggle('bad', !v); if (v) { cur = fromHex(v); paint(true, true); } });
    hexIn.addEventListener('keydown', e => { if (e.key === 'Enter') close(true); });
    box.querySelector('.hxpOk').onclick = () => close(true);
    box.querySelector('.hxpX').onclick = () => close(false);
    prevOld.onclick = () => { cur = fromHex(old); paint(true); };
  }
  function paint(emit, keepHex) {
    const W = 240, H = 150; svg.fillStyle = toHex({ h: cur.h, s: 1, v: 1 }); svg.fillRect(0, 0, W, H);
    let g = svg.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); svg.fillStyle = g; svg.fillRect(0, 0, W, H);
    g = svg.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); svg.fillStyle = g; svg.fillRect(0, 0, W, H);
    const hx = toHex(cur); dot.style.left = cur.s * 100 + '%'; dot.style.top = (1 - cur.v) * 100 + '%'; dot.style.background = hx;
    knob.style.left = cur.h / 3.6 + '%'; knob.style.background = toHex({ h: cur.h, s: 1, v: 1 }); prevNew.style.background = hx;
    if (!keepHex) { hexIn.value = hx.toUpperCase(); hexIn.classList.remove('bad'); }
    if (emit && target) { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!target) return; target.value = hx; target.dispatchEvent(new Event('input', { bubbles: true })); }); }
  }
  function drawRecent() {
    const r = recents(); box.querySelector('.hxpRecentL').classList.toggle('hidden', !r.length); recent.innerHTML = '';
    r.forEach(c => { const b = document.createElement('button'); b.style.background = c; b.title = c.toUpperCase(); b.onclick = () => { cur = fromHex(c); paint(true); }; recent.appendChild(b); });
  }
  function open(inp) {
    if (!box) build(); if (target && target !== inp) close(true);
    target = inp; old = norm(inp.value) || '#ffffff'; cur = fromHex(old); prevOld.style.background = old;
    const lbl = inp.closest('[data-cat],.prow,.xprow'), t = lbl && lbl.querySelector('b'); box.querySelector('.hxpHead b').textContent = t ? t.textContent.split('·')[0].trim() + ' colour' : 'Pick a colour';
    box.classList.remove('hidden'); drawRecent(); paint(false);
    const r = inp.getBoundingClientRect(), bw = box.offsetWidth, bh = box.offsetHeight;
    let top = r.bottom + 8; if (top + bh > innerHeight - 8) top = Math.max(8, r.top - bh - 8);
    box.style.left = clamp(r.left + r.width / 2 - bw / 2, 8, innerWidth - bw - 8) + 'px'; box.style.top = top + 'px';
    if (typeof sndUi === 'function') try { sndUi('click'); } catch (e) { }
  }
  function close(commit) {
    if (!box || !target) return; const t = target, hx = toHex(cur);
    if (commit) { if (hx !== old) { try { localStorage.setItem(RK, JSON.stringify([hx, ...recents().filter(c => c !== hx)].slice(0, 10))); } catch (e) { } t.value = hx; t.dispatchEvent(new Event('input', { bubbles: true })); t.dispatchEvent(new Event('change', { bubbles: true })); } }
    else { t.value = old; t.dispatchEvent(new Event('input', { bubbles: true })); }
    cancelAnimationFrame(raf); target = null; box.classList.add('hidden');
  }
  const isCol = el => el && el.closest && el.closest('input[type=color]');
  document.addEventListener('click', e => { const i = isCol(e.target); if (!i) return; e.preventDefault(); e.stopPropagation(); open(i); }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && target) { close(false); e.stopPropagation(); return; } const i = isCol(e.target); if (i && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(i); } }, true);
  document.addEventListener('pointerdown', e => { if (target && box && !box.contains(e.target) && !isCol(e.target)) close(true); }, true);
  window.addEventListener('resize', () => close(true));
  window.hexPicker = { open, close };
})();
