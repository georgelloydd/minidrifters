// ===== Ban: set from the dev site's Players tab. Stored as { ban: 1 } in the player's tweaks row, so it needs no new SQL. =====
// A banned device keeps a flag in localStorage ("cookie"), so logging out or playing as a guest does not get round it.
// The flag is only cleared when the server says that account is no longer banned.
(function () {
  const KEY = 'md_ban';
  const st = document.createElement('style');
  st.textContent = '#banOv{position:fixed;inset:0;z-index:99999;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#0a0a0c;color:#eee;padding:24px}#banOv h1{margin:0;font-size:64px;font-weight:900;font-style:italic;color:var(--red,#ff2a2a);letter-spacing:2px}#banOv p{max-width:460px;color:#aaa;font-size:16px}';
  document.head.appendChild(st);
  const ov = document.createElement('div'); ov.id = 'banOv'; ov.innerHTML = '<h1>⛔ BANNED</h1><p>This account has been banned from Mini Drifters. If you think this is a mistake, contact the admin.</p>'; document.body.appendChild(ov);
  const ck = () => { const m = document.cookie.match(/(?:^|; )md_ban=([^;]+)/); return m ? decodeURIComponent(m[1]) : ''; };
  const get = () => { let v = ''; try { v = localStorage.getItem(KEY) || ''; } catch (e) { } return v || ck(); };
  const put = v => { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) { } try { document.cookie = 'md_ban=' + (v ? encodeURIComponent(v) + ';max-age=63072000' : ';max-age=0') + ';path=/;SameSite=Lax'; } catch (e) { } };
  function show(on) {
    ov.style.display = on ? 'flex' : 'none'; SESS.blocked = !!on;
    if (on && typeof G !== 'undefined' && G.state !== 'menu') { try { toMenu(); } catch (e) { } }
    if (on) for (const k in KEYS) KEYS[k] = false;
  }
  async function banned(pid) { const r = await sb('GET', 'player_tweaks?pid=eq.' + encodeURIComponent(pid) + '&select=data'); return !!(r && r[0] && r[0].data && r[0].data.ban); }
  async function check() {
    const stored = get(), ids = [...new Set([stored, typeof ACCT !== 'undefined' && ACCT.pub].filter(Boolean))];
    if (!ids.length) return; if (typeof CLOUD === 'undefined' || !CLOUD) { if (stored) show(true); return; }
    let hit = '', fail = false;
    for (const id of ids) { try { if (await banned(id)) { hit = id; break; } } catch (e) { fail = true; } }
    if (hit) { put(hit); show(true); }
    else if (!fail) { if (stored) put(''); show(false); }
    else if (stored) show(true); // server unreachable: stay blocked
  }
  if (get()) show(true);           // blocked straight away on load, before any network check
  setTimeout(check, 1500); setInterval(check, 10000);
  window.banCheck = check;
})();
