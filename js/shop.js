// ===== Coins, shop (cars, paint, underglow, tyre smoke) + achievements =====
const SHOP = {
  cars: { drift: 0, street: 1500, hatch: 2000, kei: 2500, rally: 4000, muscle: 5000, gt: 7500, f1: 12000 },
  paintFree: ['#ff3b3b', '#f2f2f2', '#33363d', '#1ec8ff'], paintCost: 400, anyPaint: 3000,
  glow: [['#ff2a2a', 'Red'], ['#1ec8ff', 'Ice'], ['#7bff4a', 'Toxic'], ['#c04bff', 'Violet'], ['#ffd60a', 'Gold'], ['#ff3fb4', 'Pink'], ['#ffffff', 'White']], glowCost: 2500,
  smoke: [['#ff5a5a', 'Red'], ['#5ac8ff', 'Blue'], ['#8dff6a', 'Green'], ['#c98bff', 'Purple'], ['#ffd84a', 'Yellow'], ['#ff8ad8', 'Pink'], ['#2a2a30', 'Black']], smokeCost: 1500,
};
const ACH = [
  ['acct', 'Signed up', 'Create an account', () => ACCT.reg, 250],
  ['lap1', 'First lap', 'Finish a lap', s => s.laps >= 1, 100],
  ['lap100', 'Century', 'Drive 100 laps', s => s.laps >= 100, 1000],
  ['race1', 'Racer', 'Finish a race', s => s.races >= 1, 150],
  ['win1', 'Winner', 'Win a multiplayer race', s => s.wins >= 1, 500],
  ['win10', 'Champion', 'Win 10 races', s => s.wins >= 10, 2500],
  ['d100k', 'Sideways', 'Score 100,000 drift points in one go', (s, o) => (s.bestDrift || 0) >= 1e5, 500],
  ['d1m', 'Smoke machine', '1,000,000 total drift points', s => s.drift >= 1e6, 1500],
  ['d10m', 'Drift king', '10,000,000 total drift points', s => s.drift >= 1e7, 6000],
  ['km10', 'Road trip', 'Drive 10 km', s => s.dist >= 10, 300],
  ['km100', 'Long haul', 'Drive 100 km', s => s.dist >= 100, 2500],
  ['buy1', 'Shopper', 'Buy something from the shop', s => shopOwn().bought >= 1, 200],
  ['glow', 'Lit up', 'Buy an underglow', s => shopOwn().glow.length >= 1, 300],
  ['cars', 'Collector', 'Own every car', s => shopOwn().cars.length >= CAR_TYPES.length, 8000],
];
const coins = () => ACCT.stats.coins || 0;
function shopOwn() {
  const s = ACCT.stats;
  if (!s.own || typeof s.own !== 'object') { // existing players keep the car + paint they already use
    const old = (s.laps || 0) > 0 || (s.sessions || 0) > 0;
    s.own = { cars: ['drift'], paint: SHOP.paintFree.slice(), glow: [], smoke: [], any: false, bought: 0 };
    if (old && CFG.body && !s.own.cars.includes(CFG.body)) s.own.cars.push(CFG.body);
    if (old && CFG.color && !s.own.paint.includes(CFG.color.toLowerCase())) s.own.paint.push(CFG.color.toLowerCase());
  }
  const o = s.own; for (const k of ['cars', 'paint', 'glow', 'smoke']) if (!Array.isArray(o[k])) o[k] = []; if (!o.cars.includes('drift')) o.cars.push('drift'); return o;
}
// keeps the selected car/paint/glow/smoke to things this player owns
function shopFix() {
  if (!ACCT.stats) return; const o = shopOwn(); let ch = false;
  if (!o.cars.includes(CFG.body)) { CFG.body = 'drift'; ch = true; }
  if (!o.any && !o.paint.includes(String(CFG.color).toLowerCase())) { CFG.color = o.paint[0] || SHOP.paintFree[0]; ch = true; }
  if (CFG.glow && !o.glow.includes(CFG.glow)) { CFG.glow = ''; ch = true; }
  if (CFG.smoke && !o.smoke.includes(CFG.smoke)) { CFG.smoke = ''; ch = true; }
  if (ch) localStorage.setItem('md_cfg', JSON.stringify(CFG));
}
function addCoins(n, why) {
  n = Math.round(n); if (!(n > 0)) return; ACCT.stats.coins = coins() + n;
  if (why && typeof pop === 'function') pop('+' + n.toLocaleString() + ' COINS' + (why === true ? '' : ' · ' + why), '#ffd60a');
}
function achCheck(o) {
  const s = ACCT.stats; s.ach = s.ach || {}; let got = 0;
  for (const [id, name, , ok, reward] of ACH) { if (s.ach[id]) continue; let y = false; try { y = ok(s, o); } catch (e) { } if (!y) continue;
    s.ach[id] = Date.now(); s.coins = coins() + reward; got++; if (typeof pop === 'function') setTimeout(() => pop('🏆 ' + name.toUpperCase() + ' · +' + reward.toLocaleString() + ' COINS', '#ffd60a'), 400 + got * 900); }
  return got;
}
// coins come from every session: laps, drift points, distance and wins
(function () {
  const add = ACCT.addSession.bind(ACCT);
  ACCT.addSession = function (o) {
    const s = this.stats; s.bestDrift = Math.max(s.bestDrift || 0, o.drift || 0);
    const earn = (o.laps || 0) * 25 + (o.drift || 0) / 400 + (o.dist || 0) * 60 + (o.race ? 30 : 0) + (o.win ? 150 : 0);
    addCoins(earn, true); achCheck(o); return add(o);
  };
  const use = ACCT.use.bind(ACCT);
  ACCT.use = async function (k, f) { const r = await use(k, f); shopOwn(); shopFix(); if (achCheck()) this.save(); return r; };
})();
function shopBuy(kind, id, price, name, apply) {
  const o = shopOwn();
  if (coins() < price) return pop('NOT ENOUGH COINS · ' + (price - coins()).toLocaleString() + ' MORE NEEDED', '#ff3b3b');
  if (!confirm(`Buy ${name} for ${price.toLocaleString()} coins?\nYou have ${coins().toLocaleString()}.`)) return;
  ACCT.stats.coins = coins() - price; o.bought = (o.bought || 0) + 1;
  if (kind === 'any') o.any = true; else o[kind].push(id);
  if (typeof sndUi === 'function') sndUi('go');
  if (apply) apply(); achCheck(); saveCfg(); refreshMenu(); pop('BOUGHT ' + name.toUpperCase(), '#7bff4a');
}
const pr = n => '🪙 ' + n.toLocaleString();
// called at the end of refreshMenu: locks, prices, coin counter, extra garage rows, achievements list
function shopDecorate() {
  if (!$('tab-garage')) return; shopFix(); const o = shopOwn();
  let cb = $('coinBar'); if (!cb) { cb = document.createElement('div'); cb.id = 'coinBar'; cb.className = 'coinBar'; $('tab-garage').insertBefore(cb, $('tab-garage').querySelector('.garage')); }
  cb.innerHTML = `<b>🪙 ${coins().toLocaleString()}</b> coins <small class="dim">· earn them from laps, drifting, distance and wins</small>`;
  document.querySelectorAll('.ty').forEach(d => { const p = SHOP.cars[d.dataset.b] || 0, lk = !o.cars.includes(d.dataset.b); d.classList.toggle('locked', lk); d.dataset.price = lk ? pr(p) : ''; });
  const row = document.querySelector('.prow[data-f="color"]');
  if (row) {
    row.querySelectorAll('.sw').forEach(s => { const lk = !o.any && !o.paint.includes(s.dataset.c.toLowerCase()); s.classList.toggle('locked', lk); s.title = lk ? 'Unlock for ' + SHOP.paintCost + ' coins' : s.dataset.c.toUpperCase(); });
    row.querySelectorAll('input').forEach(i => { i.disabled = !o.any; i.title = o.any ? '' : 'Unlock any colour in the shop'; });
    let ab = row.querySelector('.anyBuy'); if (!o.any && !ab) { ab = document.createElement('button'); ab.className = 'opt anyBuy'; ab.textContent = '🔒 Any colour · ' + pr(SHOP.anyPaint); ab.onclick = () => shopBuy('any', 'any', SHOP.anyPaint, 'any colour paint'); row.appendChild(ab); } if (o.any && ab) ab.remove();
  }
  for (const [kind, label, list, cost] of [['glow', 'Underglow', SHOP.glow, SHOP.glowCost], ['smoke', 'Tyre smoke', SHOP.smoke, SHOP.smokeCost]]) {
    let r = $('row_' + kind);
    if (!r) { const lb = document.createElement('label'); lb.textContent = label; r = document.createElement('div'); r.id = 'row_' + kind; r.className = 'row xrow'; const g = document.querySelector('.gopts'); g.appendChild(lb); g.appendChild(r);
      r.innerHTML = `<button class="opt" data-x="">None</button>` + list.map(([c, n]) => `<button class="opt xsw" data-x="${c}" data-n="${n}"><i style="background:${c}"></i>${n}<small></small></button>`).join('');
      r.querySelectorAll('button').forEach(b => b.onclick = () => { const c = b.dataset.x; if (!c || shopOwn()[kind].includes(c)) { CFG[kind] = c; saveCfg(); refreshMenu(); } else shopBuy(kind, c, cost, b.dataset.n + ' ' + label.toLowerCase(), () => { CFG[kind] = c; }); }); }
    r.querySelectorAll('button').forEach(b => { const c = b.dataset.x, lk = c && !o[kind].includes(c); b.classList.toggle('on', (CFG[kind] || '') === c); b.classList.toggle('locked', !!lk); const sm = b.querySelector('small'); if (sm) sm.textContent = lk ? ' · ' + pr(cost) : ''; });
  }
  let ac = $('achBox'); if (!ac && $('tab-acct')) { ac = document.createElement('div'); ac.id = 'achBox'; ac.className = 'card'; $('tab-acct').appendChild(ac); }
  if (ac) { const s = ACCT.stats, a = s.ach || {}, n = ACH.filter(x => a[x[0]]).length;
    ac.innerHTML = `<label>Achievements · ${n}/${ACH.length}</label><div class="achs">` + ACH.map(([id, name, desc, , rw]) => `<div class="ach ${a[id] ? 'got' : ''}"><b>${a[id] ? '🏆' : '🔒'} ${esc(name)}</b><span>${esc(desc)}</span><small>${pr(rw)}</small></div>`).join('') + '</div>'; }
}
// locked paint swatches / cars open the buy prompt instead of selecting
document.addEventListener('click', e => {
  const sw = e.target.closest('.prow[data-f="color"] .sw.locked'), ty = e.target.closest('.ty.locked');
  if (sw) { e.stopPropagation(); e.preventDefault(); const c = sw.dataset.c.toLowerCase(); shopBuy('paint', c, SHOP.paintCost, c.toUpperCase() + ' paint', () => { CFG.color = c; }); }
  else if (ty) { e.stopPropagation(); e.preventDefault(); const t = carType(ty.dataset.b); shopBuy('cars', t.id, SHOP.cars[t.id] || 0, 'the ' + t.name, () => { CFG.body = t.id; }); }
}, true);
