// ===== Rocket launcher (granted per player from the dev site's Troll tab) + exploding cars =====
// Press the Rocket key (X by default) to fire. Each driver's own game decides whether a rocket hit THEIR car:
// they explode, see a death screen, then respawn at their last checkpoint. Everyone else sees the blast.
const RK = { SPEED: 1700, LIFE: 2.2, COOL: 1.6, HIT: 34, DEAD: 3, SHIELD: 2, AUTO: 100 };
G.rk = []; G.boom = [];
(function () {
  const st = document.createElement('style');
  st.textContent = `#deathScr{position:fixed;inset:0;z-index:40;display:none;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;background:radial-gradient(ellipse at center,rgba(90,0,0,.35),rgba(20,0,0,.82));text-align:center;text-shadow:0 6px 24px rgba(0,0,0,.8)}
#deathScr h1{margin:0;font-size:86px;font-weight:900;font-style:italic;letter-spacing:3px;color:var(--red,#ff2a2a)}#deathScr p{margin:6px 0;font-size:24px;font-weight:800;color:#eee}#deathScr b{color:#ffd400}
#rkHud{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:20;display:none;pointer-events:none;background:rgba(10,10,11,.72);border:1px solid var(--line,#2a2a30);border-left:3px solid var(--red,#ff2a2a);border-radius:6px;padding:6px 14px 7px;min-width:150px;color:#f2f2f2}
#rkHud small{display:block;font-size:10px;letter-spacing:2px;color:var(--dim,#8a8a94);font-weight:800}
#rkHud .rkr{display:flex;align-items:center;gap:8px;margin-top:2px}#rkHud .rkk{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 7px;border:1px solid #4a4a52;border-bottom-width:3px;border-radius:5px;background:#1b1b20;font-size:13px;font-weight:900;font-style:normal}
#rkHud .rkr b{font-size:18px;font-weight:900;font-style:italic;letter-spacing:.5px}#rkHud.cool .rkr b{color:var(--dim,#8a8a94)}
#rkHud i{display:block;height:3px;border-radius:2px;background:#2a2a30;margin-top:6px;overflow:hidden}#rkHud i u{display:block;height:100%;width:100%;background:#ffb020;transform-origin:left}
body.touch #rkHud{bottom:calc(150px + env(safe-area-inset-bottom))}`;
  document.head.appendChild(st);
  const d = document.createElement('div'); d.id = 'deathScr'; d.innerHTML = '<h1>💥 WRECKED</h1><p id="dsBy"></p><p id="dsIn"></p>'; document.body.appendChild(d);
  const h = document.createElement('div'); h.id = 'rkHud'; h.innerHTML = '<small>ROCKET</small><div class="rkr"><span class="rkk" id="rkKey">X</span><b id="rkSt">FIRE</b></div><i><u id="rkBar"></u></i>'; document.body.appendChild(h);
})();

function rkAllowed() { if (G.spec) return false; return !!((typeof TWEAKS !== 'undefined' && TWEAKS.rl) || (G.cfg && G.cfg.pvp && G.mp && !G.tt)); }
// a launcher pod on the roof of every car that can fire: you (when allowed) and everyone in a PvP race
function rkCarOn(c) { if (!G.me || G.state === 'menu' || G.state === 'lobby' || G.state === 'replay') return false; if (c === G.me) return rkAllowed() && !c.dead; return !!(G.cfg && G.cfg.pvp && G.mp && !G.tt); }
function rkCarLoad(c) { if (c !== G.me || TWEAKS.rnc || TWEAKS.raf) return 1; return 1 - Math.max(0, ((c.rkReady || 0) - performance.now()) / (RK.COOL * 1000)); }
function rkReset() { G.rk = []; G.boom = []; if (G.me) { G.me.dead = 0; G.me.shield = 0; G.me.rkReady = 0; } const d = $('deathScr'); if (d) d.style.display = 'none'; const h = $('rkHud'); if (h) h.style.display = 'none'; }
function rkName(id) { if (id === myId()) return CFG.name; const r = G.rem.get(id); return r ? r.car.name : 'Driver'; }
function rkColor(id) { if (id === myId()) return CFG.color; const r = G.rem.get(id); return r ? r.car.color : '#ff8c1a'; }

