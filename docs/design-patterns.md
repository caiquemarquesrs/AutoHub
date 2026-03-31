# Design Patterns — AutoHub

Este documento descreve os padrões de projeto aplicados no AutoHub, com exemplos reais do código.

---

## 1. Singleton (Criacional)

### Onde foi aplicado
`backend/src/config/database.js`

### Problema
Sem o Singleton, cada módulo que precisasse acessar o banco criaria uma nova conexão, desperdiçando recursos e causando inconsistências.

### Solução
Um único módulo cria a conexão e exporta a instância. Todos os repositórios importam a mesma instância.

### Benefício
Economia de recursos e garantia de que toda a aplicação usa a mesma conexão.

### Código

```javascript
/**
 * @module Database
 * @description Conexão com o banco SQLite usando o padrão Singleton.
 *
 * @pattern Singleton (Criacional)
 * @problem Evitar múltiplas conexões ao banco de dados, garantindo que toda a
 *          aplicação compartilhe uma única instância de conexão.
 * @benefit Economia de recursos e consistência nos acessos ao banco.
 */
const Database = require('better-sqlite3');
const path = require('path');
const env = require('./env');

const dbPath = path.resolve(__dirname, '..', '..', env.DB_PATH);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ... criação das tabelas ...

module.exports = db; // Sempre a mesma instância (Singleton)
```

### Como funciona na prática
```javascript
// Em user.repository.js
const db = require('../config/database'); // mesma instância

// Em order.repository.js
const db = require('../config/database'); // mesma instância
```

Node.js cacheia os módulos no `require.cache`, então `require('../config/database')` sempre retorna o mesmo objeto — implementando o Singleton sem necessidade de classe com `getInstance()`.

---

## 2. Repository (Estrutural)

### Onde foi aplicado
- `backend/src/repositories/user.repository.js`
- `backend/src/repositories/part.repository.js`
- `backend/src/repositories/order.repository.js`
- `backend/src/repositories/category.repository.js`

### Problema
Sem o Repository, queries SQL ficariam espalhadas nos services e controllers, acoplando a lógica de negócio ao banco de dados.

### Solução
Cada entidade tem seu próprio repositório que encapsula todas as operações de acesso a dados.

### Benefício
Desacoplamento total: se futuramente for necessário trocar o SQLite por outro banco, basta alterar os repositórios — os services permanecem intactos.

### Código

```javascript
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

  create(data) { /* ... */ }
  update(id, data) { /* ... */ }
  delete(id) { /* ... */ }
}

module.exports = new PartRepository();
```

### Como funciona na prática
```javascript
// No service, nunca escrevemos SQL diretamente:
const partRepository = require('../repositories/part.repository');

class PartsService {
  findAll(filters) {
    return partRepository.findAll(filters); // Service não sabe nada de SQL
  }
}
```

---

## 3. Middleware / Chain of Responsibility (Comportamental)

### Onde foi aplicado
- `backend/src/middlewares/auth.middleware.js` — Verifica token JWT
- `backend/src/middlewares/role.middleware.js` — Verifica permissão por role
- `backend/src/middlewares/validation.middleware.js` — Valida campos da requisição
- `backend/src/middlewares/error.middleware.js` — Trata erros de forma centralizada

### Problema
Sem middlewares, cada controller teria que implementar verificação de token, permissão e validação de campos, gerando duplicação massiva de código.

### Solução
Cada middleware faz uma única verificação e passa a requisição adiante (`next()`) ou interrompe a cadeia lançando um erro.

### Benefício
Reutilização — o mesmo middleware de autenticação protege todas as rotas que precisam de login. Composição — basta encadear middlewares na rota.

### Código

```javascript
/**
 * @function authMiddleware
 * @description Verifica o token JWT no header Authorization.
 *
 * @pattern Chain of Responsibility / Middleware (Comportamental)
 * @problem Separar verificações transversais (auth, role, validação) da lógica do controller.
 * @benefit Cada middleware faz uma única coisa e pode ser reutilizado em qualquer rota.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError } = require('../utils/errors');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token não fornecido');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next(); // Passa para o próximo middleware/controller
  } catch (err) {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}

module.exports = authMiddleware;
```

### Como funciona na prática (encadeamento)
```javascript
// Rotas admin — a requisição passa por 3 middlewares antes do controller:
router.use(authMiddleware);           // 1. Verifica token
router.use(authorize('admin'));       // 2. Verifica role
router.patch('/orders/:id/status',
  validateStatusUpdate,               // 3. Valida body
  adminController.updateOrderStatus   // 4. Controller (só chega aqui se tudo OK)
);
```

A cadeia funciona como uma corrente: se qualquer elo falha, o erro é capturado pelo `errorMiddleware` e retornado ao cliente sem chegar ao controller.
