// ===== Replay viewer: camera angles, scrubbing, speed, video export =====
const RP = { on: false };
const RP_CAMS = [['auto', 'Auto'], ['chase', 'Chase'], ['tv', 'TV'], ['top', 'Top down'], ['heli', 'Helicopter']];
async function watchRow(tr, row, btn) {
  if (G.state !== 'menu' || !row) return; let rep = null; if (btn) btn.textContent = '…';
  if (CLOUD) { try { const r = await sb('GET', `laps?track=eq.${tr}&pid=eq.${encodeURIComponent(row.pid)}&select=replay,lap_ms`); if (r && r[0] && r[0].lap_ms === row.lap) rep = r[0].replay; } catch (e) { } }
  if (!decRep(rep) && row.pid === ACCT.pub) rep = localStorage.getItem('md_rep_' + tr);
  if (btn) btn.textContent = 'Watch';
  if (!decRep(rep)) return alert('There is no replay for this lap yet. Replays are saved with new personal bests.');
  openReplay(tr, rep, lookOf(row), row.name, row.lap);
}
function openReplay(track, rep, look, name, lapMs) {
  const L = decRep(rep); if (!L || L.length < 5) return alert('No replay for this lap.');
  G.cfg = { track, laps: 0, mode: 'tt' }; G.tr = buildTrack(track); G.smoke = []; G.snow = []; G.mp = false; G.tt = null; G.rem.clear(); G.ghost = null; G.ghostCar = null; G.wx = 'auto';
  const c = newCar(0, G.tr, 'rp', '', look.color || CFG.color); Object.assign(c, carLook(look)); c.name = '';
  Object.assign(RP, { on: true, L, t: 0, spd: 1, play: true, cam: 'auto', name: name || 'Driver', lap: lapMs || (L.length - 1) * 100, len: (L.length - 1) / 10, tvI: 0, autoT: 0, autoI: 0, rec: null, car: c, lastMode: null });
  RP.tv = []; const P = G.tr.pts, n = P.length, step = Math.max(1, Math.round(n / 9)); for (let i = 0; i < n; i += step) { const p = P[i], d = G.tr.dirs[i], s = (i / step) % 2 ? 1 : -1, off = G.tr.w * 1.6; RP.tv.push([p[0] - Math.sin(d) * off * s, p[1] + Math.cos(d) * off * s]); }
  RP.rot0 = G.rot; G.me = c; G.state = 'replay'; rpSample(0); G.cam.x = c.x; G.cam.y = c.y; G.cam.a = -c.a - Math.PI / 2; G.cam.z = Math.min(VW, VH) / 820;
  for (const s of ['menu', 'lobby', 'board', 'hud', 'speedo', 'mini', 'driftBox', 'hKeys']) if ($(s)) $(s).classList.add('hidden'); banner(''); try { sndUpdate({ speed: 0 }, false); } catch (e) { }
  rpUI();
}
function closeReplay() { if (RP.rec) try { RP.rec.stop(); } catch (e) { } RP.on = false; RP.rec = null; if ($('rpBar')) $('rpBar').classList.add('hidden'); G.rot = RP.rot0; toMenu(); }
function rpSample(t) {
  const L = RP.L, c = RP.car, k = Math.max(0, Math.min(L.length - 1.001, t * 10)), i = Math.floor(k), f = k - i;
  const P = L[Math.max(0, i - 1)], A = L[i], B = L[Math.min(L.length - 1, i + 1)], Q = L[Math.min(L.length - 1, i + 2)], f2 = f * f, f3 = f2 * f;
  const cr = (p0, p1, p2, p3) => 0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (3 * p1 - p0 - 3 * p2 + p3) * f3);
  const cd = (p0, p1, p2, p3) => 0.5 * ((p2 - p0) + 2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) * f + 3 * (3 * p1 - p0 - 3 * p2 + p3) * f2);
  const a1 = A[2], a0 = a1 + angDiff(P[2], a1), a2 = a1 + angDiff(B[2], a1), a3 = a2 + angDiff(Q[2], B[2]);
  if (Math.hypot(B[0] - A[0], B[1] - A[1]) > 300) { c.x = A[0]; c.y = A[1]; c.a = a1; c.vx = c.vy = 0; }
  else { c.x = cr(P[0], A[0], B[0], Q[0]); c.y = cr(P[1], A[1], B[1], Q[1]); c.a = cr(a0, a1, a2, a3); c.vx = cd(P[0], A[0], B[0], Q[0]) * 10; c.vy = cd(P[1], A[1], B[1], Q[1]) * 10; }
  c.speed = Math.hypot(c.vx, c.vy); c.slip = c.speed > 60 ? angDiff(Math.atan2(c.vy, c.vx), c.a) : 0; c.drift = Math.abs(c.slip) > 0.22 && c.speed > 220; c.steer = Math.max(-0.8, Math.min(0.8, -c.slip * 2)); c.brake = false;
}
function rpTick(dt) {
  const c = RP.car, base = Math.min(VW, VH) / 820, cam = G.cam;
  if (RP.play) { RP.t += dt * RP.spd; if (RP.t >= RP.len) { if (RP.rec) { RP.t = RP.len; RP.play = false; try { RP.rec.stop(); } catch (e) { } } else { RP.t = 0; G.smoke = []; } } }
  rpSample(RP.t);
  if (RP.play && c.drift && CFG.gfx.smoke && G.smoke.length < 140) { try { for (const p of wheelPos(c)) if (Math.random() < 0.35) G.smoke.push({ x: p.x !== undefined ? p.x : p[0], y: p.y !== undefined ? p.y : p[1], vx: (Math.random() - 0.5) * 40 - c.vx * 0.05, vy: (Math.random() - 0.5) * 40 - c.vy * 0.05, r: 12, life: 0, max: 0.8 + Math.random() * 0.6, col: c.smoke || '' }); } catch (e) { } }
  for (const p of G.smoke) { p.life += dt; p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt; p.r += dt * 28; } G.smoke = G.smoke.filter(p => p.life < p.max);
  let mode = RP.cam; if (mode === 'auto') { RP.autoT += dt; if (RP.autoT > 5) { RP.autoT = 0; RP.autoI = (RP.autoI + 1) % 3; } mode = ['chase', 'tv', 'top'][RP.autoI]; }
  const k = 1 - Math.exp(-dt * 5); let rot = false, zt = base, tx = c.x, ty = c.y;
  if (mode === 'chase') { rot = true; zt = base * (1.15 - Math.min(1, c.speed / 1400) * 0.3); tx = c.x + c.vx * 0.25; ty = c.y + c.vy * 0.25; const at = -c.a - Math.PI / 2; cam.a += angDiff(at, cam.a) * (1 - Math.exp(-dt * 4)); }
  else if (mode === 'top') { zt = base * 0.8; }
  else if (mode === 'tv') { let bi = RP.tvI, bd = Infinity; RP.tv.forEach((s, i) => { const d = Math.hypot(s[0] - c.x, s[1] - c.y); if (d < bd) { bd = d; bi = i; } }); const cur = RP.tv[RP.tvI], cd0 = Math.hypot(cur[0] - c.x, cur[1] - c.y); if (bi !== RP.tvI && bd < cd0 * 0.7) RP.tvI = bi; const s = RP.tv[RP.tvI], d = Math.hypot(s[0] - c.x, s[1] - c.y); tx = s[0] + (c.x - s[0]) * 0.8; ty = s[1] + (c.y - s[1]) * 0.8; zt = base * Math.max(0.5, Math.min(1.5, 1.6 - d / 900)); }
  else if (mode === 'heli') { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of G.tr.pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); } tx = (x0 + x1) / 2; ty = (y0 + y1) / 2; zt = Math.min(VW / (x1 - x0 + 500), VH / (y1 - y0 + 500)); }
  const jump = RP.lastMode !== mode; RP.lastMode = mode; if (jump && mode !== 'chase') { cam.x = tx; cam.y = ty; cam.z = zt; } if (jump && mode === 'chase') cam.a = -c.a - Math.PI / 2;
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.z += (zt - cam.z) * (1 - Math.exp(-dt * 3)); G.rot = rot;
  drawWorld(G.tr, cam, [c], rot);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(16, 16, 300, 58, 8); else ctx.rect(16, 16, 300, 58); ctx.fill();
  ctx.fillStyle = '#ff3b3b'; ctx.font = 'italic 900 13px Segoe UI, system-ui, sans-serif'; ctx.fillText((RP.rec ? '● REC  ' : '') + 'REPLAY · ' + String(G.tr.name || '').toUpperCase(), 28, 38);
  ctx.fillStyle = '#fff'; ctx.font = '800 18px Segoe UI, system-ui, sans-serif'; ctx.fillText(RP.name + '  ' + rpFmt(RP.t * 1000) + ' / ' + rpFmt(RP.lap), 28, 62);
  ctx.textAlign = 'right'; ctx.font = 'italic 900 15px Segoe UI, system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('MINI DRIFTERS', VW - 20, VH - 20);
  ctx.fillText(Math.round(c.speed / PX_PER_M * 3.6) + ' KM/H', VW - 20, 40);
  const sc = $('rpScrub'); if (sc && !RP.drag) sc.value = Math.round(RP.t / RP.len * 1000);
}
function rpFmt(ms) { ms = Math.max(0, Math.round(ms)); const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return m + ':' + String(s).padStart(2, '0') + '.' + String(ms % 1000).padStart(3, '0'); }
function rpUI() {
  let b = $('rpBar');
  if (!b) {
    b = document.createElement('div'); b.id = 'rpBar'; b.className = 'rpbar'; document.body.appendChild(b);
    b.innerHTML = `<button class="opt" id="rpPlay">Pause</button><input type="range" id="rpScrub" min="0" max="1000" value="0"><div class="row" id="rpSpd">${[0.25, 0.5, 1, 2].map(s => `<button class="opt" data-rs="${s}">${s}x</button>`).join('')}</div>
      <div class="row" id="rpCams">${RP_CAMS.map(([k, t]) => `<button class="opt" data-rc="${k}">${t}</button>`).join('')}</div><button class="opt" id="rpRec">Save video</button><button class="opt" id="rpX">Close</button>`;
    $('rpPlay').onclick = () => { RP.play = !RP.play; if (RP.play && RP.t >= RP.len) RP.t = 0; rpUI(); };
    const sc = $('rpScrub'); sc.oninput = () => { RP.drag = true; RP.t = sc.value / 1000 * RP.len; G.smoke = []; }; sc.onchange = () => { RP.drag = false; };
    b.querySelectorAll('[data-rs]').forEach(x => x.onclick = () => { RP.spd = +x.dataset.rs; rpUI(); });
    b.querySelectorAll('[data-rc]').forEach(x => x.onclick = () => { RP.cam = x.dataset.rc; RP.autoT = 0; rpUI(); });
    $('rpRec').onclick = rpRecord; $('rpX').onclick = closeReplay;
  }
  b.classList.remove('hidden'); $('rpPlay').textContent = RP.play ? 'Pause' : 'Play';
  b.querySelectorAll('[data-rs]').forEach(x => x.classList.toggle('on', +x.dataset.rs === RP.spd)); b.querySelectorAll('[data-rc]').forEach(x => x.classList.toggle('on', x.dataset.rc === RP.cam));
  $('rpRec').textContent = RP.rec ? 'Recording… (stop)' : 'Save video'; $('rpRec').classList.toggle('on', !!RP.rec);
}
function rpRecord() {
  if (RP.rec) { try { RP.rec.stop(); } catch (e) { } return; }
  if (!cv.captureStream || typeof MediaRecorder === 'undefined') return alert('Your browser cannot record video. Try Chrome, Edge or Firefox.');
  const mt = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(m => MediaRecorder.isTypeSupported(m)); if (!mt) return alert('Your browser cannot record video.');
  const chunks = [], r = new MediaRecorder(cv.captureStream(60), { mimeType: mt, videoBitsPerSecond: 8e6 });
  r.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  r.onstop = () => { RP.rec = null; rpUI(); if (!chunks.length) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(chunks, { type: mt })); a.download = 'mini-drifters-' + String(G.tr.name || 'track').replace(/\W+/g, '-').toLowerCase() + '-replay.' + (mt.includes('mp4') ? 'mp4' : 'webm'); document.body.appendChild(a); a.click(); a.remove(); };
  RP.t = 0; RP.play = true; G.smoke = []; RP.rec = r; r.start(250); rpUI();
}
document.addEventListener('keydown', e => { if (!RP.on || G.state !== 'replay') return; if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeReplay(); } else if (e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); $('rpPlay').click(); } }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-watch]'); if (!b) return; e.stopPropagation(); watchRow(LBT, LBROWS[+b.dataset.watch], b); });
