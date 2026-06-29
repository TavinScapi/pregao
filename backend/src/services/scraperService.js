const axios = require('axios');

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

const apiKeys = (process.env.SERPAPI_KEYS || process.env.SERPAPI_KEY || '')
  .split(',')
  .map(key => key.trim())
  .filter(Boolean);

let currentKeyIndex = 0;
const FREE_PLAN_LIMIT = 100;
const keyUsageCount = new Map(); 

function trackKeySuccess(key) {
  const total = (keyUsageCount.get(key) || 0) + 1;
  keyUsageCount.set(key, total);

  const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
  const remaining = FREE_PLAN_LIMIT - total;

  if (remaining <= 0) {
    console.warn(`🔴 [CONTADOR] Chave ${masked}: ${total} requisições — provavelmente já estourou o limite!`);
  } else if (remaining <= 10) {
    console.warn(`🟡 [CONTADOR] Chave ${masked}: ${total} requisições feitas — restam ~${remaining} no plano gratuito.`);
  } else {
    console.log(`📊 [CONTADOR] Chave ${masked}: ${total} requisições bem-sucedidas (~${remaining} restantes).`);
  }
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parsePriceString(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return null;
  const cleaned = priceStr
    .replace(/R\$\s*/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

function normalizeItem(item) {
  const title = item.title?.trim();
  const price = typeof item.extracted_price === 'number'
    ? item.extracted_price
    : parsePriceString(item.price);
  const url = item.product_link || item.link || null;

  if (!title || price === null || !url) return null;

  return {
    title,
    price,
    priceFormatted: formatBRL(price),
    url,
  };
}

async function searchGoogleShopping(query) {
  if (apiKeys.length === 0) {
    throw new Error('Nenhuma chave configurada. Defina a variável SERPAPI_KEYS no arquivo .env.');
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Query de busca vazia ou inválida.');
  }

  let attempt = 0;

  while (attempt < apiKeys.length) {
    const activeKey = apiKeys[currentKeyIndex];

    try {
      console.log(`[SCRAPER] Consultando SerpApi para: "${query}" (Chave ${currentKeyIndex + 1} de ${apiKeys.length})`);
      
      const response = await axios.get(SERPAPI_BASE_URL, {
        params: {
          engine: 'google_shopping',
          q: query,
          hl: 'pt-BR',
          gl: 'br',
          api_key: activeKey,
        },
        timeout: 20_000,
      });

      const data = response.data;

      if (data.error) {
        if (data.error.toLowerCase().includes('limit') || data.error.toLowerCase().includes('auth')) {
          throw { response: { status: 429, data: data } }; 
        }
        throw new Error(`SerpApi retornou erro: ${data.error}`);
      }

      trackKeySuccess(activeKey);

      const rawResults = data.shopping_results || [];

      if (rawResults.length === 0) {
        console.warn(`[SCRAPER] Nenhum resultado em shopping_results para "${query}"`);
        return [];
      }

      const processed = rawResults
        .map(normalizeItem)
        .filter(Boolean)
        .sort((a, b) => b.price - a.price)
        .filter((item, idx, arr) => arr.findIndex((i) => i.url === item.url) === idx);

      console.log(`[SCRAPER] ${processed.length} resultado(s) válido(s) para "${query}"`);
      return processed;

    } catch (err) {
      const status = err.response?.status;
      
      if (status === 429 || status === 401) {
        console.warn(`⚠️ [ALERTA] Chave ${currentKeyIndex + 1} falhou. Trocando para a próxima...`);
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        attempt++;
        continue;
      }

      if (err.response) {
        const apiMessage = err.response.data?.error || err.response.statusText;
        throw new Error(`Erro da SerpApi (${status}): ${apiMessage}`);
      }
      throw new Error(`Falha ao conectar com a SerpApi: ${err.message}`);
    }
  }

  throw new Error('Todas as chaves da SerpApi cadastradas esgotaram o limite! Crie novas contas.');
}

module.exports = { searchGoogleShopping };