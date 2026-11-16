const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.disneyapi.dev',
  timeout: 8000
});

async function getCharacters(page = 1, pageSize = 12) {
  const response = await api.get('/character', {
    params: { page, pageSize }
  });
  return response.data;
}

module.exports = { getCharacters }; 