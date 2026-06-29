import axios from 'axios';

const API_URL = 'https://pregao-backend.onrender.com';

export const searchProducts = async (description) => {
  const response = await axios.post(
    `${API_URL}/api/search`,
    { description }
  );

  return response.data;
};

export const generatePDFs = async (payload) => {
  const response = await axios.post(
    `${API_URL}/api/pdf/generate`,
    payload
  );

  return response.data;
};