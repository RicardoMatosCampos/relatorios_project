const q = document.getElementById('q');
const results = document.getElementById('results');
const API_BASE = (typeof API_BASE !== 'undefined') ? API_BASE : '/api';

async function doSearch(term){
  results.innerHTML = 'Buscando...';
  const res = await fetch(`${API_BASE}/reports?q=${encodeURIComponent(term)}`);
  if (!res.ok){ results.innerHTML = 'Erro na busca'; return; }
  const arr = await res.json();
  if (arr.length === 0){ results.innerHTML = '<p>Nenhum resultado</p>'; return; }
  results.innerHTML = arr.map(r => `
    <article class="card">
      <h3>${escapeHtml(r.title)}</h3>
      <div class="meta">${new Date(r.created_at).toLocaleString()} — ${escapeHtml(r.client)}</div>
      <p>${escapeHtml(r.summary)}</p>
      <details><summary>Ver detalhes</summary><pre>${escapeHtml(r.details)}</pre></details>
    </article>
  `).join('');
}

q.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    doSearch(q.value.trim());
  }
});

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
