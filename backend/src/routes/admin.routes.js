const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { validatePart, validateStatusUpdate } = require('../middlewares/validation.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboard.bind(adminController));
router.get('/orders', adminController.findAllOrders.bind(adminController));
router.get('/orders/:id', adminController.findOrderById.bind(adminController));
router.patch('/orders/:id/status', validateStatusUpdate, adminController.updateOrderStatus.bind(adminController));
router.post('/parts', upload.single('image'), validatePart, adminController.createPart.bind(adminController));
router.put('/parts/:id', upload.single('image'), validatePart, adminController.updatePart.bind(adminController));
router.delete('/parts/:id', adminController.deletePart.bind(adminController));

module.exports = router;
