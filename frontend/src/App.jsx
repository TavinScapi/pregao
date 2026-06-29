import React from "react";
import { SearchForm } from "./components/SearchForm";
import { KeywordsBadge } from "./components/KeywordsBadge";
import { ResultsTable } from "./components/ResultsTable";
import { BudgetPanel } from "./components/BudgetPanel";
import { ErrorAlert } from "./components/ErrorAlert";
import { usePregao } from "./hooks/usePregao";

export default function App() {
  const {
    description,
    setDescription,
    results,
    keywords,
    cleanedQuery,
    selectedIndexes,
    selectedItems,
    averageFormatted,
    comprovantes,
    isSearching,
    isGenerating,
    searchError,
    pdfError,
    handleSearch,
    toggleSelection,
    handleGeneratePDFs,
    handleReset,
  } = usePregao();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-govblue-800 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                Pesquisa de Preços
              </h1>
              <p className="text-xs text-govblue-100 opacity-80">
                Automação de orçamentos para Pregão e Licitações
              </p>
            </div>
          </div>

          {(results.length > 0 || searchError) && (
            <button
              onClick={handleReset}
              className="text-xs text-govblue-100 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Nova pesquisa
            </button>
          )}
        </div>
      </header>

      {/* ── Conteúdo principal ──────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Formulário de busca */}
        <SearchForm
          description={description}
          onChange={setDescription}
          onSearch={handleSearch}
          isSearching={isSearching}
        />

        {/* Erro de busca */}
        <ErrorAlert message={searchError} />

        {/* Palavras-chave extraídas */}
        {keywords.length > 0 && (
          <KeywordsBadge keywords={keywords} cleanedQuery={cleanedQuery} />
        )}

        {/* Tabela de resultados */}
        <ResultsTable
          results={results}
          selectedIndexes={selectedIndexes}
          onToggle={toggleSelection}
        />

        {/* Painel de orçamento + PDF */}
        <BudgetPanel
          selectedItems={selectedItems}
          averageFormatted={averageFormatted}
          onGeneratePDFs={handleGeneratePDFs}
          isGenerating={isGenerating}
          comprovantes={comprovantes}
          pdfError={pdfError}
        />

        {/* Loading de busca */}
        {isSearching && (
          <div className="text-center py-12 text-slate-500">
            <div className="inline-flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-govblue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium">
                  Buscando preços no Google Shopping…
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Isso pode levar entre 15 e 30 segundos
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!isSearching && results.length === 0 && !searchError && (
          <div className="text-center py-12 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-3 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-sm">
              Cole a descrição do produto acima e clique em "Buscar Preços"
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-xs text-slate-400 text-center">
          Sistema de Pesquisa de Preços para Pregão Eletrônico · MVP v1.0
        </div>
      </footer>
    </div>
  );
}
