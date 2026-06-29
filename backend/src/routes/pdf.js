const express = require('express');
const router = express.Router();
const { generatePdf } = require('../services/pdfService'); 
const historyService = require('../services/historyService'); 

router.post('/generate', async (req, res, next) => {
  try {
    const { urls, historyId, produtosSelecionados, mediaCalculada } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Nenhuma URL fornecida para gerar comprovantes.' });
    }

    console.log(`[PDF] Gerando ${urls.length} comprovantes...`);

    // Gera os PDFs com o Puppeteer
    const pdfResults = await generatePdf(urls);

    // Salva a escolha do usuário no history.json
    if (historyId) {
      console.log(`[HISTÓRICO] Atualizando pesquisa ID: ${historyId}`);
      const caminhosPdfs = pdfResults.map(file => file.filename || file.path || file);
      
      historyService.atualizarPesquisa(historyId, {
        produtosSelecionados: produtosSelecionados || [],
        mediaCalculada: mediaCalculada || null,
        caminhoPdfComprovante: caminhosPdfs
      });
    }

    return res.json({
      message: 'Comprovantes gerados e histórico atualizado com sucesso!',
      files: pdfResults
    });

  } catch (err) {
    console.error('[PDF ERROR]', err);
    next(err);
  }
});

module.exports = router;