// ===== Device link: remembers which accounts are used from this browser so the admin can spot alts =====
// The id lives in BOTH a cookie and localStorage; if one is cleared, the other restores it, so the link survives.
(function () {
  const K = 'md_dev_id', DAY = 86400;
  const ck = () => { const m = document.cookie.match(/(?:^|; )md_dev=([^;]+)/); return m ? decodeURIComponent(m[1]) : ''; };
  function devId() {
    let a = ''; try { a = localStorage.getItem(K) || ''; } catch (e) { }
    let d = a || ck() || 'd' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
    try { if (a !== d) localStorage.setItem(K, d); } catch (e) { }
    try { if (ck() !== d) document.cookie = 'md_dev=' + encodeURIComponent(d) + ';max-age=' + 730 * DAY + ';path=/;SameSite=Lax'; } catch (e) { }
    return d;
  }
  let last = '', lastT = 0;
  async function report() {
    if (typeof CLOUD === 'undefined' || !CLOUD || typeof ACCT === 'undefined' || !ACCT.pub) return;
    const dev = devId(), key = dev + '|' + ACCT.pub, now = Date.now();
    if (key === last && now - lastT < 30 * 60000) return;
    try { await sb('POST', 'rpc/report_device', { p_dev: dev, p_pid: ACCT.pub }); last = key; lastT = now; } catch (e) { }
  }
  devId(); setTimeout(report, 2500); setInterval(report, 8000);
})();
