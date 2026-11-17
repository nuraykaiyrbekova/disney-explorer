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


async function getCharacterById(id) {
  const response = await api.get(`/character/${id}`);
  const data = response.data.data;
  return Array.isArray(data) ? data[0] : data;
}


async function searchCharacters(name, page = 1, pageSize = 12) {
  try {
    const response = await api.get('/character', {
      params: { name, page, pageSize }
    });
    const data = response.data.data;
    const list = Array.isArray(data) ? data : data ? [data] : [];
    const totalPages = (response.data.info && response.data.info.totalPages) || 1;
    return { list, totalPages };
  } catch (err) {

    if (err.response && err.response.status === 404) {
      return { list: [], totalPages: 1 };
    }
    throw err;
  }
}

module.exports = {
  getCharacters,
  getCharacterByName,
  getCharacterById,
  searchCharacters
}; 