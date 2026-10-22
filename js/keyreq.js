// ===== Forgot key: ask the admin from the Sign in box. When the admin approves, this browser signs in automatically. =====
(function () {
  const K = 'md_keyreq', g = id => document.getElementById(id);
  const get = () => { try { return JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) { return null; } };
  const say = t => { const m = g('krMsg'); if (m) m.textContent = t || ''; };
  const dev = () => { try { return localStorage.getItem('md_dev_id') || ''; } catch (e) { return ''; } };
  const tok = () => [...crypto.getRandomValues(new Uint8Array(24))].map(x => x.toString(16).padStart(2, '0')).join('');
  const online = () => typeof CLOUD !== 'undefined' && CLOUD;
  async function send() {
    const name = g('krName').value.trim(), note = g('krNote').value.trim();
    if (!name) return say('Type the name you played as.');
    if (!online()) return say('Online saving is off, so the admin cannot look up your key.');
    g('krSend').disabled = true; say('Sending…');
    try {
      const t = tok(), id = await sb('POST', 'rpc/request_key', { p_name: name, p_note: note, p_dev: dev(), p_token: t });
      localStorage.setItem(K, JSON.stringify({ id, t, name, at: Date.now() }));
      g('krBox').style.display = 'none'; g('krName').value = ''; g('krNote').value = '';
      say('Request sent! Keep the game open or come back later. You will be signed in automatically when the admin finds your account.');
    } catch (e) { say(/request_key|PGRST202|404|schema cache/i.test(e.message) ? 'Key requests are not switched on yet.' : e.message); }
    finally { g('krSend').disabled = false; }
  }
  async function check() {
    const r = get(); if (!r || !online()) return;
    try {
      const res = await sb('POST', 'rpc/check_key_request', { p_id: r.id, p_token: r.t }), row = Array.isArray(res) ? res[0] : res;
      if (!row) { localStorage.removeItem(K); return; }
      if (row.status === 'declined') { localStorage.removeItem(K); say('The admin could not match your request to an account. You can send another with more detail.'); return; }
      if (row.status === 'approved' && row.key) {
        localStorage.removeItem(K);
        await ACCT.restore(row.key);
        if (typeof saveCfg === 'function') saveCfg();
        if (typeof refreshMenu === 'function') refreshMenu();
        say('Found it, you are signed in! Your key is ' + row.key + '. Copy it somewhere safe.');
        try { if (typeof uiConfirm === 'function') uiConfirm('The admin found your account and signed you back in. Your key is ' + row.key + '. Copy it somewhere safe so this does not happen again.', { title: 'Welcome back!', yes: 'OK' }); } catch (e) { }
        return;
      }
      say('Your key request (as "' + r.name + '") is waiting for the admin.');
    } catch (e) { }
  }
  function init() {
    if (!g('krOpen')) return;
    g('krOpen').onclick = e => { e.preventDefault(); const b = g('krBox'), show = b.style.display === 'none'; b.style.display = show ? '' : 'none'; if (show) g('krName').focus(); };
    g('krSend').onclick = send;
    for (const id of ['krName', 'krNote']) g(id).onkeydown = e => { if (e.key === 'Enter') send(); e.stopPropagation(); };
    setTimeout(check, 3000); setInterval(check, 20000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
