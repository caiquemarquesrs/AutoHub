# Princípios SOLID — AutoHub

Este documento descreve os princípios SOLID aplicados no AutoHub, com exemplos reais do código.

---

## 1. SRP — Single Responsibility Principle (Princípio da Responsabilidade Única)

> "Uma classe/módulo deve ter uma, e apenas uma, razão para mudar."

### Onde foi aplicado

A arquitetura inteira do AutoHub segue o SRP através da separação em camadas:

| Camada | Responsabilidade Única |
|--------|----------------------|
| **Routes** | Definir rotas e encadear middlewares |
| **Controllers** | Receber a requisição, chamar o service, retornar a resposta HTTP |
| **Services** | Lógica de negócio (validações, cálculos, regras) |
| **Repositories** | Acesso a dados (queries SQL) |
| **Middlewares** | Verificações transversais (auth, role, validação) |

### Exemplo concreto

```javascript
// auth.controller.js — SÓ recebe request e retorna response
class AuthController {
  login(req, res, next) {
    try {
      const result = authService.login(req.body); // delega ao service
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err); // delega ao error middleware
    }
  }
}
```

```javascript
// auth.service.js — SÓ lógica de negócio
class AuthService {
  login({ email, password }) {
    const user = userRepository.findByEmail(email); // delega ao repository
    // ... verifica senha, gera token ...
    return { token, user };
  }
}
```

```javascript
// user.repository.js — SÓ acesso a dados
class UserRepository {
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }
}
```

### Por que isso importa

Se a query SQL precisar mudar, apenas o repository muda. Se a regra de negócio mudar, apenas o service muda. Se o formato da resposta HTTP mudar, apenas o controller muda. Nenhuma alteração "vaza" para outras camadas.

---

## 2. OCP — Open/Closed Principle (Princípio Aberto/Fechado)

> "Entidades devem estar abertas para extensão, mas fechadas para modificação."

### Onde foi aplicado

#### Middlewares extensíveis

O sistema de middlewares permite adicionar novas verificações sem modificar código existente. Para adicionar uma nova regra (ex: rate limiting), basta criar um novo middleware e encadeá-lo na rota — nenhum middleware existente precisa ser alterado.

```javascript
// Hoje: auth + role + validation
router.use(authMiddleware);
router.use(authorize('admin'));
router.post('/parts', validatePart, adminController.createPart);

// Amanhã: adicionamos rate limiting SEM modificar nada existente
const rateLimiter = require('./middlewares/rateLimit.middleware');
router.use(authMiddleware);
router.use(authorize('admin'));
router.post('/parts', rateLimiter, validatePart, adminController.createPart);
```

#### Função `authorize` parametrizada

A função `authorize()` foi projetada para aceitar qualquer role, sem necessidade de criar um middleware novo para cada perfil:

```javascript
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Sem permissão');
    }
    next();
  };
}

// Uso: fechado para modificação, aberto para extensão
router.use(authorize('admin'));           // só admin
router.use(authorize('admin', 'user'));   // admin ou user
router.use(authorize('moderator'));       // novo role no futuro
```

#### Classes de erro extensíveis

A hierarquia `AppError > NotFoundError / UnauthorizedError / ...` permite criar novos tipos de erro sem alterar o `errorMiddleware`:

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(msg) { super(msg, 404); }
}

// Novo tipo de erro — errorMiddleware continua funcionando:
class ConflictError extends AppError {
  constructor(msg) { super(msg, 409); }
}
```

---

## 3. DIP — Dependency Inversion Principle (Princípio da Inversão de Dependência)

> "Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações."

### Onde foi aplicado

Os **services** (alto nível) dependem dos **repositories** (baixo nível) através de uma interface implícita: métodos como `findAll()`, `findById()`, `create()`, `update()`, `delete()`.

### Exemplo concreto

```javascript
// parts.service.js — depende de "algo que tenha findAll e findById"
const partRepository = require('../repositories/part.repository');

class PartsService {
  findAll(filters) {
    return partRepository.findAll(filters);
  }

  findById(id) {
    const part = partRepository.findById(id);
    if (!part) throw new NotFoundError('Peça não encontrada');
    return part;
  }
}
```

O `PartsService` nunca importa `better-sqlite3` diretamente. Ele não sabe (nem precisa saber) qual banco está sendo usado. Se amanhã trocarmos SQLite por PostgreSQL, basta criar um novo `part.repository.js` que exporte os mesmos métodos (`findAll`, `findById`, etc.) — o service continua funcionando sem nenhuma alteração.

### Diagrama da inversão

```
SEM DIP (acoplado):
  PartsService → better-sqlite3 (dependência direta do banco)

COM DIP (desacoplado):
  PartsService → PartRepository → better-sqlite3
                  ↑ abstração      ↑ implementação
```

O service depende da abstração (PartRepository), não da implementação (better-sqlite3).

---

## Resumo

| Princípio | Onde está | Benefício principal |
|-----------|-----------|-------------------|
| SRP | Separação em camadas (routes/controllers/services/repositories/middlewares) | Cada módulo muda por uma única razão |
| OCP | Middlewares extensíveis, `authorize()` parametrizado, hierarquia de erros | Adicionar features sem alterar código existente |
| DIP | Services dependem de repositories, não do banco diretamente | Trocar o banco sem afetar a lógica de negócio |
