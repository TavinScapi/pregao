import React from 'react';

export const ErrorAlert = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
      <p className="font-bold">Ops! Algo deu errado:</p>
      <p>{message}</p>
    </div>
  );
};