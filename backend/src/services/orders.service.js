const orderRepository = require('../repositories/order.repository');
const partRepository = require('../repositories/part.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { SHIPPING_FREE_THRESHOLD, SHIPPING_COST } = require('../utils/constants');

class OrdersService {
  findByUserId(userId) {
    const orders = orderRepository.findByUserId(userId);
    return orders.map((order) => ({
      ...order,
      items: orderRepository.findItemsByOrderId(order.id),
    }));
  }

  findById(id, userId) {
    const order = orderRepository.findById(id);
    if (!order) throw new NotFoundError('Pedido não encontrado');
    if (order.user_id !== userId) throw new NotFoundError('Pedido não encontrado');

    order.items = orderRepository.findItemsByOrderId(id);
    return order;
  }

  create(userId, { address, payment_method, installments, items }) {
    if (!items || items.length === 0) {
      throw new ValidationError('O carrinho está vazio');
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const part = partRepository.findById(item.part_id);
      if (!part) throw new ValidationError(`Peça com ID ${item.part_id} não encontrada`);

      const unitPrice = part.price;
      subtotal += unitPrice * item.quantity;
      orderItems.push({ part_id: item.part_id, quantity: item.quantity, unit_price: unitPrice });
    }

    const shipping = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    const order = orderRepository.create({
      user_id: userId,
      address,
      payment_method,
      installments: installments || 1,
      subtotal,
      shipping,
      total,
      items: orderItems,
    });

    order.items = orderRepository.findItemsByOrderId(order.id);
    return order;
  }
}

module.exports = new OrdersService();
