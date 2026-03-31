/**
 * @class CategoryRepository
 * @description Encapsula todo o acesso a dados da entidade Category.
 * 
 * @pattern Repository (Estrutural)
 * @problem Isolar queries SQL da lógica de negócio nos services.
 * @benefit Desacoplamento: trocar o banco não afeta os services.
 */
const db = require('../config/database');

class CategoryRepository {
  findAll() {
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  }

  findById(id) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  }

  findByName(name) {
    return db.prepare('SELECT * FROM categories WHERE name = ?').get(name);
  }
}

module.exports = new CategoryRepository();
