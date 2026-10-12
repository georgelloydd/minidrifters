// Stand-ins for the dev dashboard helpers the track editor uses.
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const b64 = s => btoa(unescape(encodeURIComponent(s)));
const DCFG = { gameRepo: 'minidrifters', gameUrl: new URL('../', location.href).href };
function gameUrl() { return DCFG.gameUrl; }
function toast(m, kind) { const t = document.createElement('div'); t.className = 'toast ' + (kind || ''); t.textContent = m; $('toasts').appendChild(t); setTimeout(() => t.remove(), kind === 'err' ? 7000 : 3500); }
async function loadPublished() { return { list: [], from: 'browser' }; }
async function gh() { throw new Error('Not available here.'); }
async function publishTracks() { throw new Error('Not available here.'); }
async function clearTrack() { }
const CLOUD = !!(typeof ONLINE !== 'undefined' && ONLINE.SUPABASE_URL && ONLINE.SUPABASE_ANON_KEY), KEY = localStorage.getItem('md_key') || '';
async function rpc(fn, body) {
  const key = ONLINE.SUPABASE_ANON_KEY.trim(), h = { apikey: key, 'Content-Type': 'application/json' }; if (key.startsWith('eyJ')) h.Authorization = 'Bearer ' + key;
  const r = await fetch(ONLINE.SUPABASE_URL.trim().replace(/\/+$/, '') + '/rest/v1/rpc/' + fn, { method: 'POST', headers: h, body: JSON.stringify(body) });
  const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { }
  if (!r.ok) throw new Error((j && (j.message || j.hint)) || ('Error ' + r.status)); return j;
}
// first visit: bring over the old single-track draft, or start with an oval
(function seed() {
  let L = null; try { L = JSON.parse(localStorage.getItem('md_build_tracks') || 'null'); } catch (e) { }
  if (Array.isArray(L) && L.length) return;
  const TH = { grass: '#4c8c3c', grass2: '#5a9c47', road: '#3a3c42', sand: '#d8c48f', tree: ['#2f6e2a', '#3f8a35'] };
  let old = null; try { old = JSON.parse(localStorage.getItem('md_build_draft') || 'null'); } catch (e) { }
  const oval = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return [Math.round((.5 + Math.cos(a) * .34) * 1e4) / 1e4, Math.round((.5 + Math.sin(a) * .3) * 1e4) / 1e4]; });
  const d = old && Array.isArray(old.pts) && old.pts.length >= 4 ? { name: old.name || 'My track', width: old.width || 170, pts: old.pts, th: TH } : { name: 'My track', width: 170, pts: oval, th: TH };
  localStorage.setItem('md_build_tracks', JSON.stringify([d]));
})();
