// Player version of the editor: "Submit for review" sends the selected track to the developer.
const SUB_MAX = 300000;
async function publish() {
  if (!CLOUD) return toast('Online services are not set up on this site yet.', 'err');
  if (!KEY) return toast('Sign in in the game first (Profile), then come back to submit.', 'err');
  const d = clone(cur()); delete d.hidden; let note = '';
  if (d.bg && /^data:/.test(d.bg.src || '')) { delete d.bg; note = ' (the tracing image is not sent)'; }
  d.name = String(d.name || '').trim().slice(0, 40); if (!d.name) return toast('Give your track a name first.', 'err');
  if (!Array.isArray(d.pts) || d.pts.length < 4) return toast('The track needs at least 4 points.', 'err');
  const iss = (BLD.issues || []).filter(x => x.t === 'overlap').length; if (iss && !confirm('The road overlaps itself in ' + iss + ' place(s). Submit anyway?')) return;
  const len = JSON.stringify(d).length; if (len > SUB_MAX) return toast('This track is too big to submit (' + Math.round(len / 1000) + ' KB, max ' + SUB_MAX / 1000 + ' KB). Try fewer objects or barriers.', 'err');
  if (!confirm('Submit "' + d.name + '" for review?' + note)) return;
  const btn = $('bPub'); btn.disabled = true; btn.textContent = 'SENDING…';
  try { await rpc('submit_track', { p_key: KEY, p_name: d.name, p_def: d }); toast('Submitted! The developer will review it soon.', 'ok'); mine(); }
  catch (e) { toast(/submit_track|PGRST202|404/.test(e.message) ? 'Track submissions are not switched on yet (the database setup needs updating).' : /not valid/.test(e.message) ? 'The server rejected the track as too big or invalid. (The developer may need to update the database setup.)' : e.message, 'err'); }
  finally { btn.disabled = false; btn.textContent = 'SUBMIT FOR REVIEW'; }
}
async function mine() {
  if (!CLOUD || !KEY) return;
  try { const r = await rpc('my_submissions', { p_key: KEY }); $('bMine').innerHTML = r && r.length ? r.map(s => `<div class="sub"><span>${esc(s.name)}${s.note ? `<br><small class="dim">${esc(s.note)}</small>` : ''}</span><span class="st ${esc(s.status)}">${esc(s.status)}</span></div>`).join('') : 'None yet.'; } catch (e) { }
}
$('bAcc').textContent = !CLOUD ? 'Online services are not set up on this site yet, so tracks cannot be submitted.' : KEY ? 'Signed in. Pick a track on the left and submit it. Approved tracks get added to the game.' : 'Sign in in the game (Profile) to submit tracks. You can still build and test drive.';
addEventListener('resize', () => BLD_resize());
BLD_init().then(() => { $('bFrom').textContent = 'Your tracks are saved in this browser. Use Export to back them up.'; mine(); setTimeout(BLD_resize, 50); });
