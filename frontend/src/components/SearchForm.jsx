import React from 'react';

const PLACEHOLDER = `Cole aqui a descrição completa do item da planilha de licitação.

Exemplo:
CANETA ESFEROGRÁFICA, MATERIAL PLÁSTICO, COR AZUL, CORPO SEXTAVADO, PONTA MÉDIA 1,0MM, CARGA DESCARTÁVEL, CONFORME NBR 15236, EMBALAGEM C/ 10 UNIDADES`;

/**
 * Painel de entrada da descrição do produto.
 */
export function SearchForm({ description, onChange, onSearch, isSearching }) {
  const canSearch = description.trim().length >= 5 && !isSearching;

  const handleKeyDown = (e) => {
    // Ctrl+Enter dispara busca
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSearch();
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-govblue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
          1
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800">Descrição do Produto</h2>
          <p className="text-xs text-slate-500">Cole a descrição longa diretamente da planilha de licitação</p>
        </div>
      </div>

      <textarea
        value={description}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER}
        rows={6}
        className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3
                   text-sm text-slate-700 placeholder-slate-400 font-mono
                   focus:outline-none focus:ring-2 focus:ring-govblue-600 focus:border-transparent
                   transition-colors duration-150"
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">
          {description.length} caracteres · <kbd className="bg-slate-100 border border-slate-200 rounded px-1">Ctrl+Enter</kbd> para buscar
        </span>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={onSearch}
          disabled={!canSearch}
        >
          {isSearching ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Buscando preços…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar Preços
            </>
          )}
        </button>
      </div>
    </div>
  );
}
