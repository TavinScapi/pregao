/**
 * browserFactory.js
 * Cria instâncias do Puppeteer com configurações anti-detecção (stealth).
 *
 * Estratégias usadas para evitar bloqueios:
 *  1. puppeteer-extra-plugin-stealth → patcha fingerprint do browser
 *  2. User-Agent realista e rotacionado
 *  3. Viewport humano (não 800x600)
 *  4. Desativa automação flags (--disable-blink-features)
 *  5. Delays aleatórios entre ações
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Pool de User-Agents reais (Chrome/Windows e Mac)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Delay aleatório entre min e max ms — simula comportamento humano.
 * @param {number} min
 * @param {number} max
 */
function randomDelay(min = 800, max = 2500) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Lança o browser com configurações stealth.
 * @param {object} opts - Opções extras do puppeteer.launch
 * @returns {Promise<Browser>}
 */
async function launchBrowser(opts = {}) {
  const browser = await puppeteer.launch({
    headless: 'false',                // Headless moderno (Chrome >= 112)
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',   // Remove flag webdriver
      '--disable-infobars',
      '--window-size=1366,768',
    ],
    defaultViewport: { width: 1366, height: 768 },
    ...opts,
  });
  return browser;
}

/**
 * Cria uma nova aba com user-agent rotacionado.
 * @param {Browser} browser
 * @returns {Promise<Page>}
 */
async function newStealthPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(randomUA());
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });
  // Remove o navigator.webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  return page;
}

module.exports = { launchBrowser, newStealthPage, randomDelay };
