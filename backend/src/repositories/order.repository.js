/**
 * @class OrderRepository
 * @description Encapsula todo o acesso a dados das entidades Order e OrderItem.
 * 
 * @pattern Repository (Estrutural)
 * @problem Isolar queries SQL da lógica de negócio nos services.
 * @benefit Desacoplamento: trocar o banco não afeta os services.
 */
const db = require('../config/database');

class OrderRepository {
  findByUserId(userId) {
    return db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId);
  }

  findAll({ search, status } = {}) {
    let query = `
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (CAST(o.id AS TEXT) LIKE ? OR u.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';
    return db.prepare(query).all(...params);
  }

  findById(id) {
    return db.prepare(`
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(id);
  }

  findItemsByOrderId(orderId) {
    return db.prepare(`
      SELECT oi.*, p.name as part_name, p.image_url as part_image
      FROM order_items oi
      JOIN parts p ON oi.part_id = p.id
      WHERE oi.order_id = ?
    `).all(orderId);
  }

  create({ user_id, address, payment_method, installments, subtotal, shipping, total, items }) {
    const insertOrder = db.prepare(`
      INSERT INTO orders (user_id, address, payment_method, installments, subtotal, shipping, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, part_id, quantity, unit_price)
      VALUES (?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const result = insertOrder.run(user_id, address, payment_method, installments, subtotal, shipping, total);
      const orderId = result.lastInsertRowid;
      
      for (const item of items) {
        insertItem.run(orderId, item.part_id, item.quantity, item.unit_price);
      }

      return orderId;
    });

    const orderId = transaction();
    return this.findById(orderId);
  }

  updateStatus(id, status) {
    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    return this.findById(id);
  }

  countAll() {
    return db.prepare('SELECT COUNT(*) as total FROM orders').get().total;
  }

  countByStatus(status) {
    return db.prepare('SELECT COUNT(*) as total FROM orders WHERE status = ?').get(status).total;
  }

  getTotalRevenue() {
    const result = db.prepare('SELECT COALESCE(SUM(total), 0) as revenue FROM orders').get();
    return result.revenue;
  }

  getRecentOrders(limit = 5) {
    return db.prepare(`
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ?
    `).all(limit);
  }
}

module.exports = new OrderRepository();
