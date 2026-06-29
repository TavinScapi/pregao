import { useState, useCallback, useMemo } from 'react';
import { searchProducts, generatePDFs } from '../services/api';

/**
 * Hook central da aplicação de pregão.
 * Encapsula toda lógica de estado: busca, seleção, média e geração de PDFs.
 */
export function usePregao() {
  // ── Estado da busca ────────────────────────────────────────────────────────
  const [description, setDescription] = useState('');
  const [results, setResults]         = useState([]);
  const [keywords, setKeywords]       = useState([]);
  const [cleanedQuery, setCleanedQuery] = useState('');

  // ── Estado de loading / erro ───────────────────────────────────────────────
  const [isSearching, setIsSearching]     = useState(false);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [searchError, setSearchError]     = useState(null);
  const [pdfError, setPdfError]           = useState(null);

  // ── Estado de seleção ──────────────────────────────────────────────────────
  // Set de índices dos itens selecionados (índice no array results)
  const [selectedIndexes, setSelectedIndexes] = useState(new Set());

  // ── Comprovantes gerados ───────────────────────────────────────────────────
  const [comprovantes, setComprovantes] = useState([]);
  const [historyId, setHistoryId] = useState(null);

  // ── Itens selecionados (derivado) ──────────────────────────────────────────
  const selectedItems = useMemo(
    () => results.filter((_, idx) => selectedIndexes.has(idx)),
    [results, selectedIndexes]
  );

  // ── Média dos selecionados (derivado) ─────────────────────────────────────
  const average = useMemo(() => {
    if (selectedItems.length === 0) return null;
    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    return total / selectedItems.length;
  }, [selectedItems]);

  const averageFormatted = useMemo(
    () =>
      average !== null
        ? average.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : null,
    [average]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Dispara a busca no backend. */
  const handleSearch = useCallback(async () => {
    if (!description.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setResults([]);
    setSelectedIndexes(new Set());
    setComprovantes([]);
    setPdfError(null);

    try {
      const data = await searchProducts(description);
      setResults(data.results);
      setKeywords(data.keywords);
      setCleanedQuery(data.cleaned);
      setHistoryId(data.historyId);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Erro ao buscar produtos.';
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  }, [description]);

  /** Alterna seleção de um item. */
  const toggleSelection = useCallback((idx) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  /** Gera os PDFs comprobatórios dos itens selecionados. */
  const handleGeneratePDFs = useCallback(async () => {
    if (selectedItems.length === 0) return;

    setIsGenerating(true);
    setPdfError(null);
    setComprovantes([]);

    try {
      // 1. Extrai apenas os links para o Puppeteer trabalhar
      const urls = selectedItems.map((item) => item.url);

      // 2. Monta o pacote de dados completo para o backend e o histórico
      const payload = {
        urls: urls,
        historyId: historyId, // Certifique-se de que seu state se chama historyId
        produtosSelecionados: selectedItems,
        mediaCalculada: average // Certifique-se de que seu state da média se chama average
      };

      // 3. Dispara a chamada para a API
      const data = await generatePDFs(payload);
      
      // 4. Salva no estado da tela (adaptado para o novo formato do backend)
      setComprovantes(data.files || data.comprovantes);
      
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Erro ao gerar comprovantes.';
      setPdfError(msg);
    } finally {
      setIsGenerating(false);
    }
  // 👇 IMPORTANTE: Não esqueça de adicionar historyId e average nas dependências do hook! 👇
  }, [selectedItems, historyId, average]);

  /** Reseta tudo para novo pregão. */
  const handleReset = useCallback(() => {
    setDescription('');
    setResults([]);
    setKeywords([]);
    setCleanedQuery('');
    setSelectedIndexes(new Set());
    setComprovantes([]);
    setSearchError(null);
    setPdfError(null);
  }, []);

  return {
    // Estado
    description, setDescription,
    results,
    keywords,
    cleanedQuery,
    selectedIndexes,
    selectedItems,
    average,
    averageFormatted,
    comprovantes,

    // Loading / erro
    isSearching,
    isGenerating,
    searchError,
    pdfError,

    // Handlers
    handleSearch,
    toggleSelection,
    handleGeneratePDFs,
    handleReset,
  };
}
