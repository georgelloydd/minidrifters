// ===== Coins, shop (cars, paint, underglow, tyre smoke) + achievements =====
const SHOP = {
  cars: { drift: 0, kart: 1200, street: 1500, minnow: 2000, bug: 2200, kei: 2500, hachi: 3000, camper: 3500, pickup: 3500, muscle: 5000, pony: 5500, msedan: 6000, rotary: 6500, flat6: 7000, rspec: 8000, hellkat: 9000, f1: 12000 },
  paintFree: ['#ff3b3b', '#f2f2f2', '#33363d', '#1ec8ff'], paintCost: 400, anyPaint: 4000,
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
  const o = s.own; for (const k of ['cars', 'paint', 'glow', 'smoke']) if (!Array.isArray(o[k])) o[k] = [];
  for (const [x, p] of [['micro', 800], ['wedge', 15000]]) if (o.cars.includes(x)) { // retired cars: money back
    o.cars = o.cars.filter(c => c !== x); s.coins = (s.coins || 0) + p;
    setTimeout(() => { if (typeof pop === 'function') pop('CAR RETIRED · +' + p.toLocaleString() + ' COINS REFUNDED', '#ffd60a'); }, 900); }
  if (o.cars.some(x => CAR_ALIAS[x])) o.cars = [...new Set(o.cars.map(x => CAR_ALIAS[x] || x))]; // removed cars become their replacement
  if (!o.cars.includes('drift')) o.cars.push('drift'); return o;
}
// keeps the selected car/paint/glow/smoke to things this player owns
function shopFix() {
  if (!ACCT.stats) return; const o = shopOwn(); let ch = false;
  if (CAR_ALIAS[CFG.body]) { CFG.body = CAR_ALIAS[CFG.body]; ch = true; }
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
let BUYING = false;
// ex: { look } for cars (shows the car), { sw: colour } for paint / glow / smoke
async function shopBuy(kind, id, price, name, apply, ex) {
  const o = shopOwn(); ex = ex || {}; if (BUYING) return;
  if (coins() < price) return pop('NOT ENOUGH COINS · ' + (price - coins()).toLocaleString() + ' MORE NEEDED', '#ff3b3b');
  const html = (ex.look ? '<canvas class="buyPrev" width="384" height="216"></canvas>' : ex.sw ? `<div class="buySw" style="background:${ex.sw}"></div>` : '')
    + `<div class="buyRow"><span>Price</span><b><i class="coin"></i>${price.toLocaleString()}</b></div><div class="buyRow"><span>You have</span><b><i class="coin"></i>${coins().toLocaleString()}</b></div><div class="buyRow"><span>After</span><b><i class="coin"></i>${(coins() - price).toLocaleString()}</b></div>`;
  BUYING = true;
  const ok = await uiConfirm('', { title: 'Buy ' + name + '?', cls: 'buyDlg', html, yes: 'Buy', no: 'Not now', gold: true,
    onOpen: box => { const cv = box.querySelector('.buyPrev'); if (cv) drawCarPreview(cv, ex.look, -0.4); } });
  BUYING = false; if (!ok) return;
  if (kind !== 'any' && o[kind].includes(id)) return;
  if (coins() < price) return pop('NOT ENOUGH COINS · ' + (price - coins()).toLocaleString() + ' MORE NEEDED', '#ff3b3b');
  ACCT.stats.coins = coins() - price; o.bought = (o.bought || 0) + 1;
  if (kind === 'any') o.any = true; else o[kind].push(id);
  if (typeof sndUi === 'function') sndUi('go');
  if (apply) apply(); achCheck(); saveCfg(); refreshMenu(); pop('BOUGHT ' + name.toUpperCase(), '#7bff4a');
}
const pr = n => '🪙 ' + n.toLocaleString();
const normHex = v => { v = String(v || '').trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + [...v.slice(1)].map(x => x + x).join(''); return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null; };
function ownsPaint(c) { const o = shopOwn(); return o.any || o.paint.includes(String(c).toLowerCase()); }
function toShopBtn(row, show) {
  let b = row.querySelector('.toShop');
  if (show && !b) { b = document.createElement('button'); b.className = 'opt toShop'; b.textContent = 'Get more in the Shop →'; b.onclick = () => setTab('shop'); row.appendChild(b); }
  if (!show && b) b.remove();
}
// ---------- Shop tab ----------
function shopBuild() {
  const root = $('shopRoot'); if (!root || root.dataset.built) return; root.dataset.built = '1';
  const presets = COLORS.map(c => c.toLowerCase()).filter((c, i, a) => a.indexOf(c) === i && !SHOP.paintFree.includes(c));
  root.innerHTML = `<div id="coinBar" class="coinBar"></div>
  <h2 class="shH">Cars <small>Cosmetic only · every car handles the same</small></h2>
  <div class="shGrid">${CAR_TYPES.filter(t => SHOP.cars[t.id]).map(t => `<div class="shCard" data-car="${t.id}"><canvas width="300" height="170"></canvas><b>${esc(t.name)}</b><span class="dim">${esc(t.desc)}</span><button class="shBtn"></button></div>`).join('')}</div>
  <h2 class="shH">Paint <small>Body colours · ${SHOP.paintCost} coins each, or unlock them all</small></h2>
  <div class="shPaint">
    <div class="shCard shCustom"><div class="shSw" id="shCustSw"></div><b>Custom colour</b><span class="dim">Pick any hex code. Once bought it's in your Garage forever.</span><div class="row"><input type="color" id="shCustPick" value="#ff2a6d"><input class="hex" id="shCustHex" maxlength="7" spellcheck="false" value="#FF2A6D"></div><button class="shBtn" id="shCustBuy"></button></div>
    <div class="shCard"><div class="shSw rainbow"></div><b>Every colour</b><span class="dim">Unlocks the full colour picker in the Garage, so every hex code is free.</span><button class="shBtn" id="shAllBuy"></button></div>
  </div>
  <div class="shSwatches">${presets.map(c => `<div class="shCard" data-paint="${c}"><div class="shSw" style="background:${c}"></div><b>${c.toUpperCase()}</b><button class="shBtn"></button></div>`).join('')}</div>
  <h2 class="shH">Underglow</h2>
  <div class="shGrid sm">${SHOP.glow.map(([c, n]) => `<div class="shCard" data-glow="${c}" data-n="${n}"><div class="shGlow" style="--c:${c}"></div><b>${n}</b><button class="shBtn"></button></div>`).join('')}</div>
  <h2 class="shH">Tyre smoke</h2>
  <div class="shGrid sm">${SHOP.smoke.map(([c, n]) => `<div class="shCard" data-smoke="${c}" data-n="${n}"><div class="shSmoke" style="--c:${c}"></div><b>${n}</b><button class="shBtn"></button></div>`).join('')}</div>`;
  root.querySelectorAll('[data-car]').forEach(d => d.querySelector('.shBtn').onclick = () => {
    const t = carType(d.dataset.car);
    if (shopOwn().cars.includes(t.id)) { if (CFG.body !== t.id) { CFG.body = t.id; saveCfg(); refreshMenu(); pop('EQUIPPED THE ' + t.name.toUpperCase(), '#1ec8ff'); } }
    else shopBuy('cars', t.id, SHOP.cars[t.id], 'the ' + t.name, () => { CFG.body = t.id; }, { look: Object.assign(carLook(CFG), { body: t.id }) });
  });
  const paintBtn = c => {
    if (ownsPaint(c)) { if (String(CFG.color).toLowerCase() !== c) { CFG.color = c; saveCfg(); refreshMenu(); pop('PAINTED ' + c.toUpperCase(), '#1ec8ff'); } }
    else shopBuy('paint', c, SHOP.paintCost, c.toUpperCase() + ' paint', () => { CFG.color = c; }, { sw: c });
  };
  root.querySelectorAll('[data-paint]').forEach(d => d.querySelector('.shBtn').onclick = () => paintBtn(d.dataset.paint));
  const cp = $('shCustPick'), ch = $('shCustHex');
  cp.oninput = () => { ch.value = cp.value.toUpperCase(); ch.classList.remove('bad'); shopUpdate(); };
  ch.oninput = () => { const v = normHex(ch.value); ch.classList.toggle('bad', !v); if (v) cp.value = v; shopUpdate(); };
  $('shCustBuy').onclick = () => { const v = normHex(ch.value); if (v) paintBtn(v); else pop('THAT IS NOT A HEX CODE', '#ff3b3b'); };
  $('shAllBuy').onclick = () => { if (!shopOwn().any) shopBuy('any', 'any', SHOP.anyPaint, 'every colour', null, { sw: 'linear-gradient(90deg,#ff3b3b,#ffd60a,#7bff4a,#1ec8ff,#c04bff,#ff3fb4)' }); };
  for (const [kind, label, cost] of [['glow', 'underglow', SHOP.glowCost], ['smoke', 'tyre smoke', SHOP.smokeCost]])
    root.querySelectorAll(`[data-${kind}]`).forEach(d => d.querySelector('.shBtn').onclick = () => {
      const c = d.dataset[kind];
      if (shopOwn()[kind].includes(c)) { CFG[kind] = CFG[kind] === c ? '' : c; saveCfg(); refreshMenu(); }
      else shopBuy(kind, c, cost, d.dataset.n + ' ' + label, () => { CFG[kind] = c; }, { sw: c });
    });
}
function shopUpdate() {
  const root = $('shopRoot'); if (!root || !root.dataset.built) return; const o = shopOwn(), have = coins();
  const set = (b, st, price) => { b.className = 'shBtn ' + st; b.innerHTML = st === 'eq' ? 'Equipped' : st === 'own' ? 'Owned · use it' : '<i class="coin"></i>' + price.toLocaleString(); };
  const buy = p => have >= p ? '' : 'poor';
  $('coinBar').innerHTML = `<i class="coin big"></i><b>${have.toLocaleString()}</b><span>coins</span><small>Earn coins from laps, drifting, distance and wins · ${o.cars.length}/${CAR_TYPES.length} cars owned</small>`;
  root.querySelectorAll('[data-car]').forEach(d => { const id = d.dataset.car, own = o.cars.includes(id), eq = CFG.body === id;
    d.classList.toggle('own', own && !eq); d.classList.toggle('eq', eq); set(d.querySelector('.shBtn'), eq ? 'eq' : own ? 'own' : buy(SHOP.cars[id]), SHOP.cars[id]);
    drawCarPreview(d.querySelector('canvas'), Object.assign(carLook(CFG), { body: id }), -0.35); });
  const pst = c => String(CFG.color).toLowerCase() === c ? 'eq' : ownsPaint(c) ? 'own' : buy(SHOP.paintCost);
  root.querySelectorAll('[data-paint]').forEach(d => { const st = pst(d.dataset.paint); d.classList.toggle('eq', st === 'eq'); d.classList.toggle('own', st === 'own'); set(d.querySelector('.shBtn'), st, SHOP.paintCost); });
  const cv = normHex($('shCustHex').value) || $('shCustPick').value, cb = $('shCustBuy'); $('shCustSw').style.background = cv;
  set(cb, pst(cv), SHOP.paintCost); if (!ownsPaint(cv)) cb.innerHTML = 'Buy ' + cv.toUpperCase() + ' · <i class="coin"></i>' + SHOP.paintCost.toLocaleString();
  const ab = $('shAllBuy'); if (o.any) { ab.className = 'shBtn eq'; ab.textContent = 'Unlocked'; } else set(ab, buy(SHOP.anyPaint), SHOP.anyPaint);
  for (const kind of ['glow', 'smoke']) root.querySelectorAll(`[data-${kind}]`).forEach(d => { const c = d.dataset[kind], own = o[kind].includes(c), eq = CFG[kind] === c, cost = SHOP[kind + 'Cost'], b = d.querySelector('.shBtn');
    d.classList.toggle('eq', eq); d.classList.toggle('own', own && !eq); set(b, eq ? 'eq' : own ? 'own' : buy(cost), cost); if (eq) b.textContent = 'Equipped · tap to remove'; });
}
// called at the end of refreshMenu: garage shows only what you own, shop shows prices, achievements list
function shopDecorate() {
  if (!$('tab-garage')) return; shopFix(); const o = shopOwn();
  document.querySelectorAll('#types .ty').forEach(d => d.classList.toggle('hidden', !o.cars.includes(d.dataset.b)));
  const row = document.querySelector('#paints .prow[data-f="color"]');
  if (row) {
    const sws = row.querySelector('.sws'), have = new Set([...sws.querySelectorAll('.sw')].map(x => x.dataset.c.toLowerCase()));
    o.paint.forEach(c => { if (have.has(c)) return; have.add(c); const x = document.createElement('div'); x.className = 'sw'; x.style.background = c; x.dataset.c = c; x.title = c.toUpperCase(); x.onclick = () => { CFG.color = c; saveCfg(); refreshMenu(); }; sws.appendChild(x); });
    sws.querySelectorAll('.sw').forEach(x => { x.classList.toggle('hidden', !ownsPaint(x.dataset.c)); x.classList.toggle('on', x.dataset.c.toLowerCase() === String(CFG.color).toLowerCase()); });
    row.querySelectorAll('input').forEach(i => i.classList.toggle('hidden', !o.any));
    toShopBtn(row, !o.any);
  }
  for (const [kind, label, list] of [['glow', 'Underglow', SHOP.glow], ['smoke', 'Tyre smoke', SHOP.smoke]]) {
    let r = $('row_' + kind);
    if (!r) { const lb = document.createElement('label'); lb.textContent = label; r = document.createElement('div'); r.id = 'row_' + kind; r.className = 'row xrow'; const g = document.querySelector('.gopts'); g.appendChild(lb); g.appendChild(r);
      r.innerHTML = `<button class="opt" data-x="">None</button>` + list.map(([c, n]) => `<button class="opt xsw" data-x="${c}"><i style="background:${c}"></i>${n}</button>`).join('');
      r.querySelectorAll('button[data-x]').forEach(b => b.onclick = () => { CFG[kind] = b.dataset.x; saveCfg(); refreshMenu(); }); }
    r.querySelectorAll('button[data-x]').forEach(b => { const c = b.dataset.x; b.classList.toggle('on', (CFG[kind] || '') === c); b.classList.toggle('hidden', !!c && !o[kind].includes(c)); });
    toShopBtn(r, o[kind].length < list.length);
  }
  shopBuild(); shopUpdate();
  let ac = $('achBox'); if (!ac && $('tab-acct')) { ac = document.createElement('div'); ac.id = 'achBox'; ac.className = 'card'; $('tab-acct').appendChild(ac); }
  if (ac) { const s = ACCT.stats, a = s.ach || {}, n = ACH.filter(x => a[x[0]]).length;
    ac.innerHTML = `<label>Achievements · ${n}/${ACH.length}</label><div class="achs">` + ACH.map(([id, name, desc, , rw]) => `<div class="ach ${a[id] ? 'got' : ''}"><b>${a[id] ? '🏆' : '🔒'} ${esc(name)}</b><span>${esc(desc)}</span><small>${pr(rw)}</small></div>`).join('') + '</div>'; }
}
