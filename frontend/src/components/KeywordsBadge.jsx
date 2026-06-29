import React from 'react';

export const KeywordsBadge = ({ keywords }) => {
  if (!keywords) return null;
  
  return (
    <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
      <span className="font-bold">Termos filtrados para busca: </span> 
      {keywords.join(', ')}
    </div>
  );
};