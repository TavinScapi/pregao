/**
 * search.js (route)
 * POST /api/search
 *
 * Body: { description: string }
 * Response: { historyId: string, keywords: string[], cleaned: string, total: number, results: SearchResult[] }
 *
 * ⚠️ cleanQuery retorna um OBJETO { cleaned, keywords } (não mais apenas a
 * string). Se isso for alterado novamente no futuro, ajuste a desestruturação
 * abaixo — esse foi exatamente o bug que já corrigimos uma vez aqui.
 */

const express = require('express');
const router = express.Router();
const { cleanQuery } = require('../utils/cleanQuery');
const { searchGoogleShopping } = require('../services/scraperService');
const { salvarPesquisa } = require('../services/historyService');

router.post('/', async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return res.status(400).json({
        error: 'Forneça uma descrição válida com pelo menos 5 caracteres.',
      });
    }

    // 1. Limpa a descrição burocrática
    const { cleaned, keywords } = cleanQuery(description.trim());

    if (!cleaned || typeof cleaned !== 'string') {
      return res.status(422).json({
        error: 'Não foi possível extrair palavras-chave da descrição fornecida.',
      });
    }

    console.log(`[SEARCH] Descrição original: "${description.substring(0, 80)}..."`);
    console.log(`[SEARCH] Query limpa: "${cleaned}"`);

    // 2. Faz a busca via SerpApi (Google Shopping)
    const results = await searchGoogleShopping(cleaned);

    if (results.length === 0) {
      return res.status(404).json({
        error: 'Nenhum resultado encontrado. Tente reformular a descrição.',
        keywords,
        cleaned,
      });
    }

    // 3. Salva o registro de auditoria no histórico ANTES de responder ao
    // frontend. Nesta etapa ainda não há seleção do usuário nem PDF — isso
    // é preenchido depois via PUT /api/history/:id (rota de comprovação),
    // que chama historyService.atualizarPesquisa com o historyId abaixo.
    const historico = salvarPesquisa({
      descricaoOriginal: description.trim(),
      queryLimpa: cleaned,
      produtosEncontrados: results,
      produtosSelecionados: [],       // preenchido depois, na etapa de seleção/PDF
      caminhoPdfComprovante: null,    // idem
    });

    // 4. Devolve o historyId junto da resposta normal, para o frontend
    // conseguir referenciar este registro quando fizer o update posterior.
    return res.json({
      historyId: historico.id,
      keywords,
      cleaned,
      total: results.length,
      results, // Já vem ordenado do maior para o menor preço
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;