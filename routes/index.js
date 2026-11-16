const express = require('express');
const homeController = require('../controllers/homeController');
const catalogController = require('../controllers/catalogController');
const { validateCatalogQuery } = require('../middleware/validate');

const router = express.Router();

router.get('/', homeController.showHome);
router.get('/characters', validateCatalogQuery, catalogController.showCatalog);

module.exports = router; 