function rkFlush(force) {
  const now = performance.now(); if (!G.rkOut || !G.rkOut.length || (!force && now - (G.rkFlushT || 0) < 80)) return; G.rkFlushT = now;
  const rs = G.rkOut.filter(r => r.life > 0).map(r => ({ id: r.id, x: Math.round(r.x), y: Math.round(r.y), vx: Math.round(r.vx), vy: Math.round(r.vy), q: r.q ? 1 : 0 })); G.rkOut = [];
  if (G.mp && rs.length) netSend({ t: 'rk', rid: G.rid, rs: rs.slice(0, 40) });
}
// one rocket. quiet = part of a rapid-fire stream (no per-rocket sound, smoke or end blast)
function rocketShoot(quiet) {
  const me = G.me, now = performance.now(), sp = quiet ? (Math.random() - 0.5) * 0.24 : 0, a = me.a + sp, f = quiet ? 0.9 + Math.random() * 0.2 : 1;
  const fx = Math.cos(a), fy = Math.sin(a), id = myId() + '-' + (G.rkN = (G.rkN || 0) + 1);
  const r = { id, from: myId(), x: me.x + Math.cos(me.a) * CAR.L * 0.6, y: me.y + Math.sin(me.a) * CAR.L * 0.6, vx: me.vx + fx * RK.SPEED * f, vy: me.vy + fy * RK.SPEED * f, life: RK.LIFE, name: me.name, color: me.color, q: quiet };
  if (G.rk.length < 450) G.rk.push(r);
  if (!quiet || now - (G.rkSnd || 0) > 90) { G.rkSnd = now; sndBurst(0.35, 1800, 0.35, 'bandpass'); sndBurst(0.5, 500, 0.3); }
  (G.rkOut = G.rkOut || []).push(r); rkFlush(!quiet);
}
function rocketFire() {
  const me = G.me; if (!me || G.state !== 'race' || !rkAllowed() || me.dead || me.finished || TWEAKS.raf) return; // auto-fire is handled in rocketTick
  const now = performance.now(); if (now < (me.rkReady || 0) && !TWEAKS.rnc) return; me.rkReady = now + RK.COOL * 1000;
  rocketShoot(false);
}
function boomFx(x, y, col) {
  const sp = []; for (let i = 0; i < 16; i++) { const a = Math.random() * 6.283, v = 120 + Math.random() * 380; sp.push([Math.cos(a) * v, Math.sin(a) * v, 2 + Math.random() * 3]); }
  G.boom.push({ x, y, t: 0, max: 0.95, col: col || '#ff8c1a', sp, id: (G.boomN = (G.boomN || 0) + 1) }); if (G.boom.length > 12) G.boom.shift();
  sndBurst(0.9, 260, 0.9); sndBurst(0.5, 1400, 0.4); sndClank(900);
}
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0; return Math.hypot(px - (ax + dx * t), py - (ay + dy * t)); }

