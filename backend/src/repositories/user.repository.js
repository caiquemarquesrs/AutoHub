/**
 * @class UserRepository
 * @description Encapsula todo o acesso a dados da entidade User.
 * 
 * @pattern Repository (Estrutural)
 * @problem Isolar queries SQL da lógica de negócio nos services.
 * @benefit Desacoplamento: trocar o banco não afeta os services.
 */
const db = require('../config/database');

class UserRepository {
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  findById(id) {
    return db.prepare('SELECT id, name, email, role, phone, cpf_cnpj, created_at FROM users WHERE id = ?').get(id);
  }

  create({ name, email, password_hash, phone, cpf_cnpj }) {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, phone, cpf_cnpj) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, email, password_hash, phone, cpf_cnpj);
    return this.findById(result.lastInsertRowid);
  }
}

module.exports = new UserRepository();
