// ===== Rocket launcher (granted per player from the dev site's Troll tab) + exploding cars =====
// Press the Rocket key (X by default) to fire. Each driver's own game decides whether a rocket hit THEIR car:
// they explode, see a death screen, then respawn at their last checkpoint. Everyone else sees the blast.
const RK = { SPEED: 1700, LIFE: 2.2, COOL: 1.6, HIT: 34, DEAD: 3, SHIELD: 2, AUTO: 100 };
G.rk = []; G.boom = [];
(function () {
  const st = document.createElement('style');
  st.textContent = `#deathScr{position:fixed;inset:0;z-index:40;display:none;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;background:radial-gradient(ellipse at center,rgba(90,0,0,.35),rgba(20,0,0,.82));text-align:center;text-shadow:0 6px 24px rgba(0,0,0,.8)}
#deathScr h1{margin:0;font-size:86px;font-weight:900;font-style:italic;letter-spacing:3px;color:var(--red,#ff2a2a)}#deathScr p{margin:6px 0;font-size:24px;font-weight:800;color:#eee}#deathScr b{color:#ffd400}
#rkHud{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:20;display:none;pointer-events:none;background:rgba(12,12,14,.9);border:1px solid #2a2a30;border-left:3px solid var(--red,#ff2a2a);border-radius:8px;padding:6px 14px;font-weight:900;font-style:italic;letter-spacing:1px;font-size:14px;color:#eee;min-width:170px;text-align:center}
#rkHud i{display:block;height:4px;border-radius:2px;background:#2a2a30;margin-top:5px;overflow:hidden}#rkHud i u{display:block;height:100%;width:100%;background:#ffb020;transform-origin:left}`;
  document.head.appendChild(st);
  const d = document.createElement('div'); d.id = 'deathScr'; d.innerHTML = '<h1>💥 WRECKED</h1><p id="dsBy"></p><p id="dsIn"></p>'; document.body.appendChild(d);
  const h = document.createElement('div'); h.id = 'rkHud'; h.innerHTML = '🚀 ROCKET · <span id="rkKey">X</span><i><u id="rkBar"></u></i>'; document.body.appendChild(h);
})();

function rkAllowed() { if (G.spec) return false; return !!((typeof TWEAKS !== 'undefined' && TWEAKS.rl) || (G.cfg && G.cfg.pvp && G.mp && !G.tt)); }
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
  if (ok) { $('rkKey').textContent = keyName(CFG.keys.rocket) + (TWEAKS.raf ? ' (hold)' : ''); const left = TWEAKS.rnc || TWEAKS.raf ? 0 : Math.max(0, ((me.rkReady || 0) - now) / (RK.COOL * 1000)); $('rkBar').style.transform = 'scaleX(' + (1 - left) + ')'; $('rkBar').style.background = left > 0 ? '#777' : '#ffb020'; }
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
    const a = Math.atan2(r.vy, r.vx); g.save(); g.translate(r.x, r.y); g.rotate(a);
    g.save(); g.globalCompositeOperation = 'lighter'; const fl = g.createLinearGradient(0, 0, -70, 0); fl.addColorStop(0, 'rgba(255,200,80,.95)'); fl.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = fl; g.beginPath(); g.moveTo(-6, -4); g.lineTo(-60 - Math.random() * 14, 0); g.lineTo(-6, 4); g.fill();
    const gl = g.createRadialGradient(0, 0, 1, 0, 0, 30); gl.addColorStop(0, 'rgba(255,170,60,.55)'); gl.addColorStop(1, 'rgba(255,100,0,0)'); g.fillStyle = gl; g.fillRect(-30, -30, 60, 60); g.restore();
    g.fillStyle = '#d8d8de'; g.strokeStyle = '#000'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(-12, -3.5, 24, 7, 3); g.fill(); g.stroke();
    g.fillStyle = r.color || '#ff2a2a'; g.beginPath(); g.moveTo(12, -3.5); g.lineTo(20, 0); g.lineTo(12, 3.5); g.fill(); g.fillRect(-12, -6, 6, 12);
    g.restore();
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