function rocketHit(r) {
  const me = G.me, now = performance.now(); G.rk = G.rk.filter(q => q !== r);
  me.dead = now + RK.DEAD * 1000; me.deadBy = r.name; me.vx = me.vy = 0; me.speed = 0; me.cur = 0; me.combo = 1; me.comboT = 0; me.drift = false; me.rwL = me.rwR = null;
  boomFx(me.x, me.y, me.color);
  if (G.mp) netSend({ t: 'boom', rid: G.rid, rk: r.id, by: r.from, x: Math.round(me.x), y: Math.round(me.y) });
  $('dsBy').innerHTML = 'Blown up by <b></b>'; $('dsBy').querySelector('b').textContent = r.name; $('deathScr').style.display = 'flex';
}
function rocketRespawn() {
  const me = G.me; me.dead = 0; me.shield = performance.now() + RK.SHIELD * 1000; $('deathScr').style.display = 'none';
  if (G.tt) ttCheckpoint(); else raceCheckpoint(); G.splitBad = me.lapStart;
}
// called every frame from the game loop
function rocketTick(dt, now) {
  const me = G.me, live = G.state === 'race' || G.state === 'countdown' || G.state === 'over';
  const hud = $('rkHud'); if (!live || !me) { if (hud) hud.style.display = 'none'; return; }
  const ok = rkAllowed(); if (ok && !G.rlSeen) { G.rlSeen = true; pop('🚀 ' + (G.cfg && G.cfg.pvp ? 'PVP ON · ' : 'ROCKET LAUNCHER · ') + (TWEAKS.raf ? 'hold ' : 'press ') + keyName(CFG.keys.rocket), '#ffb020'); } if (!ok) G.rlSeen = false;
  if (ok && TWEAKS.raf && G.state === 'race' && !me.dead && !me.finished && KEYS[CFG.keys.rocket]) { G.rkAcc = Math.min(8, (G.rkAcc || 0) + dt * RK.AUTO); while (G.rkAcc >= 1) { G.rkAcc--; rocketShoot(true); } } else G.rkAcc = 0;
  rkFlush(false);
  hud.style.display = ok && G.state === 'race' ? 'block' : 'none';
  if (ok) { const left = TWEAKS.rnc || TWEAKS.raf ? 0 : Math.max(0, ((me.rkReady || 0) - now) / (RK.COOL * 1000)), kn = keyName(CFG.keys.rocket), stx = me.dead ? 'WRECKED' : TWEAKS.raf ? 'HOLD TO FIRE' : left > 0 ? 'RELOADING' : 'FIRE';
    if ($('rkKey').textContent !== kn) $('rkKey').textContent = kn; if ($('rkSt').textContent !== stx) $('rkSt').textContent = stx; hud.classList.toggle('cool', left > 0 || !!me.dead); $('rkBar').style.transform = 'scaleX(' + (1 - left) + ')'; $('rkBar').style.background = left > 0 ? '#5a5a62' : '#ffb020'; }
  for (let i = G.rk.length - 1; i >= 0; i--) {
    const r = G.rk[i], ox = r.x, oy = r.y; r.x += r.vx * dt; r.y += r.vy * dt; r.life -= dt; r.sm = (r.sm || 0) - dt;
    if (r.sm <= 0 && CFG.gfx.smoke && !r.q && G.rk.length < 24) { r.sm = 0.025; G.smoke.push({ x: r.x - r.vx * 0.01, y: r.y - r.vy * 0.01, vx: 0, vy: 0, r: 7, life: 0, max: 0.5, col: '' }); }
    if (r.from !== myId() && !me.dead && !me.finished && now > (me.shield || 0) && G.state === 'race' && segDist(me.x, me.y, ox, oy, r.x, r.y) < RK.HIT) { rocketHit(r); continue; }
    if (r.life <= 0) { G.rk.splice(i, 1); if (!r.q) boomFx(r.x, r.y, '#ffb020'); }
  }
  for (let i = G.boom.length - 1; i >= 0; i--) { const b = G.boom[i]; b.t += dt; if (b.t >= b.max) G.boom.splice(i, 1); }
  if (me.dead) { me.vx = me.vy = 0; const left = Math.max(0, (me.dead - now) / 1000); $('dsIn').textContent = 'Respawning in ' + Math.ceil(left) + '…'; if (now >= me.dead) rocketRespawn(); }
}
function drawRocketFx(g) {
  const now = performance.now();
  const lite = G.rk.length > 40;
  for (const r of G.rk) {
    if (lite) { g.strokeStyle = '#ffb020'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(r.x - r.vx * 0.022, r.y - r.vy * 0.022); g.lineTo(r.x, r.y); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(r.x, r.y, 3, 0, 7); g.fill(); continue; }
    const a = Math.atan2(r.vy, r.vx), spd = Math.hypot(r.vx, r.vy) || 1, ux = r.vx / spd, uy = r.vy / spd;
    g.save(); g.lineCap = 'round'; for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(205,205,215,${0.2 - k * 0.055})`; g.lineWidth = 7 + k * 6; g.beginPath(); g.moveTo(r.x - ux * 22, r.y - uy * 22); g.lineTo(r.x - ux * (80 + k * 45), r.y - uy * (80 + k * 45)); g.stroke(); } g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; const gx = r.x - ux * 18, gy = r.y - uy * 18, gl = g.createRadialGradient(gx, gy, 1, gx, gy, 36); gl.addColorStop(0, 'rgba(255,190,80,.6)'); gl.addColorStop(1, 'rgba(255,90,0,0)'); g.fillStyle = gl; g.fillRect(gx - 36, gy - 36, 72, 72); g.restore();
    g.save(); g.translate(r.x, r.y); g.rotate(a); drawRocketShape(g, r.color || '#ff2a2a', 1.3, 0.75 + Math.random() * 0.5); g.restore();
  }
  for (const b of G.boom) {
    const k = b.t / b.max, R = 30 + 150 * Math.sqrt(k); g.save(); g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, R); gr.addColorStop(0, `rgba(255,240,170,${0.95 * (1 - k)})`); gr.addColorStop(0.35, `rgba(255,140,30,${0.75 * (1 - k)})`); gr.addColorStop(1, 'rgba(200,30,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(b.x, b.y, R, 0, 7); g.fill();
    g.strokeStyle = `rgba(255,220,160,${0.8 * (1 - k)})`; g.lineWidth = 5 * (1 - k) + 1; g.beginPath(); g.arc(b.x, b.y, R * 1.25, 0, 7); g.stroke();
    for (const s of b.sp) { const d = b.t; g.fillStyle = `rgba(255,${Math.round(200 - 150 * k)},60,${1 - k})`; g.beginPath(); g.arc(b.x + s[0] * d, b.y + s[1] * d, s[2] * (1 - k) + 0.5, 0, 7); g.fill(); }
    g.restore();
    g.fillStyle = `rgba(20,20,22,${0.55 * (1 - k)})`; g.beginPath(); g.arc(b.x, b.y - 20 * k, R * 0.55, 0, 7); g.fill();
  }
}
// ---- network: shots and hits are relayed through the host (see hostData in net.js) ----
netOn('rk', d => {
  if (!G.me || (G.state !== 'race' && G.state !== 'countdown') || d.from === myId() || (d.rid || 0) !== G.rid) return; const list = Array.isArray(d.rs) ? d.rs.slice(0, 40) : [];
  for (const r of list) {
    if (!r || G.rk.length > 450) break; const x = +r.x, y = +r.y, vx = +r.vx, vy = +r.vy;
    if (![x, y, vx, vy].every(isFinite) || Math.hypot(vx, vy) > 4000) continue;
    G.rk.push({ id: String(r.id).slice(0, 40), from: d.from, x, y, vx, vy, life: RK.LIFE, name: rkName(d.from), color: rkColor(d.from), q: r.q ? 1 : 0 });
  }
});
netOn('boom', d => {
  if (!G.me || d.from === myId() || (d.rid || 0) !== G.rid) return; const x = +d.x, y = +d.y; if (!isFinite(x) || !isFinite(y)) return;
  G.rk = G.rk.filter(q => q.id !== d.rk); const r = G.rem.get(d.from), nm = rkName(d.from); boomFx(x, y, r ? r.car.color : '#ff8c1a'); if (r) r.car.deadUntil = performance.now() + RK.DEAD * 1000;
  if (d.by === myId()) pop('💥 You blew up ' + nm, '#ffb020'); else pop('💥 ' + nm + ' was blown up', '#ff6b6b');
});
