/**
 * pdfService.js
 * Gera PDFs comprobatórios de cada URL selecionada pelo usuário.
 *
 * Processo legal (pregão):
 *  - Acessa cada URL
 *  - Injeta cabeçalho com data/hora da captura e URL original
 *  - Gera PDF em A4 com fundo completo
 *  - Salva em /tmp com nome único baseado no timestamp
 *  - Retorna os caminhos para servir via download
 */

const fs = require('fs');
const path = require('path');
const { launchBrowser, newStealthPage, randomDelay } = require('../utils/browserFactory');

// Diretório temporário para PDFs
const TMP_DIR = path.join(__dirname, '../../tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

/**
 * Gera um PDF comprobatório de uma URL.
 * @param {string} url - URL da página do produto.
 * @param {number} index - Índice do item (1, 2, 3) para nome do arquivo.
 * @param {string} sessionId - ID da sessão para agrupar PDFs.
 * @returns {Promise<{ filePath: string, fileName: string }>}
 */
async function generatePdfFromUrl(url, index, sessionId) {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await newStealthPage(browser);

    console.log(`[PDF] Gerando comprovante ${index} de: ${url}`);

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 45_000,
    });

    await randomDelay(1500, 3000);

    // Injeta cabeçalho de comprovação legal na página
    const captureDateTime = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    await page.evaluate(({ url, dateTime }) => {
      const banner = document.createElement('div');
      banner.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; z-index: 999999;
        background: #1e3a5f; color: white; font-family: Arial, sans-serif;
        font-size: 11px; padding: 6px 12px; display: flex;
        justify-content: space-between; align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      banner.innerHTML = `
        <span>📋 <strong>COMPROVANTE DE PESQUISA DE PREÇO</strong> | Pregão / Licitação</span>
        <span>🔗 ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}</span>
        <span>🕒 Capturado em: ${dateTime}</span>
      `;
      document.body.insertBefore(banner, document.body.firstChild);
      document.body.style.marginTop = '40px';
    }, { url, dateTime: captureDateTime });

    const fileName = `comprovante_item${index}_${sessionId}.pdf`;
    const filePath = path.join(TMP_DIR, fileName);

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,   // Captura cores e imagens de fundo
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size:8px; color:#666; width:100%; text-align:center; padding:0 20px;">
          Documento gerado automaticamente para fins de comprovação de pesquisa de preço de mercado.
          Item ${index} | ${captureDateTime} | <span class="url"></span>
        </div>`,
      margin: { top: '60px', bottom: '40px', left: '10mm', right: '10mm' },
    });

    console.log(`[PDF] ✅ Salvo em: ${filePath}`);
    return { filePath, fileName };

  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Gera PDFs para todas as URLs selecionadas e retorna os caminhos.
 * @param {string[]} urls - Array com até 3 URLs.
 * @returns {Promise<Array<{ fileName: string, downloadPath: string }>>}
 */
async function generateComprovantes(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error('Nenhuma URL fornecida.');
  }
  if (urls.length > 5) {
    throw new Error('Máximo de 5 URLs por vez.');
  }

  // ID de sessão único para agrupar os PDFs deste orçamento
  const sessionId = Date.now().toString(36).toUpperCase();

  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const { fileName } = await generatePdfFromUrl(urls[i], i + 1, sessionId);
    results.push({
      fileName,
      downloadPath: `/downloads/${fileName}`,
      sessionId,
    });
  }

  return results;
}

/**
 * Remove PDFs antigos (> 1 hora) do diretório tmp.
 */
function cleanupOldFiles() {
  const oneHour = 60 * 60 * 1000;
  fs.readdirSync(TMP_DIR).forEach((file) => {
    const filePath = path.join(TMP_DIR, file);
    const stat = fs.statSync(filePath);
    if (Date.now() - stat.mtimeMs > oneHour) {
      fs.unlinkSync(filePath);
      console.log(`[CLEANUP] Removido: ${file}`);
    }
  });
}

// Cleanup automático a cada 30 minutos
setInterval(cleanupOldFiles, 30 * 60 * 1000);

module.exports = { generateComprovantes };
