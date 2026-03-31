const orderRepository = require('../repositories/order.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { ORDER_STATUS, ORDER_STATUS_FLOW } = require('../utils/constants');

class AdminService {
  getDashboard() {
    return {
      totalOrders: orderRepository.countAll(),
      processingOrders: orderRepository.countByStatus(ORDER_STATUS.PROCESSING),
      shippedOrders: orderRepository.countByStatus(ORDER_STATUS.SHIPPED),
      deliveredOrders: orderRepository.countByStatus(ORDER_STATUS.DELIVERED),
      totalRevenue: orderRepository.getTotalRevenue(),
      recentOrders: orderRepository.getRecentOrders(5),
    };
  }

  findAllOrders(filters) {
    const orders = orderRepository.findAll(filters);
    return orders.map((order) => ({
      ...order,
      items: orderRepository.findItemsByOrderId(order.id),
    }));
  }

  findOrderById(id) {
    const order = orderRepository.findById(id);
    if (!order) throw new NotFoundError('Pedido não encontrado');
    order.items = orderRepository.findItemsByOrderId(id);
    return order;
  }

  updateOrderStatus(id, newStatus) {
    const order = orderRepository.findById(id);
    if (!order) throw new NotFoundError('Pedido não encontrado');

    const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
    const newIndex = ORDER_STATUS_FLOW.indexOf(newStatus);

    if (newIndex === -1) {
      throw new ValidationError('Status inválido');
    }
    if (newIndex <= currentIndex) {
      throw new ValidationError('Não é possível voltar o status do pedido');
    }
    if (newIndex !== currentIndex + 1) {
      throw new ValidationError('O status deve avançar sequencialmente');
    }

    const updated = orderRepository.updateStatus(id, newStatus);
    updated.items = orderRepository.findItemsByOrderId(id);
    return updated;
  }
}

module.exports = new AdminService();
