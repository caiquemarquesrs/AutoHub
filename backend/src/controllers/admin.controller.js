const adminService = require('../services/admin.service');
const partsService = require('../services/parts.service');

class AdminController {
  getDashboard(req, res, next) {
    try {
      const data = adminService.getDashboard();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  findAllOrders(req, res, next) {
    try {
      const { search, status } = req.query;
      const orders = adminService.findAllOrders({ search, status });
      res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  findOrderById(req, res, next) {
    try {
      const order = adminService.findOrderById(Number(req.params.id));
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  updateOrderStatus(req, res, next) {
    try {
      const order = adminService.updateOrderStatus(Number(req.params.id), req.body.status);
      res.status(200).json({ success: true, message: 'Status atualizado com sucesso', data: order });
    } catch (err) {
      next(err);
    }
  }

  createPart(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.image_url = `/uploads/${req.file.filename}`;
      }
      const part = partsService.create(data);
      res.status(201).json({ success: true, message: 'Peça cadastrada com sucesso', data: part });
    } catch (err) {
      next(err);
    }
  }

  updatePart(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.image_url = `/uploads/${req.file.filename}`;
      }
      const part = partsService.update(Number(req.params.id), data);
      res.status(200).json({ success: true, message: 'Peça atualizada com sucesso', data: part });
    } catch (err) {
      next(err);
    }
  }

  deletePart(req, res, next) {
    try {
      partsService.delete(Number(req.params.id));
      res.status(200).json({ success: true, message: 'Peça removida com sucesso' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
