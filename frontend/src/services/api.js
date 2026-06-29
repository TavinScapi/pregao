import axios from 'axios';

// Aponta para o endereço do seu backend que ligamos no outro terminal
const API_URL = 'https://pregao-backend.onrender.com';

export const searchProducts = async (description) => {
  try {
    const response = await axios.post(`${API_URL}/search`, { description });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
};

// 👇 AGORA RECEBE O PACOTE COMPLETO (PAYLOAD) E ENVIA PRO BACKEND 👇
export const generatePDFs = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/pdf/generate`, payload);
    return response.data;
  } catch (error) {
    console.error("Erro ao gerar PDFs:", error);
    throw error;
  }
};