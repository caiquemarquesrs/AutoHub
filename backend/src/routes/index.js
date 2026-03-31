const { Router } = require('express');
const authRoutes = require('./auth.routes');
const partsRoutes = require('./parts.routes');
const categoriesRoutes = require('./categories.routes');
const ordersRoutes = require('./orders.routes');
const adminRoutes = require('./admin.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/parts', partsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/orders', ordersRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
