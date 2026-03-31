const { Router } = require('express');
const categoriesController = require('../controllers/categories.controller');

const router = Router();

router.get('/', categoriesController.findAll.bind(categoriesController));

module.exports = router;
