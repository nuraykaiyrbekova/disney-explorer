const express = require('express');
const homeController = require('../controllers/homeController');
const catalogController = require('../controllers/catalogController');
const characterController = require('../controllers/characterController');
const searchController = require('../controllers/searchController');
const compareController = require('../controllers/compareController');
const topController = require('../controllers/topController');
const {
  validateCatalogQuery,
  validateCharacterId,
  validateSearch,
  validateCompare
} = require('../middleware/validate');

// Router groups all routes; app.js mounts it at '/'
const router = express.Router();

// Home page: featured characters
router.get('/', homeController.showHome);
// Catalog: validateCatalogQuery checks ?page and ?sort before the controller runs
router.get('/characters', validateCatalogQuery, catalogController.showCatalog);
// Details page: validateCharacterId checks that :id is a positive number
router.get('/character/:id', validateCharacterId, characterController.showCharacter);
// Search results: validateSearch checks ?q (and ?page)
router.get('/search', validateSearch, searchController.showSearch);
// Compare two characters: validateCompare handles ?ids=, ?a=&b= or the empty form
router.get('/compare', validateCompare, compareController.showCompare);
// Top characters ranking (no user input, so no validation)
router.get('/top', topController.showTop);

module.exports = router; 
