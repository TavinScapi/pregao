require('dotenv').config();

const express = require('express');
const cors = require('cors');
const searchRoutes = require('./routes/search');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Serve PDFs gerados para download
app.use('/downloads', express.static('tmp'));

// ── Rotas ────────────────────────────────────────────────────────────────────
app.use('/api/search', searchRoutes);
app.use('/api/pdf', pdfRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Error handler global ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`✅  Backend rodando em http://localhost:${PORT}`);
});

module.exports = app;
