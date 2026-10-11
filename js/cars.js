// ===== Car types + liveries (cosmetic only: every car uses the same physics in car.js) =====
const CAR_TYPES = [
  { id: 'drift', name: 'Drift SR', l: 1, w: 1.04, desc: 'Wide arches, front lip, big angle' },
  { id: 'street', name: 'Nissan Silvia', l: 1, w: 1, desc: 'The original all-rounder' },
  { id: 'micro', name: 'Peel P50', l: 0.62, w: 0.78, desc: 'Tiny one-seat bubble car', s: { shape: 'bubble', tw: 9, th: 7, ow: -1, lamps: 'one', tail: 'one' } },
  { id: 'kart', name: 'Go-Kart', l: 0.62, w: 0.82, desc: 'Open seat, you can see the driver', s: { shape: 'kart', tw: 10, th: 9, ow: 3 } },
  { id: 'minnow', name: 'Mini Cooper', l: 0.74, w: 0.9, desc: 'Classic little city car with a white roof', s: { r: 5, cab: [-0.06, 0.42, 0.8], roofAcc: 1, lamps: 'round', lw: 0.66, tail: 'rect' } },
  { id: 'bug', name: 'VW Beetle', l: 0.86, w: 0.92, desc: 'Round old-school beetle, engine in the back', s: { r: [12, 14, 14, 12], cab: [-0.08, 0.3, 0.7], lamps: 'round', tail: 'round', engine: 1 } },
  { id: 'hachi', name: 'Toyota AE86', l: 0.96, w: 0.96, desc: '80s drift legend with pop-up lights', s: { r: 4, cab: [-0.06, 0.3, 0.74], lamps: 'pop', tail: 'bar', wing: 'lip' } },
  { id: 'kei', name: 'Suzuki Carry', l: 0.9, w: 0.94, desc: 'Tiny cab with a flat bed' },
  { id: 'camper', name: 'VW Camper', l: 1.02, w: 0.98, desc: 'Split-screen surf van', s: { r: 8, cab: [-0.07, 0.76, 0.86], ws: 0.1, split: 1, rear: 0, roofAcc: 1, lamps: 'round', tail: 'rect' } },
  { id: 'pickup', name: 'Ford F-150', l: 1.12, w: 1.02, desc: 'Big cab, open bed', s: { r: 5, cab: [0.1, 0.2, 0.8], bed: 1, rear: 0, lamps: 'rect', tail: 'rect' } },
  { id: 'msedan', name: 'BMW M3', l: 1, w: 1.02, desc: 'Sports saloon, kidney grille, quad pipes', s: { r: 6, cab: [-0.04, 0.32, 0.76], lamps: 'quad', tail: 'rect', grille: 'kidney', exhaust: 4, wing: 'lip' } },
  { id: 'pony', name: 'Mustang GT', l: 1.08, w: 1.04, desc: 'V8 fastback, tri-bar tail lights', s: { r: 7, cab: [-0.1, 0.28, 0.72], lamps: 'rect', tail: 'tri', vents: 1, exhaust: 2 } },
  { id: 'muscle', name: 'Dodge Charger', l: 1.1, w: 1.06, desc: 'Hood scoop and twin stripes' },
  { id: 'flat6', name: 'Porsche 911', l: 0.96, w: 1, desc: 'Rear-engined icon with a ducktail', s: { shape: 'tear', cab: [-0.08, 0.3, 0.72], lamps: 'round', lw: 0.62, tail: 'bar', wing: 'duck', engine: 1 } },
  { id: 'rotary', name: 'Mazda RX-7', l: 1, w: 1.02, desc: 'Curvy 90s rotary, pop-ups and a wing', s: { shape: 'tear', cab: [-0.06, 0.24, 0.7], lamps: 'pop', lw: 0.6, tail: 'round', wing: 'duck' } },
  { id: 'rspec', name: 'Skyline R34', l: 1.04, w: 1.02, desc: 'Twin-turbo JDM, round tails, big wing', s: { r: 6, cab: [-0.06, 0.3, 0.74], lamps: 'rect', tail: 'quad', wing: 'big' } },
  { id: 'hellkat', name: 'Dodge Hellcat', l: 1.14, w: 1.08, desc: 'Supercharged monster, vents everywhere', s: { r: 6, cab: [-0.12, 0.28, 0.74], lamps: 'quad', tail: 'bar', vents: 1, scoop: 1, exhaust: 2 } },
  { id: 'wedge', name: 'Lambo Countach', l: 1.04, w: 1.08, desc: '80s poster supercar', s: { shape: 'wedge', cab: [-0.02, 0.26, 0.66], lamps: 'pop', lw: 0.3, tail: 'bar', vents: 1, wing: 'big' } },
  { id: 'f1', name: 'Formula 1', l: 1.14, w: 0.78, desc: 'Open wheels, front and rear wings' },
];
// removed cars map onto the closest new one
const CAR_ALIAS = { gt: 'flat6', hatch: 'minnow', rally: 'hachi' };
const LIVERIES = [
  { id: 'clean', name: 'Clean' }, { id: 'stripe', name: 'Stripe' }, { id: 'racing', name: 'Racing' },
  { id: 'checker', name: 'Checker' }, { id: 'carbon', name: 'Carbon' }, { id: 'flame', name: 'Flame' }, { id: 'camo', name: 'Camo' }, { id: 'split', name: 'Split' }, { id: 'fade', name: 'Fade' },
];
const FINISHES = [['gloss', 'Gloss'], ['matte', 'Matte'], ['metal', 'Metallic'], ['pearl', 'Pearl']];
const isHex = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
function mixHex(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
const LOOK_DEF = { color: '#ff3b3b', accent: '#ffffff', accent2: '#111111', rim: '#c9ccd2', finish: 'gloss', num: '7', livery: 'racing', body: 'drift', helmet: '#ffd60a' };
// liveries from the short-lived redesign map back onto the classic ones
const OLD_LV = { centre: 'stripe', stripes: 'racing', side: 'racing', chevron: 'stripe', number: 'clean' };
function carType(id) { id = CAR_ALIAS[id] || id; return CAR_TYPES.find(t => t.id === id) || CAR_TYPES[0]; }

// Sanitised cosmetic settings (also used for other players' cars received over the network)
function carLook(o) {
  o = o || {}; const lv = OLD_LV[o.livery] || o.livery;
  return { body: carType(o.body).id, color: isHex(o.color) ? o.color : LOOK_DEF.color, accent: isHex(o.accent) ? o.accent : LOOK_DEF.accent, accent2: isHex(o.accent2) ? o.accent2 : LOOK_DEF.accent2,
    rim: isHex(o.rim) ? o.rim : LOOK_DEF.rim, finish: FINISHES.some(f => f[0] === o.finish) ? o.finish : 'gloss', num: String(o.num === undefined ? LOOK_DEF.num : o.num).replace(/\D/g, '').slice(0, 2), livery: LIVERIES.some(l => l.id === lv) ? lv : 'clean', glow: isHex(o.glow) ? o.glow : '', smoke: isHex(o.smoke) ? o.smoke : '', helmet: isHex(o.helmet) ? o.helmet : LOOK_DEF.helmet };
}

function bodyPath(g, id, L, W) {
  const h = L / 2, w = W / 2; g.beginPath(); const S = carType(id).s; if (S) return specPath(g, S, h, w, L, W);
  if (id === 'gt') { g.moveTo(h, -w * 0.62); g.quadraticCurveTo(h + 2, 0, h, w * 0.62); g.lineTo(h * 0.55, w); g.lineTo(-h + 6, w); g.quadraticCurveTo(-h, w, -h, w - 6); g.lineTo(-h, -w + 6); g.quadraticCurveTo(-h, -w, -h + 6, -w); g.lineTo(h * 0.55, -w); g.closePath(); }
  else if (id === 'f1') { g.moveTo(h, -2.5); g.lineTo(h, 2.5); g.lineTo(h * 0.25, w * 0.42); g.lineTo(-h * 0.2, w * 0.8); g.lineTo(-h * 0.75, w * 0.8); g.lineTo(-h * 0.85, w * 0.4); g.lineTo(-h * 0.85, -w * 0.4); g.lineTo(-h * 0.75, -w * 0.8); g.lineTo(-h * 0.2, -w * 0.8); g.lineTo(h * 0.25, -w * 0.42); g.closePath(); }
  else if (id === 'kei') { g.roundRect(-h, -w, L, W, 4); }
  else if (id === 'hatch') { g.roundRect(-h, -w, L, W, [10, 4, 4, 10]); }
  else if (id === 'drift') { g.roundRect(-h, -w, L, W, 6); }
  else g.roundRect(-h, -w, L, W, id === 'muscle' ? 7 : 9);
}

function drawLivery(g, lv, col, L, W, id, a1, a2) {
  a1 = a1 || '#f4f4f4'; a2 = a2 || '#111111'; const h = L / 2, w = W / 2;
  if (lv === 'stripe') { g.fillStyle = a2; g.fillRect(-h, -4.6, L, 9.2); g.fillStyle = a1; g.fillRect(-h, -3.2, L, 6.4); }
  else if (lv === 'racing') { g.fillStyle = a2; g.fillRect(-h, -7.4, L, 5.6); g.fillRect(-h, 1.8, L, 5.6); g.fillStyle = a1; g.fillRect(-h, -6.6, L, 4); g.fillRect(-h, 2.6, L, 4); }
  else if (lv === 'checker') { const n = 6, s = W / n; for (let i = 0; i * s < L + s; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a2 : a1; g.fillRect(-h + i * s, -w + j * s, s + 0.4, s + 0.4); } }
  else if (lv === 'carbon') { const base = mixHex(a2, '#0c0c0f', 0.55), hi = mixHex(base, '#ffffff', 0.13), s = 3; g.fillStyle = base; g.fillRect(-h, -w, L, W); g.fillStyle = hi;
    for (let i = 0; i * s < L; i++) for (let j = 0; j * s < W; j++) { if ((i + j) % 2) g.fillRect(-h + i * s, -w + j * s, s, s / 2); else g.fillRect(-h + i * s, -w + j * s, s / 2, s); }
    g.fillStyle = a1; g.fillRect(-h, -w, L, 1.6); g.fillRect(-h, w - 1.6, L, 1.6); }
  else if (lv === 'flame') { for (const [c, k, len] of [[a2, 1.08, 0.86], [a1, 1, 0.8], [mixHex(a1, '#ffffff', 0.5), 0.6, 0.6]]) { g.fillStyle = c; g.beginPath(); g.moveTo(h + 2, -w * k); for (let i = 0; i <= 8; i++) { const y = -w * k + (2 * w * k) * i / 8; g.lineTo(h - L * (i % 2 ? len : len * 0.55), y); } g.lineTo(h + 2, w * k); g.closePath(); g.fill(); } }
  else if (lv === 'camo') { const r = rnd(7); g.fillStyle = mixHex(col, a2, 0.2); g.fillRect(-h, -w, L, W); for (let i = 0; i < 38; i++) { g.fillStyle = [a2, mixHex(col, a2, 0.55), mixHex(col, a1, 0.35)][i % 3]; g.beginPath(); g.ellipse(-h + r() * L, -w + r() * W, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, 7); g.fill(); } }
  else if (lv === 'split') { g.fillStyle = a1; g.beginPath(); g.moveTo(L * 0.1, -w - 1); g.lineTo(-L * 0.1, w + 1); g.lineTo(-h - 1, w + 1); g.lineTo(-h - 1, -w - 1); g.closePath(); g.fill(); g.strokeStyle = a2; g.lineWidth = 2.2; g.beginPath(); g.moveTo(L * 0.1, -w - 1); g.lineTo(-L * 0.1, w + 1); g.stroke(); }
  else if (lv === 'fade') { const gr = g.createLinearGradient(h, 0, -h, 0); gr.addColorStop(0, rgba(a1, 0)); gr.addColorStop(0.55, rgba(a1, 0.55)); gr.addColorStop(1, rgba(a1, 1)); g.fillStyle = gr; g.fillRect(-h, -w, L, W);
    const r = rnd(3); g.fillStyle = a2; for (let i = 0; i < 26; i++) { const x = -h + Math.pow(r(), 1.8) * L * 0.6; g.beginPath(); g.arc(x, -w + r() * W, 0.6 + r() * 1.1, 0, 7); g.fill(); } }
}

function finishShade(g, k, L, W) {
  const h = L / 2, w = W / 2;
  if (k === 'matte') { g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(-h, -w, L, W); return; }
  const gr = g.createLinearGradient(-h, -w, h, w);
  if (k === 'metal') { for (let i = 0; i <= 6; i++) gr.addColorStop(i / 6, i % 2 ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.08)'); }
  else if (k === 'pearl') { gr.addColorStop(0, 'rgba(255,140,220,.16)'); gr.addColorStop(0.5, 'rgba(255,255,255,.14)'); gr.addColorStop(1, 'rgba(120,200,255,.18)'); }
  else { gr.addColorStop(0.3, 'rgba(255,255,255,0)'); gr.addColorStop(0.42, 'rgba(255,255,255,.2)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); }
  g.fillStyle = gr; g.fillRect(-h, -w, L, W);
}
function drawCar(g, c, night) {
  const t = carType(c.body), id = t.id, L = CAR.L * t.l, W = CAR.W * t.w, h = L / 2, w = W / 2, col = c.color || '#ff3b3b', lv = c.livery || 'clean';
  g.save(); g.translate(c.x, c.y); g.rotate(c.a);
  if (night) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(h, 0, 4, h + 170, 0, 230); gr.addColorStop(0, 'rgba(255,240,200,.2)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(h * 0.9, -w * 0.7); g.lineTo(h + 250, -110); g.lineTo(h + 250, 110); g.lineTo(h * 0.9, w * 0.7); g.fill(); g.restore(); }
  if (c.glow) { g.save(); g.globalCompositeOperation = 'lighter'; const gg = g.createRadialGradient(0, 0, 3, 0, 0, L * 0.8); gg.addColorStop(0, rgba(c.glow, 0.6)); gg.addColorStop(0.6, rgba(c.glow, 0.22)); gg.addColorStop(1, rgba(c.glow, 0)); g.fillStyle = gg; g.beginPath(); g.ellipse(0, 0, L * 0.8, W * 1.05, 0, 0, 7); g.fill(); g.restore(); }
  // shadow
  g.fillStyle = 'rgba(0,0,0,.38)'; g.save(); g.translate(5, 7); bodyPath(g, id, L, W); g.fill(); g.restore();
  // wheels
  g.fillStyle = '#121214'; const S0 = t.s || {}, ow = S0.ow !== undefined ? S0.ow : id === 'f1' ? 8 : id === 'drift' ? 2 : 0, tw = S0.tw || (id === 'f1' ? 16 : 14), th = S0.th || (id === 'f1' ? 11 : 10);
  const rim = c.rim || '#c9ccd2';
  for (const sx of [-1, 1]) { g.fillStyle = '#121214'; g.fillRect(-L * 0.4, sx * (w + ow) - th / 2, tw, th); g.fillStyle = rim; g.fillRect(-L * 0.4 + tw * 0.28, sx * (w + ow) + (sx > 0 ? th / 2 - 2.6 : -th / 2), tw * 0.44, 2.6);
    g.save(); g.translate(L * 0.3, sx * (w + ow)); g.rotate((c.steer || 0) * 0.5); g.fillStyle = '#121214'; g.fillRect(-tw / 2, -th / 2, tw, th); g.fillStyle = rim; g.fillRect(-tw * 0.22, sx > 0 ? th / 2 - 2.6 : -th / 2, tw * 0.44, 2.6); g.restore(); }
  if (id === 'f1') { g.fillStyle = '#1a1a1d'; g.fillRect(h - 6, -w - 10, 6, W + 20); g.fillStyle = col; g.fillRect(h - 5, -w - 9, 4, W + 18); g.fillStyle = '#1a1a1d'; g.fillRect(-h - 2, -w * 0.95, 7, W * 1.9); }
  // body
  const bg = g.createLinearGradient(0, -w, 0, w); bg.addColorStop(0, shadeHex(col, 0.62)); bg.addColorStop(0.45, shadeHex(col, 1.18)); bg.addColorStop(0.55, shadeHex(col, 1.18)); bg.addColorStop(1, shadeHex(col, 0.62));
  bodyPath(g, id, L, W); g.fillStyle = bg; g.fill();
  g.save(); bodyPath(g, id, L, W); g.clip(); drawLivery(g, id === 'muscle' && lv === 'clean' ? 'racing' : lv, col, L, W, id, c.accent, c.accent2);
  finishShade(g, c.finish, L, W);
  if (id === 'kei') { g.fillStyle = shadeHex(col, 0.75); g.fillRect(-h, -w, L * 0.6, W); if (lv !== 'clean') { g.save(); g.beginPath(); g.rect(-h, -w, L * 0.6, W); g.clip(); drawLivery(g, lv, col, L, W, id, c.accent, c.accent2); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-h, -w, L * 0.6, W); g.restore(); } g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.5; g.strokeRect(-h + 3, -w + 3, L * 0.6 - 6, W - 6); g.beginPath(); g.moveTo(-h + 3 + L * 0.2, -w + 3); g.lineTo(-h + 3 + L * 0.2, w - 3); g.moveTo(-h + 3 + L * 0.4, -w + 3); g.lineTo(-h + 3 + L * 0.4, w - 3); g.stroke(); }
  g.restore();
  bodyPath(g, id, L, W); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1.5; g.stroke();
  // cabin / glass
  const glass = (x0, x1, y0, y1) => { const wg = g.createLinearGradient(x0, 0, x1, 0); wg.addColorStop(0, '#0d1420'); wg.addColorStop(1, '#4a6a8a'); g.fillStyle = wg; g.beginPath(); g.moveTo(x0, -y0); g.lineTo(x1, -y1); g.lineTo(x1, y1); g.lineTo(x0, y0); g.closePath(); g.fill(); };
  const elv = id === 'muscle' && lv === 'clean' ? 'racing' : lv, roof = (x, y, rw, rh) => { g.fillStyle = shadeHex(col, 1.3); g.beginPath(); g.roundRect(x, y, rw, rh, 4); g.fill();
    if (elv !== 'clean') { g.save(); g.beginPath(); g.roundRect(x, y, rw, rh, 4); g.clip(); drawLivery(g, elv, col, L, W, id, c.accent, c.accent2); finishShade(g, c.finish, L, W); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x, y, rw, rh); g.restore(); } g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.roundRect(x, y, rw, rh, 4); g.stroke(); };
  if (id === 'f1') { g.fillStyle = '#0d1420'; g.beginPath(); g.ellipse(-L * 0.05, 0, L * 0.11, w * 0.32, 0, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 2.5; g.beginPath(); g.arc(-L * 0.02, 0, w * 0.4, -1.2, 1.2); g.stroke(); drawHelmet(g, -L * 0.08, 0, 3.5, c.helmet); }
  else if (id === 'kei') { glass(h - L * 0.1, h - L * 0.2, w * 0.82, w * 0.72); roof(h - L * 0.4, -w * 0.78, L * 0.2, W * 0.78); }
  else if (id === 'hatch') { glass(L * 0.12, L * 0.28, w * 0.76, w * 0.6); roof(-h + 4, -w * 0.72, L * 0.62, W * 0.72); g.fillStyle = '#132030'; g.fillRect(-h + 2, -w * 0.62, 4, W * 0.62); g.fillStyle = shadeHex(col, 0.45); g.fillRect(-h - 2, -w * 0.85, 5, W * 0.85); }
  else if (t.s) specCab(g, c, t.s, L, W, col, glass, roof);
  else { const cx = id === 'muscle' ? -L * 0.12 : id === 'gt' ? -L * 0.08 : 0; glass(cx + L * 0.06, cx + L * 0.24, w * 0.76, w * 0.6); roof(cx - L * 0.2, -w * 0.72, L * 0.26, W * 0.72); g.fillStyle = '#132030'; g.fillRect(cx - L * 0.32, -w * 0.66, L * 0.1, W * 0.66); }
  // type extras
  if (id === 'gt' || id === 'drift' || id === 'street') { g.fillStyle = id === 'gt' ? '#18181b' : shadeHex(col, 0.45); const ww = id === 'gt' ? 8 : 6; g.fillRect(-h - (id === 'gt' ? 5 : 3), -w + (id === 'gt' ? -2 : 1), ww, W + (id === 'gt' ? 4 : -2)); }
  if (id === 'drift') { g.fillStyle = '#18181b'; g.fillRect(h - 2, -w + 2, 4, W - 4); g.fillStyle = shadeHex(col, 0.55); for (const sx of [-1, 1]) { g.fillRect(-L * 0.42, sx * w - (sx > 0 ? 3 : 0), 15, 3); g.fillRect(L * 0.23, sx * w - (sx > 0 ? 3 : 0), 15, 3); } }
  if (id === 'muscle') { g.fillStyle = '#18181b'; g.beginPath(); g.roundRect(L * 0.2, -4, L * 0.16, 8, 2); g.fill(); g.fillStyle = '#555'; g.fillRect(L * 0.33, -3, 2, 6); }
  if (id === 'rally') { g.fillStyle = '#18181b'; g.fillRect(h - 4, -w * 0.7, 5, W * 0.7); g.fillStyle = '#fff6c8'; for (let i = -1.5; i <= 1.5; i++) { g.beginPath(); g.arc(h - 1.5, i * W * 0.2, 2.6, 0, 7); g.fill(); } g.fillStyle = '#18181b'; g.fillRect(-L * 0.12, -3, 6, 6); g.fillStyle = '#f4f4f4'; g.beginPath(); g.arc(L * 0.02, w * 0.55, 5, 0, 7); g.fill(); g.fillStyle = '#111'; g.font = 'bold 7px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c.num || '7', L * 0.02, w * 0.55 + 0.5); g.fillStyle = '#c21d1d'; for (const sx of [-1, 1]) g.fillRect(-L * 0.32, sx * (w + 1) - 1.5, 3, 3); }
  // lights
  if (t.s) specLights(g, c, t.s, h, w, W);
  else { if (id !== 'f1') { g.fillStyle = '#fff6c8'; g.fillRect(h - 4, -w + 3, 4, 6); g.fillRect(h - 4, w - 9, 4, 6); }
  g.fillStyle = c.brake ? '#ff2a2a' : '#8a1010'; g.fillRect(-h, -w + 3, 3, 6); g.fillRect(-h, w - 9, 3, 6); }
  if (c.brake) { g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(-h, 0, 0, -h, 0, 40); rg.addColorStop(0, 'rgba(255,40,40,.5)'); rg.addColorStop(1, 'rgba(255,40,40,0)'); g.fillStyle = rg; g.fillRect(-h - 40, -40, 50, 80); g.restore(); }
  g.restore();
}
// Garage preview canvas: drawCarPreview(canvas, look, angle) (old form (canvas, body, color, livery, angle) still works)
function drawCarPreview(cv, a, b, c2, d) {
  const look = a && typeof a === 'object' ? a : { body: a, color: b, livery: c2 }, ang = a && typeof a === 'object' ? b : d;
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  const s = Math.min(cv.width / 84, cv.height / 54); g.translate(cv.width / 2, cv.height / 2); g.scale(s, s);
  drawCar(g, Object.assign({ x: 0, y: 0, a: ang === undefined ? -0.5 : ang, steer: 0.4 }, look), false); g.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- shared drawing for the newer cars (shape / cabin / extras / lights come from the car's spec) ----------
function drawHelmet(g, x, y, r, col) {
  col = isHex(col) ? col : '#ffd60a'; const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r); gr.addColorStop(0, shadeHex(col, 1.35)); gr.addColorStop(1, shadeHex(col, 0.75));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = 'rgba(8,12,20,.92)'; g.beginPath(); g.arc(x, y, r * 0.82, -0.95, 0.95); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 0.8; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
}
function specPath(g, S, h, w, L, W) {
  if (S.shape === 'bubble') g.ellipse(0, 0, h, w, 0, 0, 7);
  else if (S.shape === 'kart') g.roundRect(-h * 0.9, -w * 0.62, L * 0.9, W * 0.62, 4);
  else if (S.shape === 'wedge') { g.moveTo(h, -w * 0.5); g.lineTo(h, w * 0.5); g.lineTo(h * 0.25, w); g.lineTo(-h + 3, w); g.lineTo(-h, w - 3); g.lineTo(-h, -w + 3); g.lineTo(-h + 3, -w); g.lineTo(h * 0.25, -w); g.closePath(); }
  else if (S.shape === 'tear') g.roundRect(-h, -w, L, W, [6, w * 0.9, w * 0.9, 6]);
  else g.roundRect(-h, -w, L, W, S.r === undefined ? 8 : S.r);
}
function specCab(g, c, S, L, W, col, glass, roof) {
  const h = L / 2, w = W / 2, D = '#18181b';
  if (S.bed) { g.fillStyle = shadeHex(col, 0.42); g.beginPath(); g.roundRect(-h + 3, -w + 3, L * 0.44, W - 6, 2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); for (let i = 1; i < 4; i++) { const y = -w + 3 + (W - 6) * i / 4; g.moveTo(-h + 4, y); g.lineTo(-h + 2 + L * 0.44, y); } g.stroke(); }
  if (S.shape === 'bubble') { const gr = g.createRadialGradient(L * 0.14, -w * 0.25, 1, L * 0.06, 0, h * 0.62); gr.addColorStop(0, '#7a9cc0'); gr.addColorStop(1, '#0d1420'); g.fillStyle = gr; g.beginPath(); g.ellipse(L * 0.07, 0, h * 0.5, w * 0.66, 0, 0, 7); g.fill(); g.fillStyle = shadeHex(col, 1.25); g.beginPath(); g.ellipse(-L * 0.1, 0, h * 0.3, w * 0.58, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.stroke(); }
  else if (S.shape === 'kart') {
    g.fillStyle = D; g.fillRect(h - 4, -w * 0.72, 4, W * 0.72); g.fillRect(-h - 1, -w * 0.86, 4, W * 0.86);
    g.fillStyle = '#5a5d64'; g.fillRect(-L * 0.34, w * 0.36, L * 0.18, w * 0.34);
    g.fillStyle = D; g.beginPath(); g.roundRect(-L * 0.26, -w * 0.34, L * 0.2, W * 0.34, 3); g.fill();
    g.fillStyle = c.accent2 || '#2a2d33'; g.beginPath(); g.ellipse(-L * 0.1, 0, L * 0.07, w * 0.42, 0, 0, 7); g.fill();
    g.strokeStyle = '#222'; g.lineWidth = 2; g.beginPath(); g.arc(L * 0.1, 0, w * 0.26, -1.2, 1.2); g.stroke();
    drawHelmet(g, -L * 0.05, 0, 4.4, c.helmet);
  }
  else {
    const cb = S.cab || [0, 0.28, 0.72], cx = cb[0] * L, cl = cb[1] * L, cw = cb[2] * W, ws = (S.ws || 0.17) * L, fx = cx + cl / 2;
    if (S.rear !== 0) { g.fillStyle = '#132030'; g.fillRect(cx - cl / 2 - L * 0.09, -cw / 2 * 0.9, L * 0.09, cw * 0.9); }
    glass(fx, fx + ws, cw / 2 * 1.04, cw / 2 * 0.82); if (S.split) { g.fillStyle = shadeHex(col, 0.6); g.fillRect(fx, -0.8, ws, 1.6); }
    roof(cx - cl / 2, -cw / 2, cl, cw);
    if (S.roofAcc) { g.fillStyle = c.accent || '#f4f4f4'; g.beginPath(); g.roundRect(cx - cl / 2 + 1, -cw / 2 + 1, cl - 2, cw - 2, 4); g.fill(); }
  }
  if (S.vents) { g.fillStyle = D; for (const sx of [-1, 1]) { g.beginPath(); g.roundRect(L * 0.2, sx * W * 0.17 - 2, L * 0.14, 4, 2); g.fill(); } }
  if (S.scoop) { g.fillStyle = D; g.beginPath(); g.roundRect(L * 0.23, -3.5, L * 0.13, 7, 2); g.fill(); g.fillStyle = '#555'; g.fillRect(L * 0.34, -2.5, 1.5, 5); }
  if (S.engine) { g.fillStyle = 'rgba(0,0,0,.42)'; for (let i = 0; i < 4; i++) g.fillRect(-h + 4 + i * 3, -w * 0.34, 1.4, w * 0.68); }
  if (S.grille === 'kidney') { g.fillStyle = D; g.fillRect(h - 2.5, -4.6, 2.5, 3.6); g.fillRect(h - 2.5, 1, 2.5, 3.6); }
  if (S.wing === 'duck') { g.fillStyle = shadeHex(col, 0.5); g.beginPath(); g.roundRect(-h - 1, -w * 0.78, 5, W * 0.78, 2); g.fill(); }
  else if (S.wing === 'lip') { g.fillStyle = shadeHex(col, 0.45); g.fillRect(-h - 1.5, -w + 2, 3.5, W - 4); }
  else if (S.wing === 'big') { g.fillStyle = D; g.fillRect(-h - 7, -w - 1, 7, W + 2); g.fillStyle = c.accent2 || '#111111'; g.fillRect(-h - 7.5, -w - 2.5, 8.5, 2.6); g.fillRect(-h - 7.5, w - 0.1, 8.5, 2.6); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(-h - 6, -w, 2, W); }
  if (S.exhaust) { g.fillStyle = '#2a2a2e'; for (const y of S.exhaust === 4 ? [-w * 0.56, -w * 0.38, w * 0.38, w * 0.56] : [-w * 0.42, w * 0.42]) { g.beginPath(); g.arc(-h - 0.6, y, 1.5, 0, 7); g.fill(); } }
}
function specLights(g, c, S, h, w, W) {
  if (S.shape === 'kart') return;
  const dot = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }, ly = w * (S.lw || 0.72), F = S.lamps, T = S.tail;
  g.fillStyle = '#fff6c8';
  if (F === 'round') for (const s of [-1, 1]) dot(h - 4, s * ly, 2.8);
  else if (F === 'one') dot(h - 2.8, 0, 2.6);
  else if (F === 'pop') { g.fillStyle = 'rgba(0,0,0,.35)'; for (const s of [-1, 1]) g.fillRect(h - 9, s * ly - 2.5, 6, 5); g.fillStyle = '#fff6c8'; for (const s of [-1, 1]) g.fillRect(h - 1.6, s * ly - 2.5, 1.6, 5); }
  else if (F === 'quad') for (const s of [-1, 1]) { dot(h - 3.5, s * (w - 4), 2); dot(h - 3.5, s * (w - 8.5), 2); }
  else { g.fillRect(h - 4, -w + 3, 4, 6); g.fillRect(h - 4, w - 9, 4, 6); }
  g.fillStyle = c.brake ? '#ff2a2a' : '#8a1010';
  if (T === 'round') for (const s of [-1, 1]) dot(-h + 2.6, s * (w - 5), 2.3);
  else if (T === 'one') dot(-h + 2.2, 0, 2);
  else if (T === 'quad') for (const s of [-1, 1]) { dot(-h + 2.6, s * (w - 4), 2); dot(-h + 2.6, s * (w - 8.6), 2); }
  else if (T === 'tri') for (const s of [-1, 1]) for (let k = 0; k < 3; k++) g.fillRect(-h, s * (w - 3.5 - k * 2.6) - 0.8, 2.6, 1.6);
  else if (T === 'bar') g.fillRect(-h, -w + 3, 2.6, W - 6);
  else { g.fillRect(-h, -w + 3, 3, 6); g.fillRect(-h, w - 9, 3, 6); }
}
