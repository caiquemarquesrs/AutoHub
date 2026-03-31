const { Router } = require('express');
const ordersController = require('../controllers/orders.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateOrder } = require('../middlewares/validation.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/', ordersController.findAll.bind(ordersController));
router.get('/:id', ordersController.findById.bind(ordersController));
router.post('/', validateOrder, ordersController.create.bind(ordersController));

module.exports = router;
