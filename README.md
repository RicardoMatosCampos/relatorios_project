# Ferramenta de Relatórios - Pacote pronto para Deploy

Este pacote contém:
- Frontend estático em `public/` (HTML/CSS/JS)
- Backend Node.js em `server/` (Express + PostgreSQL + Nodemailer)
- Script SQL para criar tabela em `server/db_init.sql`
- Exemplo de variáveis de ambiente em `server/.env.example`

## Fluxo recomendado
1. Faça o deploy do frontend (pasta `public/`) no Netlify ou outro host estático.
2. Faça o deploy do backend (`server/`) em Railway (ou outro provider que ofereça Postgres).
   - Se usar Railway, adicione um Postgres plugin no projeto; Railway fornecerá `DATABASE_URL`.
   - Copie as variáveis SMTP para as "Environment Variables" (use App Password se usar Gmail).
3. Execute o script SQL (`server/db_init.sql`) no console do Postgres (Railway oferece forma de rodar SQL).
4. Atualize seu frontend para apontar `API_BASE` para a URL do backend (ex: https://seu-backend.up.railway.app/api).
5. Acesse o frontend e teste criação/consulta de relatórios.

## Notas
- Não comite credenciais no repositório.
- Use SSL (PGSSL=true) em produção quando necessário.
- Para Gmail, gere uma App Password (recomendado) em: https://myaccount.google.com/security -> Senhas de app.

## Estrutura do projeto
```
public/
  index.html
  report.html
  search.html
  css/
  js/
server/
  package.json
  server.js
  db_init.sql
  .env.example
README.md
```
