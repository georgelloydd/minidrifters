// ===== In-game dialogs: replace the browser's alert / confirm / prompt boxes =====
// uiAlert(text, title)            -> Promise<void>
// uiConfirm(text, { title, yes, no, danger, html, cls, onOpen }) -> Promise<boolean>
// uiCopy(text, title)             -> shows the text ready to copy
const DLG = { q: [], open: null };
const dlgEsc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function uiDialog(o) { return new Promise(res => { DLG.q.push([o, res]); if (!DLG.open) dlgNext(); }); }
function dlgNext() {
  const it = DLG.q.shift(); if (!it) { DLG.open = null; return; }
  const [o, res] = it, ov = document.createElement('div'); ov.className = 'dlgOv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
  const box = document.createElement('div'); box.className = 'dlg ' + (o.cls || ''); ov.appendChild(box);
  box.innerHTML = (o.title ? `<h3>${dlgEsc(o.title)}</h3>` : '') + '<div class="dlgBody"></div><div class="dlgBtns"></div>';
  const body = box.querySelector('.dlgBody'); if (o.html) body.innerHTML = o.html; else body.textContent = o.text || '';
  const btns = o.buttons || [{ t: 'OK', v: undefined, cls: 'primary' }];
  const primary = btns.find(b => /primary|danger|gold/.test(b.cls || '')) || btns[btns.length - 1];
  const cancelV = 'cancel' in o ? o.cancel : btns.some(b => b.v === false) ? false : primary.v;
  let done = false; const t0 = Date.now();
  const close = v => { if (done) return; done = true; window.removeEventListener('keydown', key, true); ov.classList.add('out'); setTimeout(() => ov.remove(), 150); res(v); setTimeout(dlgNext, 160); };
  const key = e => {
    e.stopImmediatePropagation(); // the game never sees keys while a dialog is open
    const typing = e.target && e.target.tagName === 'INPUT' && box.contains(e.target);
    if (Date.now() - t0 < 150) { e.preventDefault(); return; } // ignore the key that opened it
    if (e.key === 'Escape') { e.preventDefault(); close(cancelV); }
    else if (e.key === 'Enter') { e.preventDefault(); close(primary.v); }
    else if (e.key !== 'Tab' && !typing && !(e.ctrlKey || e.metaKey)) e.preventDefault();
  };
  btns.forEach(b => { const e = document.createElement('button'); e.type = 'button'; e.className = 'dlgBtn ' + (b.cls || ''); e.textContent = b.t; e.onclick = ev => { ev.stopPropagation(); close(b.v); }; box.querySelector('.dlgBtns').appendChild(e); if (b === primary) setTimeout(() => e.focus(), 0); });
  ov.addEventListener('click', e => { e.stopPropagation(); if (e.target === ov) close(cancelV); });
  window.addEventListener('keydown', key, true);
  DLG.open = ov; document.body.appendChild(ov);
  if (o.onOpen) try { o.onOpen(box, close); } catch (e) { console.error(e); }
}
function uiAlert(text, title) { return uiDialog({ title: title || 'Heads up', text: String(text) }); }
function uiConfirm(text, o) {
  o = o || {};
  return uiDialog({ title: o.title || 'Are you sure?', text, html: o.html, cls: o.cls, onOpen: o.onOpen, cancel: false,
    buttons: [{ t: o.no || 'Cancel', v: false }, { t: o.yes || 'OK', v: true, cls: o.danger ? 'danger' : o.gold ? 'gold' : 'primary' }] });
}
function uiCopy(text, title) {
  return uiDialog({ title: title || 'Copy this', html: '<p class="dlgHint">Your browser blocked automatic copying. Select it below and press Ctrl+C (or long-press on mobile).</p><input class="dlgCopy" readonly>',
    buttons: [{ t: 'Close', v: false }, { t: 'Copy', v: true, cls: 'primary' }],
    onOpen: box => { const i = box.querySelector('.dlgCopy'); i.value = text; setTimeout(() => { i.focus(); i.select(); }, 30);
      const b = box.querySelector('.dlgBtn.primary'); b.onclick = ev => { ev.stopPropagation(); i.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { } b.textContent = ok ? 'Copied ✓' : 'Press Ctrl+C'; }; } });
}
// anything that still calls alert() gets the in-game version instead of the browser box
window.alert = t => { uiAlert(t); };
