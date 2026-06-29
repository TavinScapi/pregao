import React from 'react';

/**
 * Painel de orçamento: exibe itens selecionados, média calculada
 * e botão para gerar os PDFs comprobatórios.
 */
export function BudgetPanel({
  selectedItems,
  averageFormatted,
  onGeneratePDFs,
  isGenerating,
  comprovantes,
  pdfError,
}) {
  const hasSelection = selectedItems.length > 0;
  const hasComprovantes = comprovantes.length > 0;

  if (!hasSelection && !hasComprovantes) return null;

  return (
    <div className="card border-govblue-200 bg-govblue-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-govblue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
          3
        </div>
        <div>
          <h2 className="text-base font-semibold text-govblue-900">Orçamento do Pregão</h2>
          <p className="text-xs text-slate-500">
            {selectedItems.length} item(s) selecionado(s)
          </p>
        </div>
      </div>

      {/* Itens selecionados */}
      {hasSelection && (
        <div className="mb-4 space-y-2">
          {selectedItems.map((item, idx) => (
            <div key={item.url} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-govblue-100">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 h-5 rounded-full bg-govblue-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-700 truncate">{item.title}</span>
              </div>
              <span className="text-sm font-semibold text-govblue-700 ml-3 whitespace-nowrap tabular-nums">
                {item.priceFormatted}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Média calculada */}
      {hasSelection && averageFormatted && (
        <div className="flex items-center justify-between bg-govblue-700 text-white rounded-lg px-4 py-3 mb-4">
          <div>
            <p className="text-xs opacity-80">Média Aritmética dos {selectedItems.length} item(s)</p>
            <p className="text-xs opacity-60 mt-0.5">
              Soma: {selectedItems.map(i => i.priceFormatted).join(' + ')} ÷ {selectedItems.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-800">Valor Médio de Referência</p>
            <p className="text-2xl font-bold tabular-nums text-gray-800">{averageFormatted}</p>
          </div>
        </div>
      )}

      {/* Erro PDF */}
      {pdfError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <strong>Erro:</strong> {pdfError}
        </div>
      )}

      {/* Botão gerar comprovantes */}
      {hasSelection && !hasComprovantes && (
        <button
          className="btn-primary w-full flex items-center justify-center gap-2"
          onClick={onGeneratePDFs}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Gerando comprovantes… (pode levar alguns minutos)
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Gerar Comprovantes PDF ({selectedItems.length} arquivo{selectedItems.length > 1 ? 's' : ''})
            </>
          )}
        </button>
      )}

      {/* Comprovantes gerados — links de download */}
      {hasComprovantes && (
        <div>
          <p className="text-sm font-semibold text-govblue-800 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Comprovantes gerados com sucesso!
          </p>
          <div className="space-y-2">
            {comprovantes.map((c, idx) => (
              <a
                key={c.fileName}
                href={`http://localhost:3001${c.downloadPath}`}
                download={c.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white hover:bg-slate-50
                           border border-slate-200 rounded-lg px-4 py-2.5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">
                    Comprovante Item {idx + 1}
                  </span>
                  <span className="text-xs text-slate-400">{c.fileName}</span>
                </div>
                <span className="text-govblue-600 group-hover:text-govblue-800 text-xs font-medium flex items-center gap-1">
                  Baixar
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
