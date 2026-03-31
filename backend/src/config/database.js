/**
 * @module Database
 * @description Conexão com o banco SQLite usando o padrão Singleton.
 * 
 * @pattern Singleton (Criacional)
 * @problem Evitar múltiplas conexões ao banco de dados, garantindo que toda a
 *          aplicação compartilhe uma única instância de conexão.
 * @benefit Economia de recursos e consistência nos acessos ao banco.
 *          Se futuramente for necessário trocar o banco, basta alterar este módulo.
 */
const Database = require('better-sqlite3');
const path = require('path');
const env = require('./env');

const dbPath = path.resolve(__dirname, '..', '..', env.DB_PATH);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    phone TEXT,
    cpf_cnpj TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT,
    image_url TEXT,
    specifications TEXT DEFAULT '[]',
    compatible_cars TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'Processando' CHECK(status IN ('Processando', 'Enviado', 'Entregue')),
    address TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('pix', 'credit', 'debit')),
    installments INTEGER DEFAULT 1,
    subtotal REAL NOT NULL,
    shipping REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    part_id INTEGER NOT NULL REFERENCES parts(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL
  );
`);

module.exports = db;
