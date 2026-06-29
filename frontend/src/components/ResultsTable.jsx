import React from 'react';

/**
 * Tabela de resultados do Google Shopping.
 * Já vem ordenada do maior para o menor preço (vinda do backend).
 * Cada linha tem um checkbox para seleção manual.
 */
export function ResultsTable({ results, selectedIndexes, onToggle }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-govblue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
          2
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Resultados Encontrados
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({results.length} itens — ordem: maior preço primeiro)
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Selecione os itens que melhor correspondem ao produto licitado
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-10 px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                ✓
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Produto
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Preço
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((item, idx) => {
              const isSelected = selectedIndexes.has(idx);
              return (
                <tr
                  key={`${item.url}-${idx}`}
                  onClick={() => onToggle(idx)}
                  className={`
                    cursor-pointer transition-colors duration-100
                    ${isSelected
                      ? 'bg-govblue-50 hover:bg-govblue-100'
                      : 'hover:bg-slate-50'
                    }
                  `}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(idx)}
                      className="w-4 h-4 rounded border-slate-300 text-govblue-700
                                 focus:ring-govblue-600 cursor-pointer"
                    />
                  </td>

                  {/* Posição (rank de preço) */}
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs text-center">
                    {idx + 1}
                  </td>

                  {/* Título */}
                  <td className="px-4 py-3">
                    <span className={`text-sm ${isSelected ? 'font-medium text-govblue-800' : 'text-slate-700'}`}>
                      {item.title}
                    </span>
                  </td>

                  {/* Preço */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className={`font-semibold tabular-nums ${
                      isSelected ? 'text-govblue-700' : 'text-slate-800'
                    }`}>
                      {item.priceFormatted}
                    </span>
                  </td>

                  {/* Link externo */}
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-govblue-600 hover:text-govblue-800 transition-colors"
                      title={item.url}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
