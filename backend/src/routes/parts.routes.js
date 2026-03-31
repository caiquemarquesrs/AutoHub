const { Router } = require('express');
const partsController = require('../controllers/parts.controller');

const router = Router();

router.get('/', partsController.findAll.bind(partsController));
router.get('/:id', partsController.findById.bind(partsController));

module.exports = router;
