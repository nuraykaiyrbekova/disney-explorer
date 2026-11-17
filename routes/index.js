const express = require('express');
const homeController = require('../controllers/homeController');
const catalogController = require('../controllers/catalogController');
const characterController = require('../controllers/characterController');
const searchController = require('../controllers/searchController');
const compareController = require('../controllers/compareController');
const {
  validateCatalogQuery,
  validateCharacterId,
  validateSearch,
  validateCompare
} = require('../middleware/validate');

const router = express.Router();

router.get('/', homeController.showHome);
router.get('/characters', validateCatalogQuery, catalogController.showCatalog);
router.get('/character/:id', validateCharacterId, characterController.showCharacter);
router.get('/search', validateSearch, searchController.showSearch);
router.get('/compare', validateCompare, compareController.showCompare);

module.exports = router; 