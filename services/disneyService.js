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

  const exact = list.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return exact || list[0];
}

// Получить одного персонажа по ID
async function getCharacterById(id) {
  const response = await api.get(`/character/${id}`);
  const data = response.data.data;
  return Array.isArray(data) ? data[0] : data;
}

module.exports = { getCharacters, getCharacterByName, getCharacterById }; 