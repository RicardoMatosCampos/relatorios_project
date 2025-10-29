async function loadRecent(){
  const el = document.getElementById('recent-list');
  el.innerHTML = 'Carregando...';
  try {
    const res = await fetch('/api/reports?limit=6');
    const list = await res.json();
    if (!Array.isArray(list) || list.length===0) { el.innerHTML = '<p>Nenhum relatório ainda.</p>'; return; }
    el.innerHTML = list.map(r => `
      <div class="card">
        <h3>${escapeHtml(r.title)}</h3>
        <div class="meta">${new Date(r.created_at).toLocaleString()} — ${escapeHtml(r.client)}</div>
        <p>${escapeHtml(r.summary)}</p>
      </div>
    `).join('');
  } catch(e){
    el.innerHTML = 'Erro ao carregar.';
  }
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
loadRecent();
