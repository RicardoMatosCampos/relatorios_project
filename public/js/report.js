const form = document.getElementById('report-form');
const msg = document.getElementById('form-msg');

const API_BASE = (typeof API_BASE !== 'undefined') ? API_BASE : '/api';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Enviando...';
  const data = {
    title: form.title.value.trim(),
    client: form.client.value.trim(),
    summary: form.summary.value.trim(),
    details: form.details.value.trim(),
    email: form.email.value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (res.ok) {
      msg.textContent = 'Relatório enviado e salvo com sucesso.';
      form.reset();
    } else {
      msg.textContent = json.error || 'Erro ao salvar.';
    }
  } catch(err) {
    console.error(err);
    msg.textContent = 'Erro de conexão.';
  }
});
