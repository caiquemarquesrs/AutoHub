/**
 * @class PartRepository
 * @description Encapsula todo o acesso a dados da entidade Part (peça).
 * 
 * @pattern Repository (Estrutural)
 * @problem Isolar queries SQL da lógica de negócio nos services.
 * @benefit Desacoplamento: trocar o banco não afeta os services.
 */
const db = require('../config/database');

class PartRepository {
  findAll({ search, categoryId } = {}) {
    let query = `
      SELECT p.*, c.name as category_name
      FROM parts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY p.created_at DESC';
    return db.prepare(query).all(...params);
  }

  findById(id) {
    return db.prepare(`
      SELECT p.*, c.name as category_name
      FROM parts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);
  }

  create({ name, price, category_id, description, image_url, specifications, compatible_cars }) {
    const stmt = db.prepare(`
      INSERT INTO parts (name, price, category_id, description, image_url, specifications, compatible_cars)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, price, category_id, description, image_url, specifications, compatible_cars);
    return this.findById(result.lastInsertRowid);
  }

  update(id, { name, price, category_id, description, image_url, specifications, compatible_cars }) {
    const stmt = db.prepare(`
      UPDATE parts 
      SET name = ?, price = ?, category_id = ?, description = ?, image_url = ?, 
          specifications = ?, compatible_cars = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, price, category_id, description, image_url, specifications, compatible_cars, id);
    return this.findById(id);
  }

  delete(id) {
    return db.prepare('DELETE FROM parts WHERE id = ?').run(id);
  }

  count() {
    return db.prepare('SELECT COUNT(*) as total FROM parts').get().total;
  }
}

module.exports = new PartRepository();
