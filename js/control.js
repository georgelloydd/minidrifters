// ===== Remote control (granted per player from the dev site's Troll tab) =====
// The admin's keys are ADDED to the player's own: if the player holds right and the admin holds left, the two cancel out;
// when the admin lets go, the player's own key carries on. Nothing the player presses is ever removed.
const RC = { ch: null, key: '', on: false, s: { l: 0, r: 0, u: 0, d: 0, h: 0 }, t: 0 };
function rcMerge(o) {
  if (!RC.on || performance.now() - RC.t > 800) return o; const s = RC.s; if (!(s.l || s.r || s.u || s.d || s.h)) return o;
  const st = (o.right ? 1 : 0) - (o.left ? 1 : 0) + s.r - s.l, th = (o.up ? 1 : 0) - (o.down ? 1 : 0) + s.u - s.d;
  return Object.assign({}, o, { left: st < 0, right: st > 0, up: th > 0, down: th < 0, hb: !!(o.hb || s.h) });
}
function rcSync() {
  const want = TWEAKS && TWEAKS.rc && TWEAKS.rct && ACCT.pub ? 'md-ctl-' + ACCT.pub + '-' + TWEAKS.rct : '';
  if (want === RC.key) return;
  if (RC.ch) { try { RC.ch.unsubscribe(); sbc().removeChannel(RC.ch); } catch (e) { } RC.ch = null; }
  RC.on = false; RC.key = want; RC.s = { l: 0, r: 0, u: 0, d: 0, h: 0 };
  if (!want || typeof supabase === 'undefined' || typeof CLOUD === 'undefined' || !CLOUD) return;
  try {
    const ch = sbc().channel(want, { config: { broadcast: { self: false }, presence: { key: 'v' } } });
    ch.on('broadcast', { event: 'in' }, m => { const p = (m && m.payload) || {}; RC.s = { l: p.l ? 1 : 0, r: p.r ? 1 : 0, u: p.u ? 1 : 0, d: p.d ? 1 : 0, h: p.h ? 1 : 0 }; RC.t = performance.now(); });
    ch.subscribe(st => { if (st === 'SUBSCRIBED') { RC.on = true; try { ch.track({ t: Date.now() }); } catch (e) { } } });
    RC.ch = ch;
  } catch (e) { RC.ch = null; }
}
setInterval(rcSync, 2000);
