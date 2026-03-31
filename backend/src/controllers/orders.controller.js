const ordersService = require('../services/orders.service');

class OrdersController {
  findAll(req, res, next) {
    try {
      const orders = ordersService.findByUserId(req.user.id);
      res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  findById(req, res, next) {
    try {
      const order = ordersService.findById(Number(req.params.id), req.user.id);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  create(req, res, next) {
    try {
      const order = ordersService.create(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Pedido criado com sucesso', data: order });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrdersController();
