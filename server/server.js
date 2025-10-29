require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Banco de dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
});

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || 587, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helper para segurança básica
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  }[c]));
}
function nl2br(str) {
  return (str || '').replace(/\n/g, '<br/>');
}

// Endpoint: criar relatório
app.post('/api/reports', async (req, res) => {
  const { title, client, summary, details, email } = req.body || {};
  if (!title || !summary || !details || !email)
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });

  try {
    const insert = await pool.query(
      `INSERT INTO reports (title, client, summary, details, email)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
      [title, client, summary, details, email]
    );
    const report = insert.rows[0];

    // Monta email
    const html = `
      <h2>Relatório: ${escapeHtml(title)}</h2>
      <p><strong>Cliente:</strong> ${escapeHtml(client)}</p>
      <p><strong>Resumo:</strong><br/>${nl2br(escapeHtml(summary))}</p>
      <p><strong>Detalhes:</strong><br/><pre>${escapeHtml(details)}</pre></p>
      <p><small>ID: ${report.id} — ${report.created_at}</small></p>
    `;

    // Envia email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: `Relatório: ${title}`,
        html
      });
    } catch (emailErr) {
      console.warn('Falha ao enviar email:', emailErr.message);
    }

    res.json({ id: report.id, message: 'Relatório salvo e email enviado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar no banco.' });
  }
});

// Endpoint: listar/buscar relatórios
app.get('/api/reports', async (req, res) => {
  const q = req.query.q;
  const limit = parseInt(req.query.limit) || 20;
  try {
    let result;
    if (q) {
      const like = `%${q}%`;
      result = await pool.query(`
        SELECT id, title, client, summary, details, created_at
        FROM reports
        WHERE title ILIKE $1 OR client ILIKE $1 OR summary ILIKE $1 OR details ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [like, limit]);
    } else {
      result = await pool.query(`
        SELECT id, title, client, summary, created_at
        FROM reports
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]);
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// Endpoint: obter relatório específico
app.get('/api/reports/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM reports WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar relatório.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));
