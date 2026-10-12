// ===== Car types + secondary patterns (cosmetic only: every car uses the same physics in car.js) =====
const CAR_TYPES = [
  { id: 'drift', name: 'Drift SR', l: 1, w: 1.04, desc: 'Wide arches, front lip, big angle' },
  { id: 'street', name: 'Nissan Silvia', l: 1, w: 1, desc: 'The original all-rounder', s: { r: 6, cab: [-0.06, 0.3, 0.74], lamps: 'slant', lw: 0.7, tail: 'slant', arches: 1, mirrors: 1 } },
  { id: 'kart', name: 'Go-Kart', l: 0.62, w: 0.82, desc: 'Open seat, you can see the driver', s: { shape: 'kart', tw: 10, th: 9, ow: 3 } },
  { id: 'minnow', name: 'Mini Cooper', l: 0.74, w: 0.9, desc: 'Classic little city car with a white roof', s: { r: 5, cab: [-0.06, 0.42, 0.8], roofAcc: 1, lamps: 'round', lw: 0.66, tail: 'rect', grille: 'mini', arches: 1, mirrors: 1 } },
  { id: 'bug', name: 'VW Beetle', l: 0.86, w: 0.92, desc: 'Round old-school beetle, engine in the back', s: { shape: 'beetle', cab: [-0.06, 0.34, 0.6], cr: 8, lamps: 'round', tail: 'round', engine: 1, boards: 1, mirrors: 1 } },
  { id: 'hachi', name: 'Toyota AE86', l: 0.96, w: 0.96, desc: '80s drift legend with pop-up lights', s: { r: 4, cab: [-0.06, 0.3, 0.74], lamps: 'pop', tail: 'bar', wing: 'lip', arches: 1, mirrors: 1, grille: 'slot' } },
  { id: 'kei', name: 'Suzuki Carry', l: 0.9, w: 0.94, desc: 'Tiny cab with a flat bed' },
  { id: 'camper', name: 'VW Camper', l: 1.02, w: 0.98, desc: 'Split-screen surf van', s: { r: 8, cab: [-0.07, 0.76, 0.86], ws: 0.1, split: 1, rear: 0, roofAcc: 1, lamps: 'round', tail: 'rect', vee: 1, mirrors: 1 } },
  { id: 'pickup', name: 'Ford F-150', l: 1.12, w: 1.02, desc: 'Big cab, open bed', s: { r: 5, cab: [0.1, 0.2, 0.8], bed: 1, rear: 0, lamps: 'rect', tail: 'rect', grille: 'bars', arches: 1, mirrors: 1 } },
  { id: 'msedan', name: 'BMW M3', l: 1, w: 1.02, desc: 'Sports saloon, kidney grille, quad pipes', s: { r: 6, cab: [-0.04, 0.32, 0.76], lamps: 'quad', tail: 'rect', grille: 'kidney', exhaust: 4, wing: 'lip', arches: 1, mirrors: 1, hood: 1 } },
  { id: 'pony', name: 'Mustang GT', l: 1.08, w: 1.04, desc: 'V8 fastback, tri-bar tail lights', s: { r: 7, cab: [-0.1, 0.28, 0.72], lamps: 'rect', tail: 'tri', vents: 1, exhaust: 2, grille: 'pony', hood: 1, arches: 1, fast: 1, mirrors: 1 } },
  { id: 'muscle', name: 'Dodge Charger', l: 1.1, w: 1.06, desc: 'Hood scoop and twin stripes', s: { r: 7, cab: [-0.12, 0.26, 0.74], lamps: 'hidden', tail: 'bar', grille: 'full', arches: 1, mirrors: 1, exhaust: 2 } },
  { id: 'flat6', name: 'Porsche 911', l: 0.96, w: 1, desc: 'Rear-engined icon with a ducktail', s: { shape: 'tear', cab: [-0.08, 0.3, 0.72], lamps: 'round', lw: 0.62, tail: 'bar', wing: 'duck', engine: 1, arches: 1, fast: 1, mirrors: 1 } },
  { id: 'rotary', name: 'Mazda RX-7', l: 1, w: 1.02, desc: 'Curvy 90s rotary, pop-ups and a wing', s: { shape: 'tear', cab: [-0.06, 0.24, 0.7], lamps: 'pop', lw: 0.6, tail: 'round', wing: 'duck', arches: 1, mirrors: 1 } },
  { id: 'rspec', name: 'Skyline R34', l: 1.04, w: 1.02, desc: 'Twin-turbo JDM, round tails, big wing', s: { r: 6, cab: [-0.06, 0.3, 0.74], lamps: 'rect', tail: 'quad', wing: 'big', arches: 1, mirrors: 1, grille: 'slot' } },
  { id: 'hellkat', name: 'Dodge Hellcat', l: 1.14, w: 1.08, desc: 'Supercharged monster, vents everywhere', s: { r: 6, cab: [-0.12, 0.28, 0.74], lamps: 'quad', tail: 'bar', vents: 1, scoop: 1, exhaust: 2, grille: 'full', hood: 1, arches: 1, mirrors: 1 } },
  { id: 'f1', name: 'Formula 1', l: 1.14, w: 0.78, desc: 'Open wheels, front and rear wings' },
];
// removed cars map onto the closest new one
const CAR_ALIAS = { gt: 'flat6', hatch: 'minnow', rally: 'hachi', micro: 'minnow', wedge: 'flat6' };
const LIVERIES = [
  { id: 'clean', name: 'Clean' }, { id: 'stripe', name: 'Stripe' }, { id: 'racing', name: 'Racing' },
  { id: 'checker', name: 'Checker' }, { id: 'carbon', name: 'Carbon' }, { id: 'flame', name: 'Flame' }, { id: 'camo', name: 'Camo' }, { id: 'split', name: 'Split' }, { id: 'fade', name: 'Fade' },
  { id: 'lemans', name: 'Le Mans' }, { id: 'arrow', name: 'Chevron' }, { id: 'tiger', name: 'Tiger' }, { id: 'honeycomb', name: 'Honeycomb' }, { id: 'circuit', name: 'Circuit' },
  { id: 'wave', name: 'Wave' }, { id: 'shard', name: 'Shard' }, { id: 'retro', name: 'Retro' }, { id: 'pinstripe', name: 'Pinstripe' }, { id: 'drip', name: 'Drip' },
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

function drawLiveryBase(g, lv, col, L, W, id, a1, a2) {
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

// newer secondary patterns (+x is the front of the car, y runs across it)
const LV2 = {
  lemans(g, col, L, W, a1, a2, h, w) { const b = W * 0.2; g.fillStyle = a2; g.fillRect(-h, -b - 2.6, L, 2 * b + 5.2); g.fillStyle = col; g.fillRect(-h, -b - 1.3, L, 2 * b + 2.6); g.fillStyle = a1; g.fillRect(-h, -b, L, 2 * b); },
  arrow(g, col, L, W, a1, a2, h, w) {
    const shape = (x0, d, t) => { g.beginPath(); g.moveTo(x0, -w - 1); g.lineTo(x0 + d, 0); g.lineTo(x0, w + 1); g.lineTo(x0 - t, w + 1); g.lineTo(x0 + d - t, 0); g.lineTo(x0 - t, -w - 1); g.closePath(); g.fill(); };
    for (let k = 0; k < 3; k++) { const x0 = -h + L * (0.08 + k * 0.16), d = L * 0.13; g.globalAlpha = 1 - k * 0.27; g.fillStyle = a2; shape(x0 + 0.8, d, 4.8); g.fillStyle = a1; shape(x0, d, 3.4); }
    g.globalAlpha = 1; },
  tiger(g, col, L, W, a1, a2, h, w) { const r = rnd(11); g.fillStyle = a2;
    for (let i = 0; i < 7; i++) { const x = -h + L * (0.06 + i * 0.125) + r() * 2; for (const s of [-1, 1]) { const len = w * (0.45 + r() * 0.42), th = 2 + r() * 1.6;
      g.beginPath(); g.moveTo(x - th, s * (w + 1)); g.quadraticCurveTo(x + th * 0.4, s * (w - len * 0.5), x + th * 1.6 + r() * 2, s * (w - len)); g.quadraticCurveTo(x + th * 1.2, s * (w - len * 0.45), x + th, s * (w + 1)); g.closePath(); g.fill(); } } },
  honeycomb(g, col, L, W, a1, a2, h, w) { const r = rnd(8), s = 3.1, dx = s * 1.5, dy = s * Math.sqrt(3); g.lineWidth = 0.7; g.strokeStyle = a1;
    for (let i = 0; i * dx < L + s; i++) for (let j = -1; j * dy < W + dy; j++) { const x = -h + i * dx, y = -w + j * dy + (i % 2 ? dy / 2 : 0), a = Math.max(0, 1 - (x + h) / L * 1.35); if (a <= 0.02) continue;
      g.globalAlpha = a; g.beginPath(); for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; g[k ? 'lineTo' : 'moveTo'](x + Math.cos(an) * s * 0.92, y + Math.sin(an) * s * 0.92); } g.closePath(); if (r() < 0.22 * a) { g.fillStyle = a2; g.fill(); } g.stroke(); }
    g.globalAlpha = 1; },
  circuit(g, col, L, W, a1, a2, h, w) { const r = rnd(5); g.save(); g.strokeStyle = a1; g.lineWidth = 0.9; g.shadowColor = a1; g.shadowBlur = 3;
    for (let i = 0; i < 10; i++) { let y = -w + 2 + r() * (W - 4), x = -h - 1; g.beginPath(); g.moveTo(x, y); x += L * (0.12 + r() * 0.22); g.lineTo(x, y);
      const ny = clampN(y + (r() < 0.5 ? -1 : 1) * (2 + r() * 5), -w + 1.5, w - 1.5); x += Math.abs(ny - y); y = ny; g.lineTo(x, y); x += L * (0.06 + r() * 0.2); g.lineTo(x, y); g.stroke();
      g.fillStyle = a1; g.beginPath(); g.arc(x, y, 1.3, 0, 7); g.fill(); g.fillStyle = a2; g.beginPath(); g.arc(x, y, 0.55, 0, 7); g.fill(); }
    g.restore(); },
  wave(g, col, L, W, a1, a2, h, w) { const band = (off, amp, th, c) => { g.fillStyle = c; g.beginPath(); const N = 48, Y = i => Math.sin(i / N * Math.PI * 2.4 + off) * w * amp;
      for (let i = 0; i <= N; i++) g[i ? 'lineTo' : 'moveTo'](-h + L * i / N, Y(i) - th); for (let i = N; i >= 0; i--) g.lineTo(-h + L * i / N, Y(i) + th); g.closePath(); g.fill(); };
    band(0, 0.42, 3.8, a2); band(0, 0.42, 2.5, a1); band(Math.PI, 0.5, 0.9, a2); },
  shard(g, col, L, W, a1, a2, h, w) { const r = rnd(9), C = 7, Rw = 4, X0 = -h - 2, XL = L * 0.72, P = [];
    for (let i = 0; i <= C; i++) { P[i] = []; for (let j = 0; j <= Rw; j++) { const ed = i === 0 || i === C || j === 0 || j === Rw; P[i][j] = [X0 + XL * i / C + (ed ? 0 : (r() - 0.5) * XL / C * 0.7), -w - 2 + (W + 4) * j / Rw + (ed ? 0 : (r() - 0.5) * W / Rw * 0.6)]; } }
    const pal = [a1, a2, mixHex(a1, a2, 0.5), mixHex(col, a1, 0.55), mixHex(col, a2, 0.4)];
    for (let i = 0; i < C; i++) for (let j = 0; j < Rw; j++) for (const t of [[P[i][j], P[i + 1][j], P[i][j + 1]], [P[i + 1][j], P[i + 1][j + 1], P[i][j + 1]]]) {
      const f = i / C; if (r() < f * f * 1.1) continue; g.fillStyle = pal[Math.floor(r() * pal.length)]; g.beginPath(); g.moveTo(...t[0]); g.lineTo(...t[1]); g.lineTo(...t[2]); g.closePath(); g.fill(); } },
  retro(g, col, L, W, a1, a2, h, w) { for (let i = 0; i < 4; i++) { const c = mixHex(a1, a2, i / 3), y0 = w * 0.16 + i * 2.7, kink = -h + L * (0.3 - i * 0.05);
    for (const s of [-1, 1]) { g.fillStyle = c; g.beginPath(); g.moveTo(h + 1, s * y0); g.lineTo(kink, s * y0); g.lineTo(kink - 4, s * (y0 + 4)); g.lineTo(-h - 1, s * (y0 + 4)); g.lineTo(-h - 1, s * (y0 + 5.9)); g.lineTo(kink - 4, s * (y0 + 5.9)); g.lineTo(kink, s * (y0 + 1.9)); g.lineTo(h + 1, s * (y0 + 1.9)); g.closePath(); g.fill(); } } },
  pinstripe(g, col, L, W, a1, a2, h, w) { g.strokeStyle = a1; g.lineWidth = 0.8; g.beginPath(); g.roundRect(-h + 2.2, -w + 2.2, L - 4.4, W - 4.4, 6); g.stroke();
    g.strokeStyle = a2; g.lineWidth = 0.6; g.beginPath(); g.roundRect(-h + 3.7, -w + 3.7, L - 7.4, W - 7.4, 5); g.stroke();
    g.lineWidth = 1.5; for (const s of [-1, 1]) { g.strokeStyle = a1; g.beginPath(); g.moveTo(-h + 5, s * w * 0.62); g.bezierCurveTo(-h * 0.2, s * w * 0.62, h * 0.15, s * w * 0.12, h - 6, s * w * 0.18); g.stroke(); } },
  drip(g, col, L, W, a1, a2, h, w) { const r = rnd(4), x0 = h - L * 0.17; g.fillStyle = a1; g.fillRect(x0, -w - 1, h - x0 + 2, W + 2);
    for (let y = -w + 1.2; y < w; y += 3 + r() * 1.2) { const len = L * (0.04 + r() * 0.3), rw = 1 + r() * 0.7; g.fillRect(x0 - len, y - rw, len + 0.6, rw * 2); g.beginPath(); g.arc(x0 - len, y, rw * 1.3, 0, 7); g.fill(); }
    g.fillStyle = a2; g.fillRect(x0 + 2.2, -w - 1, 1, W + 2); },
};
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
function drawLivery(g, lv, col, L, W, id, a1, a2) {
  a1 = a1 || '#f4f4f4'; a2 = a2 || '#111111';
  if (LV2[lv]) return LV2[lv](g, col, L, W, a1, a2, L / 2, W / 2);
  return drawLiveryBase(g, lv, col, L, W, id, a1, a2);
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
// neon underglow: soft car-shaped haze, a bright pool under the floor and light tubes along the sills, with a gentle pulse
function drawUnderglow(g, col, L, W, night) {
  const t = performance.now() / 1000, p = (0.9 + 0.1 * Math.sin(t * 2.6)) * (night ? 1.25 : 1), hot = typeof shadeHex === 'function' ? shadeHex(col, 1.7) : '#ffffff';
  const rr = (x, y, w, h, r) => { g.beginPath(); r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  g.save(); g.globalCompositeOperation = 'lighter';
  { const m = g.getTransform(), sc = Math.hypot(m.a, m.b) || 1; // smooth haze via shadow blur (no visible banding)
    g.save(); g.translate(0, -4000); g.shadowOffsetX = m.c * 4000; g.shadowOffsetY = m.d * 4000; // offset in screen space so it lines up at any car angle g.shadowColor = rgba(col, 0.55 * Math.min(1, p)); g.fillStyle = '#000';
    g.shadowBlur = 34 * sc; rr(-L * 0.5, -W * 0.52, L, W * 1.04, W * 0.35); g.fill();
    g.shadowColor = rgba(col, 0.7 * Math.min(1, p)); g.shadowBlur = 14 * sc; rr(-L * 0.46, -W * 0.5, L * 0.92, W, W * 0.3); g.fill(); g.restore(); }
  const gg = g.createRadialGradient(0, 0, 2, 0, 0, L * 0.62); gg.addColorStop(0, rgba(col, 0.5 * p)); gg.addColorStop(0.7, rgba(col, 0.16 * p)); gg.addColorStop(1, rgba(col, 0));
  g.fillStyle = gg; g.beginPath(); g.ellipse(0, 0, L * 0.64, W * 0.95, 0, 0, 7); g.fill();
  for (const sy of [-1, 1]) { const y = sy * W * 0.53, lg = g.createLinearGradient(0, y - 6, 0, y + 6);
    lg.addColorStop(0, rgba(col, 0)); lg.addColorStop(0.5, rgba(col, 0.75 * p)); lg.addColorStop(1, rgba(col, 0)); g.fillStyle = lg; rr(-L * 0.4, y - 6, L * 0.8, 12, 6); g.fill();
    g.fillStyle = rgba(hot, 0.55 * p); rr(-L * 0.34, y - 0.9, L * 0.68, 1.8, 1); g.fill(); }
  for (const sx of [-1, 1]) { const x = sx * L * 0.5, lg = g.createLinearGradient(x - 6, 0, x + 6, 0); lg.addColorStop(0, rgba(col, 0)); lg.addColorStop(0.5, rgba(col, 0.35 * p)); lg.addColorStop(1, rgba(col, 0)); g.fillStyle = lg; g.fillRect(x - 6, -W * 0.3, 12, W * 0.6); }
  g.restore();
}
function drawCar(g, c, night) {
  const t = carType(c.body), id = t.id, L = CAR.L * t.l, W = CAR.W * t.w, h = L / 2, w = W / 2, col = c.color || '#ff3b3b', lv = c.livery || 'clean';
  g.save(); g.translate(c.x, c.y); g.rotate(c.a);
  if (night) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(h, 0, 4, h + 170, 0, 230); gr.addColorStop(0, 'rgba(255,240,200,.2)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(h * 0.9, -w * 0.7); g.lineTo(h + 250, -110); g.lineTo(h + 250, 110); g.lineTo(h * 0.9, w * 0.7); g.fill(); g.restore(); }
  if (c.glow) drawUnderglow(g, c.glow, L, W, night);
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
  else if (S.shape === 'beetle') { g.roundRect(-h + 2, -w * 0.76, L - 4, W * 0.76, w * 0.7); const tw = S.tw || 14; for (const ax of [-L * 0.4 + tw / 2, L * 0.3]) for (const sx of [-1, 1]) { g.moveTo(ax + tw * 0.78, sx * w * 0.6); g.ellipse(ax, sx * w * 0.6, tw * 0.78, w * 0.4, 0, 0, 7); } }
  else if (S.shape === 'tear') g.roundRect(-h, -w, L, W, [6, w * 0.9, w * 0.9, 6]);
  else g.roundRect(-h, -w, L, W, S.r === undefined ? 8 : S.r);
}
function specCab(g, c, S, L, W, col, glass, roof) {
  const h = L / 2, w = W / 2, D = '#18181b';
  if (S.bed) { g.fillStyle = shadeHex(col, 0.42); g.beginPath(); g.roundRect(-h + 3, -w + 3, L * 0.44, W - 6, 2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); for (let i = 1; i < 4; i++) { const y = -w + 3 + (W - 6) * i / 4; g.moveTo(-h + 4, y); g.lineTo(-h + 2 + L * 0.44, y); } g.stroke(); }
  const tw0 = S.tw || 14, axles = [-L * 0.4 + tw0 / 2, L * 0.3];
  if (S.arches) for (const ax of axles) for (const sx of [-1, 1]) { g.fillStyle = 'rgba(255,255,255,.13)'; g.beginPath(); g.ellipse(ax, sx * (w - 2.2), tw0 * 0.64, 2.4, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(ax, sx * (w - 0.7), tw0 * 0.6, 1.1, 0, 0, 7); g.fill(); }
  if (S.shape === 'beetle') for (const ax of axles) for (const sx of [-1, 1]) { g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.ellipse(ax - 1, sx * w * 0.52, tw0 * 0.55, w * 0.18, 0, 0, 7); g.fill(); }
  if (S.boards) { g.fillStyle = '#2a2a2e'; for (const sx of [-1, 1]) g.fillRect(axles[0] + tw0 * 0.7, sx * w * 0.8 - 1.2, axles[1] - axles[0] - tw0 * 1.4, 2.4); }
  if (S.hood) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(L * 0.12, -3.2, h - L * 0.12 - 3, 6.4); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(L * 0.12, 3.2, h - L * 0.12 - 3, 0.9); }
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
    if (S.fast) glass(cx - cl / 2, cx - cl / 2 - L * 0.17, cw / 2 * 0.92, cw / 2 * 0.5);
    else if (S.rear !== 0) { g.fillStyle = '#132030'; g.fillRect(cx - cl / 2 - L * 0.09, -cw / 2 * 0.9, L * 0.09, cw * 0.9); }
    if (S.mirrors) { g.fillStyle = shadeHex(col, 0.7); for (const sx of [-1, 1]) { g.beginPath(); g.roundRect(fx + 1, sx * (w + 1.4) - 1.4, 3.6, 2.8, 1); g.fill(); } }
    glass(fx, fx + ws, cw / 2 * 1.04, cw / 2 * 0.82); if (S.split) { g.fillStyle = shadeHex(col, 0.6); g.fillRect(fx, -0.8, ws, 1.6); }
    if (S.cr) { g.fillStyle = shadeHex(col, 1.3); g.beginPath(); g.roundRect(cx - cl / 2, -cw / 2, cl, cw, S.cr); g.fill(); g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(cx + 1, -cw * 0.12, cl * 0.32, cw * 0.2, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.roundRect(cx - cl / 2, -cw / 2, cl, cw, S.cr); g.stroke(); }
    else roof(cx - cl / 2, -cw / 2, cl, cw);
    if (S.roofAcc) { g.fillStyle = c.accent || '#f4f4f4'; g.beginPath(); g.roundRect(cx - cl / 2 + 1, -cw / 2 + 1, cl - 2, cw - 2, 4); g.fill(); }
  }
  if (S.vents) { g.fillStyle = D; for (const sx of [-1, 1]) { g.beginPath(); g.roundRect(L * 0.2, sx * W * 0.17 - 2, L * 0.14, 4, 2); g.fill(); } }
  if (S.scoop) { g.fillStyle = D; g.beginPath(); g.roundRect(L * 0.23, -3.5, L * 0.13, 7, 2); g.fill(); g.fillStyle = '#555'; g.fillRect(L * 0.34, -2.5, 1.5, 5); }
  if (S.engine) { g.fillStyle = 'rgba(0,0,0,.42)'; for (let i = 0; i < 4; i++) g.fillRect(-h + 4 + i * 3, -w * 0.34, 1.4, w * 0.68); }
  if (S.vee) { g.fillStyle = c.accent || '#f4f4f4'; g.beginPath(); g.moveTo(h - 0.5, -w * 0.82); g.lineTo(h - L * 0.17, 0); g.lineTo(h - 0.5, w * 0.82); g.closePath(); g.fill(); g.fillStyle = '#d8dbe0'; g.beginPath(); g.arc(h - 2.6, 0, 2.2, 0, 7); g.fill(); g.fillStyle = '#5a5d64'; g.beginPath(); g.arc(h - 2.6, 0, 1.1, 0, 7); g.fill(); }
  if (S.grille === 'mini') { g.fillStyle = '#c9ccd2'; g.beginPath(); g.roundRect(h - 2.6, -4.4, 2.6, 8.8, 1.2); g.fill(); g.fillStyle = '#18181b'; g.fillRect(h - 1.9, -3.4, 1.4, 6.8); }
  if (S.grille === 'bars') { g.fillStyle = '#c9ccd2'; g.fillRect(h - 3, -w * 0.52, 3, W * 0.52); g.fillStyle = '#18181b'; for (const y of [-w * 0.3, 0, w * 0.3]) g.fillRect(h - 2.4, y - 1.6, 1.8, 3.2 - 1.4); }
  if (S.grille === 'full') { g.fillStyle = '#0e0e10'; g.fillRect(h - 3, -w + 2, 3, W - 4); g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 1; i < 6; i++) g.fillRect(h - 3, -w + 2 + (W - 4) * i / 6, 3, 0.6); }
  if (S.grille === 'pony') { g.fillStyle = '#121214'; g.fillRect(h - 2.8, -w * 0.46, 2.8, w * 0.92); g.fillStyle = '#c9ccd2'; g.fillRect(h - 2.2, -0.9, 1.6, 1.8); }
  if (S.grille === 'slot') { g.fillStyle = '#18181b'; g.fillRect(h - 2, -w * 0.4, 2, w * 0.8); }
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
  else if (F === 'hidden') { }
  else if (F === 'slant') for (const s of [-1, 1]) { g.beginPath(); g.moveTo(h - 0.6, s * (w - 2)); g.lineTo(h - 7.5, s * (w - 2.2)); g.lineTo(h - 1.2, s * (w - 6.6)); g.closePath(); g.fill(); }
  else if (F === 'quad') for (const s of [-1, 1]) { dot(h - 3.5, s * (w - 4), 2); dot(h - 3.5, s * (w - 8.5), 2); }
  else { g.fillRect(h - 4, -w + 3, 4, 6); g.fillRect(h - 4, w - 9, 4, 6); }
  g.fillStyle = c.brake ? '#ff2a2a' : '#8a1010';
  if (T === 'round') for (const s of [-1, 1]) dot(-h + 2.6, s * (w - 5), 2.3);
  else if (T === 'one') dot(-h + 2.2, 0, 2);
  else if (T === 'quad') for (const s of [-1, 1]) { dot(-h + 2.6, s * (w - 4), 2); dot(-h + 2.6, s * (w - 8.6), 2); }
  else if (T === 'tri') for (const s of [-1, 1]) for (let k = 0; k < 3; k++) g.fillRect(-h, s * (w - 3.5 - k * 2.6) - 0.8, 2.6, 1.6);
  else if (T === 'slant') for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-h, s * (w - 2)); g.lineTo(-h + 5.5, s * (w - 2.4)); g.lineTo(-h, s * (w - 7.5)); g.closePath(); g.fill(); }
  else if (T === 'bar') g.fillRect(-h, -w + 3, 2.6, W - 6);
  else { g.fillRect(-h, -w + 3, 3, 6); g.fillRect(-h, w - 9, 3, 6); }
}
