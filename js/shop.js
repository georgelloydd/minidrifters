// ===== Coins, shop (cars, hex colours, secondary patterns, underglow, tyre smoke) + achievements =====
const SHOP = {
  cars: { drift: 0, kart: 1200, street: 1500, minnow: 2000, bug: 2200, kei: 2500, hachi: 3000, camper: 3500, pickup: 3500, muscle: 5000, pony: 5500, msedan: 6000, rotary: 6500, flat6: 7000, rspec: 8000, hellkat: 9000, f1: 12000 },
  paintFree: ['#ff3b3b', '#f2f2f2', '#33363d', '#1ec8ff'],
  secFree: ['#ffffff', '#111111'],
  rimFree: ['#c9ccd2'],
  patFree: ['clean', 'racing'], patCost: 500,
};
// one entry per colour slot: buy a single hex code, or unlock every colour in that slot
// k = owned list, all = "every colour" flag, f = car fields it paints, opt = can be switched off
const CATS = [
  { k: 'paint', all: 'any', f: ['color'], name: 'Primary', sub: 'Main body colour', cost: 400, allCost: 4000, def: '#ff2a6d' },
  { k: 'sec', all: 'secAll', f: ['accent2', 'accent'], name: 'Secondary', sub: 'Secondary + stripe colours, used by your secondary pattern', cost: 200, allCost: 2000, def: '#ffd60a' },
  { k: 'rim', all: 'rimAll', f: ['rim'], name: 'Wheels', sub: 'Rim colour', cost: 200, allCost: 2000, def: '#d4a838' },
  { k: 'glow', all: 'glowAll', f: ['glow'], name: 'Underglow', sub: 'Neon light under the car', cost: 2500, allCost: 25000, def: '#1ec8ff', opt: true },
  { k: 'smoke', all: 'smokeAll', f: ['smoke'], name: 'Tyre smoke', sub: 'Colour of your drift smoke', cost: 1000, allCost: 10000, def: '#c98bff', opt: true },
];
const CAT_OF = { color: 'paint', accent: 'sec', accent2: 'sec', rim: 'rim', glow: 'glow', smoke: 'smoke' };
const catBy = k => CATS.find(c => c.k === k);
const FIELD_DEF = { color: '#ff3b3b', accent: '#ffffff', accent2: '#111111', rim: '#c9ccd2' };
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
  ['glow', 'Lit up', 'Buy an underglow', s => shopOwn().glow.length >= 1 || shopOwn().glowAll, 300],
  ['cars', 'Collector', 'Own every car', s => shopOwn().cars.length >= CAR_TYPES.length, 8000],
];
const coins = () => ACCT.stats.coins || 0;
const lc = v => String(v || '').toLowerCase();
const uniq = a => [...new Set(a)];
function shopOwn() {
  const s = ACCT.stats;
  if (!s.own || typeof s.own !== 'object') { // existing players keep the car + paint they already use
    const old = (s.laps || 0) > 0 || (s.sessions || 0) > 0;
    s.own = { cars: ['drift'], paint: SHOP.paintFree.slice(), glow: [], smoke: [], any: false, bought: 0 };
    if (old && CFG.body && !s.own.cars.includes(CFG.body)) s.own.cars.push(CFG.body);
    if (old && CFG.color && !s.own.paint.includes(lc(CFG.color))) s.own.paint.push(lc(CFG.color));
  }
  const o = s.own; for (const k of ['cars', 'paint', 'glow', 'smoke']) if (!Array.isArray(o[k])) o[k] = [];
  // new slots: players keep whatever secondary / wheel colours + pattern they already had on
  if (!Array.isArray(o.sec)) o.sec = uniq([...SHOP.secFree, lc(CFG.accent), lc(CFG.accent2)].filter(isHex));
  if (!Array.isArray(o.rim)) o.rim = uniq([...SHOP.rimFree, lc(CFG.rim)].filter(isHex));
  if (!Array.isArray(o.pat)) o.pat = uniq([...SHOP.patFree, carLook(CFG).livery]);
  for (const c of CATS) o[c.all] = !!o[c.all];
  for (const [x, p] of [['micro', 800], ['wedge', 15000]]) if (o.cars.includes(x)) { // retired cars: money back
    o.cars = o.cars.filter(c => c !== x); s.coins = (s.coins || 0) + p;
    setTimeout(() => { if (typeof pop === 'function') pop('Car retired · ' + p.toLocaleString() + ' coins refunded', '#ffd60a'); }, 900); }
  if (o.cars.some(x => CAR_ALIAS[x])) o.cars = [...new Set(o.cars.map(x => CAR_ALIAS[x] || x))]; // removed cars become their replacement
  if (!o.cars.includes('drift')) o.cars.push('drift'); return o;
}
function ownsCol(k, c) { const o = shopOwn(), cat = catBy(k); c = lc(c); return !!c && (o[cat.all] || o[k].includes(c)); }
function ownsPaint(c) { return ownsCol('paint', c); }
// keeps the selected car / colours / pattern to things this player owns
function shopFix() {
  if (!ACCT.stats) return; const o = shopOwn(); let ch = false;
  if (CAR_ALIAS[CFG.body]) { CFG.body = CAR_ALIAS[CFG.body]; ch = true; }
  if (!o.cars.includes(CFG.body)) { CFG.body = 'drift'; ch = true; }
  for (const cat of CATS) for (const f of cat.f) {
    const v = lc(CFG[f]); if (cat.opt && !v) continue;
    if (!ownsCol(cat.k, v)) { CFG[f] = cat.opt ? '' : cat.k === 'paint' ? (o.paint[0] || SHOP.paintFree[0]) : FIELD_DEF[f]; ch = true; }
  }
  if (!o.pat.includes(carLook(CFG).livery)) { CFG.livery = 'clean'; ch = true; }
  if (ch) localStorage.setItem('md_cfg', JSON.stringify(CFG));
}
function addCoins(n, why) {
  n = Math.round(n); if (!(n > 0)) return; ACCT.stats.coins = coins() + n;
  if (why && typeof pop === 'function') pop('+' + n.toLocaleString() + ' coins' + (why === true ? '' : ' · ' + why), '#ffd60a');
}
function achCheck(o) {
  const s = ACCT.stats; s.ach = s.ach || {}; let got = 0;
  for (const [id, name, , ok, reward] of ACH) { if (s.ach[id]) continue; let y = false; try { y = ok(s, o); } catch (e) { } if (!y) continue;
    s.ach[id] = Date.now(); s.coins = coins() + reward; got++; if (typeof pop === 'function') setTimeout(() => pop('🏆 ' + name + ' · +' + reward.toLocaleString() + ' coins', '#ffd60a'), 400 + got * 900); }
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
// kind: 'cars' | 'pat' | a colour slot key ('paint', 'sec', ...) | 'all:<flag>' for "buy all"
// ex: { look } shows the car, { sw: css background } shows a swatch
async function shopBuy(kind, id, price, name, apply, ex) {
  const o = shopOwn(); ex = ex || {}; if (BUYING) return;
  if (coins() < price) return pop('Need ' + (price - coins()).toLocaleString() + ' more coins', '#ff3b3b');
  const html = (ex.look ? '<canvas class="buyPrev" width="384" height="216"></canvas>' : ex.sw ? `<div class="buySw" style="background:${ex.sw}"></div>` : '')
    + `<div class="buyRow"><span>Price</span><b><i class="coin"></i>${price.toLocaleString()}</b></div><div class="buyRow"><span>You have</span><b><i class="coin"></i>${coins().toLocaleString()}</b></div><div class="buyRow"><span>After</span><b><i class="coin"></i>${(coins() - price).toLocaleString()}</b></div>`;
  BUYING = true;
  const ok = await uiConfirm('', { title: 'Buy ' + name + '?', cls: 'buyDlg', html, yes: 'Buy', no: 'Not now', gold: true,
    onOpen: box => { const cv = box.querySelector('.buyPrev'); if (cv) drawCarPreview(cv, ex.look, -0.4); } });
  BUYING = false; if (!ok) return;
  const allKey = kind.startsWith('all:') ? kind.slice(4) : null;
  if (allKey ? o[allKey] : o[kind].includes(id)) return;
  if (coins() < price) return pop('Need ' + (price - coins()).toLocaleString() + ' more coins', '#ff3b3b');
  ACCT.stats.coins = coins() - price; o.bought = (o.bought || 0) + 1;
  if (allKey) o[allKey] = true; else o[kind].push(id);
  if (typeof sndUi === 'function') sndUi('go');
  if (apply) apply(); achCheck(); saveCfg(); refreshMenu(); pop('Unlocked · ' + name, '#7bff4a', ex.sw && ex.sw.startsWith('#') ? { sw: ex.sw } : null);
}
const pr = n => '🪙 ' + n.toLocaleString();
const normHex = v => { v = String(v || '').trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + [...v.slice(1)].map(x => x + x).join(''); return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null; };
const RAINBOW = 'linear-gradient(90deg,#ff3b3b,#ffd60a,#7bff4a,#1ec8ff,#c04bff,#ff3fb4)';
function toShopBtn(row, show) {
  let b = row.querySelector('.toShop');
  if (show && !b) { b = document.createElement('button'); b.className = 'opt toShop'; b.textContent = 'Get more in the Shop →'; b.onclick = () => setTab('shop'); row.appendChild(b); }
  if (!show && b) b.remove();
}
// ---------- Shop tab ----------
const PREV = {}; // what the big shop preview is trying on (not saved until bought + equipped)
function shopPrevDraw() {
  const cv = $('shPrev'); if (!cv) return; const look = Object.assign(carLook(CFG), PREV);
  drawCarPreview(cv, look, -0.5);
  const t = carType(look.body), tried = Object.keys(PREV).length;
  $('shPrevDesc').textContent = t.name.toUpperCase() + (tried ? ' · previewing, not equipped' : ' · your current car');
  $('shPrevReset').classList.toggle('hidden', !tried);
}
function swatchFor(cat, c) { return cat.k === 'glow' ? `<div class="shGlow" style="--c:${c}"></div>` : cat.k === 'smoke' ? `<div class="shSmoke" style="--c:${c}"></div>` : `<div class="shSw" style="background:${c}"></div>`; }
function shopBuild() {
  const root = $('shopRoot'); if (!root || root.dataset.built) return; root.dataset.built = '1';
  root.innerHTML = `<div class="stage shStage"><canvas id="shPrev" width="960" height="340"></canvas><p><span id="shPrevDesc"></span> <button class="opt hidden" id="shPrevReset">Reset preview</button></p></div>
  <div id="coinBar" class="coinBar"></div>
  <h2 class="shH">Cars <small>Cosmetic only · every car handles the same · hover to preview</small></h2>
  <div class="shGrid">${CAR_TYPES.filter(t => SHOP.cars[t.id] !== undefined).map(t => `<div class="shCard" data-car="${t.id}"><canvas width="300" height="170"></canvas><b>${esc(t.name)}</b><span class="dim">${esc(t.desc)}</span><button class="shBtn"></button></div>`).join('')}</div>
  <h2 class="shH">Colours <small>Pick any hex code. Buy just that colour, or unlock every colour for the slot. Once bought it's in your Garage forever.</small></h2>
  <div class="shColGrid">${CATS.map(c => `<div class="shCard shCol" data-cat="${c.k}"><div class="shColHead"><b>${c.name}</b><small>${c.cost.toLocaleString()} each · ${c.allCost.toLocaleString()} all</small></div><span class="dim">${c.sub}</span><div class="shColSw">${swatchFor(c, c.def)}</div><div class="row"><input type="color" value="${c.def}" title="Colour picker"><input class="hex" maxlength="7" spellcheck="false" value="${c.def.toUpperCase()}" title="Hex code, e.g. #FF2A2A"></div><button class="shBtn one"></button><button class="shBtn all"></button></div>`).join('')}</div>
  <h2 class="shH">Secondary patterns <small>${SHOP.patCost} coins each · painted in your secondary colours · hover to preview</small></h2>
  <div class="shGrid sm">${LIVERIES.map(l => `<div class="shCard" data-pat="${l.id}"><canvas width="220" height="124"></canvas><b>${esc(l.name)}</b><button class="shBtn"></button></div>`).join('')}</div>`;
  $('shPrevReset').onclick = () => { for (const k in PREV) delete PREV[k]; shopPrevDraw(); };
  const hover = (el, k, v) => { el.onmouseenter = () => { el._old = PREV[k]; PREV[k] = v; shopPrevDraw(); }; el.onmouseleave = () => { if (el._old === undefined) delete PREV[k]; else PREV[k] = el._old; shopPrevDraw(); }; };
  root.querySelectorAll('[data-car]').forEach(d => {
    hover(d, 'body', d.dataset.car);
    d.querySelector('.shBtn').onclick = () => {
      const t = carType(d.dataset.car);
      if (shopOwn().cars.includes(t.id)) { if (CFG.body !== t.id) { CFG.body = t.id; saveCfg(); refreshMenu(); pop(t.name + ' equipped', '#1ec8ff'); } }
      else shopBuy('cars', t.id, SHOP.cars[t.id], 'the ' + t.name, () => { CFG.body = t.id; }, { look: Object.assign(carLook(CFG), PREV, { body: t.id }) });
    };
  });
  root.querySelectorAll('[data-cat]').forEach(d => {
    const cat = catBy(d.dataset.cat), cp = d.querySelector('input[type=color]'), hx = d.querySelector('.hex'), f = cat.f[0];
    const val = () => normHex(hx.value) || cp.value.toLowerCase();
    const tryOn = () => { PREV[f] = val(); shopPrevDraw(); shopUpdate(); };
    cp.oninput = () => { hx.value = cp.value.toUpperCase(); hx.classList.remove('bad'); tryOn(); };
    hx.oninput = () => { const v = normHex(hx.value); hx.classList.toggle('bad', !v); if (v) { cp.value = v; tryOn(); } };
    d.querySelector('.shBtn.one').onclick = () => {
      const c = normHex(hx.value); if (!c) return pop('Enter a hex code like #FF2A2A', '#ff3b3b');
      if (ownsCol(cat.k, c)) { if (lc(CFG[f]) === c && cat.opt) CFG[f] = ''; else CFG[f] = c; delete PREV[f]; saveCfg(); refreshMenu(); pop(CFG[f] ? cat.name + ' · ' + c.toUpperCase() : cat.name + ' off', '#1ec8ff', CFG[f] ? { sw: c } : null); }
      else shopBuy(cat.k, c, cat.cost, c.toUpperCase() + ' ' + cat.name.toLowerCase(), () => { CFG[f] = c; delete PREV[f]; }, { sw: c });
    };
    d.querySelector('.shBtn.all').onclick = () => { if (!shopOwn()[cat.all]) shopBuy('all:' + cat.all, 'all', cat.allCost, 'every ' + cat.name.toLowerCase() + ' colour', null, { sw: RAINBOW }); };
  });
  root.querySelectorAll('[data-pat]').forEach(d => {
    hover(d, 'livery', d.dataset.pat);
    d.querySelector('.shBtn').onclick = () => {
      const id = d.dataset.pat, l = LIVERIES.find(x => x.id === id);
      if (shopOwn().pat.includes(id)) { if (carLook(CFG).livery !== id) { CFG.livery = id; saveCfg(); refreshMenu(); pop(l.name + ' pattern equipped', '#1ec8ff'); } }
      else shopBuy('pat', id, SHOP.patCost, 'the ' + l.name + ' pattern', () => { CFG.livery = id; }, { look: Object.assign(carLook(CFG), PREV, { livery: id }) });
    };
  });
}
function shopUpdate() {
  const root = $('shopRoot'); if (!root || !root.dataset.built) return; const o = shopOwn(), have = coins();
  const set = (b, st, price) => { b.className = b.className.split(' ').filter(x => ['shBtn', 'one', 'all'].includes(x)).join(' ') + ' ' + st; b.innerHTML = st === 'eq' ? 'Equipped' : st === 'own' ? 'Owned · use it' : '<i class="coin"></i>' + price.toLocaleString(); };
  const buy = p => have >= p ? '' : 'poor';
  $('coinBar').innerHTML = `<i class="coin big"></i><b>${have.toLocaleString()}</b><span>coins</span><small>Earn coins from laps, drifting, distance and wins · ${o.cars.length}/${CAR_TYPES.length} cars owned</small>`;
  const base = carLook(CFG);
  root.querySelectorAll('[data-car]').forEach(d => { const id = d.dataset.car, own = o.cars.includes(id), eq = CFG.body === id;
    d.classList.toggle('own', own && !eq); d.classList.toggle('eq', eq); set(d.querySelector('.shBtn'), eq ? 'eq' : own ? 'own' : buy(SHOP.cars[id]), SHOP.cars[id]);
    drawCarPreview(d.querySelector('canvas'), Object.assign({}, base, { body: id }), -0.35); });
  root.querySelectorAll('[data-cat]').forEach(d => {
    const cat = catBy(d.dataset.cat), f = cat.f[0], hx = d.querySelector('.hex'), c = normHex(hx.value) || d.querySelector('input[type=color]').value.toLowerCase();
    d.querySelector('.shColSw').innerHTML = swatchFor(cat, c);
    const one = d.querySelector('.shBtn.one'), all = d.querySelector('.shBtn.all'), own = ownsCol(cat.k, c), eq = lc(CFG[f]) === c;
    if (eq) { set(one, 'eq'); if (cat.opt) one.textContent = 'Equipped · tap to remove'; }
    else if (own) { set(one, 'own'); one.textContent = 'Owned · use ' + c.toUpperCase(); }
    else { set(one, buy(cat.cost), cat.cost); one.innerHTML = 'Buy ' + c.toUpperCase() + ' · <i class="coin"></i>' + cat.cost.toLocaleString(); }
    if (o[cat.all]) { set(all, 'eq'); all.textContent = 'Every colour unlocked'; }
    else { set(all, buy(cat.allCost), cat.allCost); all.innerHTML = 'Buy all colours · <i class="coin"></i>' + cat.allCost.toLocaleString(); }
    d.classList.toggle('eq', !!o[cat.all]);
  });
  const curPat = base.livery;
  root.querySelectorAll('[data-pat]').forEach(d => { const id = d.dataset.pat, own = o.pat.includes(id), eq = curPat === id;
    d.classList.toggle('own', own && !eq); d.classList.toggle('eq', eq); set(d.querySelector('.shBtn'), eq ? 'eq' : own ? 'own' : buy(SHOP.patCost), SHOP.patCost);
    drawCarPreview(d.querySelector('canvas'), Object.assign({}, base, { livery: id, glow: '' }), -0.35); });
  shopPrevDraw();
}
// garage colour rows only show colours you own; the free picker appears once a slot is fully unlocked
function addSw(sws, c, on) { const x = document.createElement('div'); x.className = 'sw'; x.style.background = c; x.dataset.c = c; x.title = c.toUpperCase(); x.onclick = on; sws.appendChild(x); return x; }
// called at the end of refreshMenu: garage shows only what you own, shop shows prices, achievements list
function shopDecorate() {
  if (!$('tab-garage')) return; shopFix(); const o = shopOwn();
  document.querySelectorAll('#types .ty').forEach(d => d.classList.toggle('hidden', !o.cars.includes(d.dataset.b)));
  for (const f of ['color', 'accent2', 'accent', 'rim']) {
    const row = document.querySelector(`#paints .prow[data-f="${f}"]`); if (!row) continue; const k = CAT_OF[f], cat = catBy(k);
    const sws = row.querySelector('.sws'), have = new Set([...sws.querySelectorAll('.sw')].map(x => x.dataset.c.toLowerCase()));
    o[k].forEach(c => { if (have.has(c)) return; have.add(c); addSw(sws, c, () => { CFG[f] = c; saveCfg(); refreshMenu(); }); });
    sws.querySelectorAll('.sw').forEach(x => { x.classList.toggle('hidden', !ownsCol(k, x.dataset.c)); x.classList.toggle('on', x.dataset.c.toLowerCase() === lc(CFG[f])); });
    row.querySelectorAll('input').forEach(i => i.classList.toggle('hidden', !o[cat.all]));
    toShopBtn(row, !o[cat.all]);
  }
  // underglow + tyre smoke rows (hex colours, with a None option)
  for (const kind of ['glow', 'smoke']) {
    const cat = catBy(kind); let r = $('row_' + kind);
    if (!r) { r = document.createElement('div'); r.id = 'row_' + kind; r.className = 'xprow';
      r.innerHTML = `<b>${cat.name}</b><div class="sws"><div class="sw none" data-c="" title="None"></div></div><input type="color" title="Colour picker"><input class="hex" maxlength="7" spellcheck="false" placeholder="NONE" title="Hex code, e.g. #1EC8FF">`;
      $('paints').appendChild(r);
      r.querySelector('.sw.none').onclick = () => { CFG[kind] = ''; saveCfg(); refreshMenu(); };
      r.querySelector('input[type=color]').oninput = e => { CFG[kind] = e.target.value.toLowerCase(); saveCfg(); refreshMenu(); };
      const hi = r.querySelector('.hex'); hi.oninput = () => { const v = normHex(hi.value); hi.classList.toggle('bad', !v && hi.value.trim() !== ''); if (v) { CFG[kind] = v; saveCfg(); refreshMenu(); } }; hi.onblur = () => refreshMenu(); }
    const sws = r.querySelector('.sws'), have = new Set([...sws.querySelectorAll('.sw')].map(x => x.dataset.c));
    o[kind].forEach(c => { if (have.has(c)) return; addSw(sws, c, () => { CFG[kind] = c; saveCfg(); refreshMenu(); }).classList.add(kind === 'glow' ? 'glw' : 'smk'); });
    sws.querySelectorAll('.sw').forEach(x => x.classList.toggle('on', x.dataset.c === lc(CFG[kind] || '')));
    if (CFG[kind] && !sws.querySelector(`.sw[data-c="${lc(CFG[kind])}"]`) && o[cat.all]) { /* picked freely with the picker */ }
    const ci = r.querySelector('input[type=color]'), hi = r.querySelector('.hex'); ci.value = CFG[kind] || cat.def; if (document.activeElement !== hi) { hi.value = (CFG[kind] || '').toUpperCase(); hi.classList.remove('bad'); }
    r.querySelectorAll('input').forEach(i => i.classList.toggle('hidden', !o[cat.all]));
    toShopBtn(r, !o[cat.all]);
  }
  // secondary patterns: only the ones you own
  document.querySelectorAll('#livs .lvt').forEach(d => d.classList.toggle('hidden', !o.pat.includes(d.dataset.lv)));
  if ($('livs')) toShopBtn($('livs'), o.pat.length < LIVERIES.length);
  shopBuild(); shopUpdate();
  let ac = $('achBox'); if (!ac && $('tab-acct')) { ac = document.createElement('div'); ac.id = 'achBox'; ac.className = 'card'; $('tab-acct').appendChild(ac); }
  if (ac) { const s = ACCT.stats, a = s.ach || {}, n = ACH.filter(x => a[x[0]]).length;
    ac.innerHTML = `<label>Achievements · ${n}/${ACH.length}</label><div class="achs">` + ACH.map(([id, name, desc, , rw]) => `<div class="ach ${a[id] ? 'got' : ''}"><b>${a[id] ? '🏆' : '🔒'} ${esc(name)}</b><span>${esc(desc)}</span><small>${pr(rw)}</small></div>`).join('') + '</div>'; }
}
