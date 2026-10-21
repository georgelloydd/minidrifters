// ===== Remote control + spectate (granted per player from the dev site's Troll tab) =====
// Both use the same small live channel: the admin's page draws the race from position updates (no video),
// and, only when remote control is allowed, sends key presses back.
// The admin's keys are ADDED to the player's own: if the player holds right and the admin holds left, the two cancel out;
// when the admin lets go, the player's own key carries on. Nothing the player presses is ever removed.
const RC = { ch: null, key: '', on: false, s: { l: 0, r: 0, u: 0, d: 0, h: 0 }, t: 0 };
function rcMerge(o) {
  if (!RC.on || !TWEAKS.rc || performance.now() - RC.t > 800) return o; const s = RC.s; if (!(s.l || s.r || s.u || s.d || s.h)) return o;
  const st = (o.right ? 1 : 0) - (o.left ? 1 : 0) + s.r - s.l, th = (o.up ? 1 : 0) - (o.down ? 1 : 0) + s.u - s.d;
  return Object.assign({}, o, { left: st < 0, right: st > 0, up: th > 0, down: th < 0, hb: !!(o.hb || s.h) });
}
function rcSync() {
  const want = TWEAKS && (TWEAKS.rc || TWEAKS.sp) && TWEAKS.rct && ACCT.pub ? 'md-ctl-' + ACCT.pub + '-' + TWEAKS.rct : '';
  if (want === RC.key) return;
  if (RC.ch) { try { RC.ch.unsubscribe(); sbc().removeChannel(RC.ch); } catch (e) { } RC.ch = null; }
  RC.on = false; RC.key = want; RC.s = { l: 0, r: 0, u: 0, d: 0, h: 0 };
  if (!want || typeof supabase === 'undefined' || typeof CLOUD === 'undefined' || !CLOUD) return;
  try {
    const ch = sbc().channel(want, { config: { broadcast: { self: false }, presence: { key: 'v' } } });
    ch.on('broadcast', { event: 'in' }, m => { const p = (m && m.payload) || {}; RC.s = { l: p.l ? 1 : 0, r: p.r ? 1 : 0, u: p.u ? 1 : 0, d: p.d ? 1 : 0, h: p.h ? 1 : 0 }; RC.t = performance.now(); });
    ch.on('broadcast', { event: 'watch' }, m => wtSig(m && m.payload));
    ch.subscribe(st => { if (st === 'SUBSCRIBED') { RC.on = true; try { ch.track({ t: Date.now() }); } catch (e) { } } });
    RC.ch = ch;
  } catch (e) { RC.ch = null; }
}
setInterval(rcSync, 2000);

// ===== Watch (spectate): the admin's spectate page draws this player's race itself from small position updates =====
// Read-only: nothing here changes the player's game. It only sends where their car (and the cars around them) are,
// a few times a second, while an admin spectate page is open (it pings every 2 s; updates stop 6 s after the last ping).
const WT = { at: 0, trkAt: 0, n: 0 };
function wtKey(tr) { return tr ? (tr.name || '') + '|' + tr.n + '|' + Math.round(tr.len || 0) : ''; }
function wtSend(ev, p) { try { if (RC.ch && RC.on) RC.ch.send({ type: 'broadcast', event: ev, payload: p }); } catch (e) { } }
function wtLook(c) { try { const l = carLook(c); return [l.body, l.color, l.accent, l.accent2, l.livery, l.num, l.finish, l.rim, l.glow, l.helmet]; } catch (e) { return [c.body || 'drift', c.color || '#ff3b3b']; } }
function wtSig(p) {
  if (!p || !RC.on || typeof p.from !== 'string') return;
  if (p.k === 'hi') { WT.at = performance.now(); const tr = G.tr, k = wtKey(tr), inRace = G.state !== 'menu' && G.state !== 'lobby';
    if (inRace && tr && p.have !== k && performance.now() - WT.trkAt > 2500) { WT.trkAt = performance.now(); wtSend('watch', { k: 'trk', key: k, def: tr.def }); } }
}
function wtTick() {
  if (!RC.on || performance.now() - WT.at > 6000) return;
  const now = performance.now(), st = G.state, inRace = st !== 'menu' && st !== 'lobby' && G.me && G.tr;
  if (!inRace) return wtSend('watch', { k: 'pos', s: st });
  const me = G.me, full = (WT.n++ % 8) === 0, cfg = G.cfg || {};
  const lapT = G.tt ? (st === 'race' && me.lap >= 0 ? now - me.lapStart : 0) : me.finished || (st === 'race' ? now - G.t0 : 0);
  let pos = 0, cnt = 1; if (G.rem.size && typeof posOf === 'function') { const all = [me, ...[...G.rem.values()].map(r => r.car)], m = posOf(me); cnt = all.length; pos = 1 + all.filter(c => c !== me && posOf(c) > m).length; }
  const fl = c => (c.drift ? 1 : 0) | (c.brake ? 2 : 0) | (c.hb ? 4 : 0) | (c.dead || c.deadUntil > now || (c === G.me && G.spec) ? 8 : 0) | (c.finished ? 16 : 0);
  const rem = [...G.rem.entries()].map(([id, r]) => { const c = r.car, o = [String(id), Math.round(c.x), Math.round(c.y), +c.a.toFixed(3), fl(c), c.layer || 0]; if (full) o.push(c.name || 'Driver', wtLook(c)); return o; });
  const gh = G.ghostCar && typeof ghostCars === 'function' ? ghostCars()[0] : null;
  const p = { k: 'pos', s: st, key: wtKey(G.tr), mode: cfg.mode || '', laps: cfg.laps || 0, tt: G.tt ? G.tt.laps + 1 : 0,
    me: [Math.round(me.x), Math.round(me.y), +me.a.toFixed(3), Math.round(me.vx), Math.round(me.vy), +(me.steer || 0).toFixed(2), fl(me), me.layer || 0, Math.round(me.speed || 0)],
    lap: me.lap, lapT: Math.round(lapT), best: me.best || 0, last: me.lastLap || 0, score: Math.round(me.score || 0), cur: Math.round(me.cur || 0), combo: me.combo || 1, wrong: me.wrong > 1 ? 1 : 0, pos, cnt, rem,
    cd: st === 'countdown' ? Math.max(0, Math.ceil((G.cdEnd - now) / 1000)) : 0, wx: G.wx || 'auto', t: Date.now() };
  if (gh) p.gh = [Math.round(gh.x), Math.round(gh.y), +gh.a.toFixed(3)];
  if (G.rk && G.rk.length) p.rk = G.rk.slice(-60).map(r => [Math.round(r.x), Math.round(r.y), Math.round(r.vx), Math.round(r.vy), r.color || '#ff8c1a']);
  if (G.boom && G.boom.length) p.bm = G.boom.map(b => [b.id || 0, Math.round(b.x), Math.round(b.y), Math.round(b.t * 1000), b.col || '#ff8c1a']);
  const BC = G.bombC; if (BC && BC.h && cfg.mode === 'bomb') { p.bh = BC.h === myId() ? 'me' : 'r' + BC.h; p.bl = Math.max(0, Math.round(BC.end - now)); }
  if (G.spec) p.spec = 1;
  if (full) { p.name = CFG.name; p.look = wtLook(G.me); }
  wtSend('watch', p);
}
setInterval(wtTick, 120);
