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

// Найти одного персонажа по имени
async function getCharacterByName(name) {
  const response = await api.get('/character', {
    params: { name }
  });
  const data = response.data.data;
  const list = Array.isArray(data) ? data : [data];

  // Сначала ищем точное совпадение имени, иначе берём первого
  const exact = list.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return exact || list[0];
}

module.exports = { getCharacters, getCharacterByName }; 