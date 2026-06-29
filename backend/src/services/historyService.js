/**
 * historyService.js
 * Persiste o histórico de pesquisas de preço em um arquivo JSON local
 * (data/history.json), para fins de auditoria do processo de pregão.
 *
 * Sem banco de dados externo — usa o filesystem diretamente, como pedido.
 *
 * Responsabilidade única: ler/escrever o arquivo de histórico. Não faz
 * chamada à SerpApi, não faz scraping, não gera PDF — isso é orquestrado
 * pela rota que chama este service.
 *
 * Formato de cada entrada salva:
 * {
 *   id: string,                    // gerado na hora (timestamp + random)
 *   dataHora: string,              // ISO 8601
 *   descricaoOriginal: string,
 *   queryLimpa: string,
 *   produtosEncontrados: Array,    // resultado bruto da SerpApi (já normalizado)
 *   produtosSelecionados: Array,   // itens marcados pelo usuário
 *   mediaCalculada: number|null,
 *   caminhoPdfComprovante: string|string[]|null,
 * }
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

/**
 * Garante que o diretório data/ e o arquivo history.json existam.
 * Se o arquivo não existir, cria com um array vazio.
 */
function ensureHistoryFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, '[]', 'utf-8');
    console.log(`[HISTORY] Arquivo criado: ${HISTORY_FILE}`);
  }
}

/**
 * Lê e faz parse do history.json atual.
 * Se o conteúdo estiver corrompido/inválido, faz backup do arquivo
 * corrompido e reinicia com array vazio (evita travar o sistema no meio
 * do pregão por causa de um JSON malformado).
 * @returns {Array<object>}
 */
function readHistory() {
  ensureHistoryFile();

  const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');

  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    const backupPath = `${HISTORY_FILE}.corrupted-${Date.now()}.bak`;
    fs.copyFileSync(HISTORY_FILE, backupPath);
    console.error(
      `[HISTORY] ⚠️ JSON corrompido em ${HISTORY_FILE}. Backup salvo em ${backupPath}. Reiniciando com array vazio.`
    );
    fs.writeFileSync(HISTORY_FILE, '[]', 'utf-8');
    return [];
  }
}

/**
 * Sobrescreve o history.json com o array completo fornecido.
 * @param {Array<object>} entries
 */
function writeHistory(entries) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

/**
 * Gera um ID simples e único o bastante para uso local (timestamp + random).
 * Evita depender de pacote externo (uuid) para manter a stack enxuta.
 * @returns {string}
 */
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Calcula a média aritmética dos preços de um array de produtos selecionados.
 * @param {Array<{ price: number }>} produtosSelecionados
 * @returns {number|null}
 */
function calcularMedia(produtosSelecionados) {
  if (!Array.isArray(produtosSelecionados) || produtosSelecionados.length === 0) {
    return null;
  }
  const soma = produtosSelecionados.reduce((acc, p) => acc + (p.price ?? 0), 0);
  return soma / produtosSelecionados.length;
}

/**
 * Salva uma nova entrada de pesquisa no histórico (append).
 *
 * @param {object} params
 * @param {string} params.descricaoOriginal - Texto bruto colado pelo usuário.
 * @param {string} params.queryLimpa - Query gerada pelo cleanQuery.
 * @param {Array} params.produtosEncontrados - Array completo retornado pela SerpApi.
 * @param {Array} [params.produtosSelecionados] - Itens marcados pelo usuário (até 3, normalmente).
 * @param {number} [params.mediaCalculada] - Média já calculada no frontend/rota.
 *   Se omitida, é calculada automaticamente a partir de produtosSelecionados.
 * @param {string|string[]|null} [params.caminhoPdfComprovante] - Caminho(s) do(s)
 *   PDF(s) gerado(s) como comprovante, se já existirem nesse momento.
 * @returns {object} A entrada salva, incluindo o `id` e `dataHora` gerados.
 */
function salvarPesquisa({
  descricaoOriginal,
  queryLimpa,
  produtosEncontrados,
  produtosSelecionados = [],
  mediaCalculada,
  caminhoPdfComprovante = null,
}) {
  if (!descricaoOriginal || typeof descricaoOriginal !== 'string') {
    throw new Error('descricaoOriginal é obrigatória e deve ser uma string.');
  }
  if (!queryLimpa || typeof queryLimpa !== 'string') {
    throw new Error('queryLimpa é obrigatória e deve ser uma string.');
  }
  if (!Array.isArray(produtosEncontrados)) {
    throw new Error('produtosEncontrados deve ser um array.');
  }

  const media = typeof mediaCalculada === 'number'
    ? mediaCalculada
    : calcularMedia(produtosSelecionados);

  const novaEntrada = {
    id: generateId(),
    dataHora: new Date().toISOString(),
    descricaoOriginal,
    queryLimpa,
    produtosEncontrados,
    produtosSelecionados,
    mediaCalculada: media,
    caminhoPdfComprovante,
  };

  const historico = readHistory();
  historico.push(novaEntrada);
  writeHistory(historico);

  console.log(`[HISTORY] ✅ Pesquisa salva (id: ${novaEntrada.id}) — ${historico.length} registro(s) no total.`);

  return novaEntrada;
}

/**
 * Atualiza uma entrada existente do histórico (ex: para adicionar o
 * caminhoPdfComprovante depois que o PDF é gerado em uma etapa posterior
 * à busca inicial).
 * @param {string} id
 * @param {object} updates - Campos a sobrescrever na entrada.
 * @returns {object|null} A entrada atualizada, ou null se o id não existir.
 */
function atualizarPesquisa(id, updates) {
  const historico = readHistory();
  const idx = historico.findIndex((entry) => entry.id === id);

  if (idx === -1) {
    console.warn(`[HISTORY] ⚠️ Tentativa de atualizar id inexistente: ${id}`);
    return null;
  }

  historico[idx] = { ...historico[idx], ...updates };
  writeHistory(historico);

  console.log(`[HISTORY] ✅ Pesquisa atualizada (id: ${id})`);
  return historico[idx];
}

/**
 * Retorna todo o histórico salvo até o momento.
 * @returns {Array<object>}
 */
function listarHistorico() {
  return readHistory();
}

/**
 * Busca uma entrada específica do histórico pelo id.
 * @param {string} id
 * @returns {object|null}
 */
function buscarPorId(id) {
  const historico = readHistory();
  return historico.find((entry) => entry.id === id) || null;
}

module.exports = {
  salvarPesquisa,
  atualizarPesquisa,
  listarHistorico,
  buscarPorId,
};