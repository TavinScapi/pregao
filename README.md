# 🏛️ Sistema de Pesquisa de Preços — Pregão / Licitações

MVP para automatizar pesquisa de mercado em processos de pregão eletrônico.

---

## 📁 Estrutura do Projeto

```
pregao-app/
├── backend/
│   ├── src/
│   │   ├── server.js              ← Entry point Express
│   │   ├── routes/
│   │   │   ├── search.js          ← POST /api/search
│   │   │   └── pdf.js             ← POST /api/pdf/generate
│   │   ├── services/
│   │   │   ├── scraperService.js  ← Puppeteer + Google Shopping
│   │   │   └── pdfService.js      ← Geração de PDFs comprobatórios
│   │   └── utils/
│   │       ├── cleanQuery.js      ← Limpa descrições burocráticas
│   │       └── browserFactory.js ← Puppeteer stealth config
│   ├── tmp/                       ← PDFs gerados (auto-limpeza 1h)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx                ← Componente raiz
    │   ├── components/
    │   │   ├── SearchForm.jsx     ← Textarea + botão de busca
    │   │   ├── KeywordsBadge.jsx  ← Keywords extraídas
    │   │   ├── ResultsTable.jsx   ← Tabela com checkboxes
    │   │   ├── BudgetPanel.jsx    ← Média + botão PDF
    │   │   └── ErrorAlert.jsx     ← Alertas de erro
    │   ├── hooks/
    │   │   └── usePregao.js       ← Toda a lógica de estado
    │   └── services/
    │       └── api.js             ← Axios calls ao backend
    └── package.json
```

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+ (LTS recomendado)
- npm 9+

### 1. Backend

```bash
cd pregao-app/backend
npm install
npm run dev
# Rodando em http://localhost:3001
```

> **Nota:** O `npm install` do Puppeteer baixa o Chromium automaticamente (~170MB).  
> Isso ocorre apenas na primeira instalação.

### 2. Frontend

```bash
cd pregao-app/frontend
npm install
npm start
# Rodando em http://localhost:3000
```

---

## 🔌 API Endpoints

### `POST /api/search`
Busca preços no Google Shopping.

**Body:**
```json
{ "description": "CANETA ESFEROGRÁFICA, COR AZUL, PONTA MÉDIA 1,0MM..." }
```

**Response:**
```json
{
  "keywords": ["caneta", "esferografica", "azul", "ponta", "media"],
  "cleaned": "caneta esferografica azul ponta media",
  "total": 12,
  "results": [
    { "title": "Caneta BIC Azul", "price": 4.90, "priceFormatted": "R$ 4,90", "url": "https://..." }
  ]
}
```

### `POST /api/pdf/generate`
Gera PDFs comprobatórios das URLs selecionadas.

**Body:**
```json
{ "urls": ["https://loja1.com/produto", "https://loja2.com/produto", "https://loja3.com/produto"] }
```

**Response:**
```json
{
  "message": "3 comprovante(s) gerado(s) com sucesso.",
  "comprovantes": [
    { "fileName": "comprovante_item1_ABC123.pdf", "downloadPath": "/downloads/..." }
  ]
}
```

---

## ⚠️ Dicas Anti-Bloqueio (CAPTCHA)

O backend já usa as seguintes estratégias:

| Técnica | O que faz |
|---|---|
| `puppeteer-extra-plugin-stealth` | Remove fingerprints de automação |
| User-Agent rotacionado | Simula navegadores reais |
| `--disable-blink-features=AutomationControlled` | Remove flag `navigator.webdriver` |
| Delays aleatórios (800ms–2500ms) | Simula tempo humano de leitura |
| `networkidle2` para espera | Garante carregamento completo |

**Se mesmo assim o CAPTCHA aparecer:**
1. Troque para uma rede diferente (hotspot, VPN)
2. Aumente o `randomDelay` em `browserFactory.js`
3. Considere usar a [API do SerpApi](https://serpapi.com) como alternativa comercial ao scraping direto — ela tem endpoint nativo para Google Shopping e é tolerante a uso repetido

---

## 🛠️ Próximas Melhorias (Roadmap)

- [ ] Suporte a upload de planilha Excel com múltiplos itens em lote
- [ ] Histórico local de pesquisas (IndexedDB)
- [ ] Exportação do orçamento final em PDF consolidado
- [ ] Integração com SerpApi para maior confiabilidade
- [ ] Autenticação básica para uso em rede interna
