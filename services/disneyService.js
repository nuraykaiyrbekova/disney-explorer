// Service layer: the only file that talks to the Disney API (using Axios).
// Controllers call these functions and never use Axios directly.
const axios = require('axios');

// Axios instance: base URL from .env and an 8 second timeout,
// so the server never waits forever if the API does not answer
const api = axios.create({
  baseURL: process.env.DISNEY_API_URL || 'https://api.disneyapi.dev',
  timeout: 8000 
});
 
// Request 1: a page of characters for the catalog (GET /character?page=&pageSize=).
// Returns the whole response (data + info with totalPages).
async function getCharacters(page = 1, pageSize = 12) {
  const response = await api.get('/character', {
    params: { page, pageSize }
  });
  return response.data;
}


// Request 2: find one character by name (GET /character?name=).
// Prefers an exact name match, otherwise takes the first result.
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


// Request 3: one character by ID (GET /character/:id) for the details page.
// The API may return an array or an object, so both cases are handled.
async function getCharacterById(id) {
  const response = await api.get(`/character/${id}`);
  const data = response.data.data;
  return Array.isArray(data) ? data[0] : data;
}


// Request 4: search by name with pagination, used by the search and compare pages.
// Returns { list, totalPages }.
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

    // The API answers 404 when nothing matches: that is an empty result, not an error.
    // All other errors are passed on to the controller and the error handler.
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
