# AutoHub - E-commerce de Produtos Automobilísticos

Projeto Integrado — Desenvolvimento Web + Design de Software

## Sobre o Projeto

AutoHub é um sistema de e-commerce voltado para peças automotivas, desenvolvido como projeto acadêmico. O sistema permite que visitantes naveguem pelo catálogo, usuários realizem compras e administradores gerenciem pedidos e produtos.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express.js |
| Banco de Dados | SQLite (better-sqlite3) |
| Frontend | HTML5 + CSS3 + JavaScript puro |
| Autenticação | JWT (jsonwebtoken) + bcryptjs |
| Upload de imagens | Multer |
| Validação | express-validator |

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- npm (incluído com o Node.js)

## Instalação e Execução

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/autohub.git
cd autohub

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
# (copie backend/.env.example para backend/.env)

# 4. Popular o banco de dados com dados de exemplo
npm run seed

# 5. Iniciar o servidor
npm start
```

O sistema estará disponível em **http://localhost:3000**

## Configuração do `.env`

Crie o arquivo `backend/.env` com base no `backend/.env.example`:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
DB_PATH=./database.sqlite
```

## Execução Rápida (critério da disciplina)

Após instalar as dependências, a aplicação inicia com um único comando:

```bash
npm start
```

Comando completo recomendado para primeira execução:

```bash
npm install && npm run seed && npm start
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor em modo produção |
| `npm run dev` | Inicia com nodemon (hot reload) |
| `npm run seed` | Popula o banco com dados de exemplo |

## Credenciais de Acesso

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | admin@autohub.com | admin |
| Usuário | maria@email.com | 123456 |
| Usuário | joao@email.com | 123456 |

## Estrutura de Pastas

```
autoHub/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuração do banco (Singleton) e env
│   │   ├── controllers/     # Controllers com status HTTP corretos
│   │   ├── middlewares/      # Auth, role, validation, error
│   │   ├── repositories/    # Repository Pattern com JSDoc
│   │   ├── routes/          # Definição das rotas REST
│   │   ├── services/        # Lógica de negócio
│   │   ├── utils/           # Constantes e classes de erro
│   │   └── seed/            # Script de seed
│   ├── uploads/             # Imagens enviadas via upload
│   ├── app.js               # Configuração do Express
│   ├── server.js            # Ponto de entrada
│   └── .env                 # Variáveis de ambiente
├── frontend/
│   ├── index.html           # Catálogo (página inicial)
│   ├── pages/               # Páginas HTML
│   ├── css/                 # Estilos (variáveis CSS, responsividade)
│   ├── js/                  # Scripts do frontend
│   └── assets/              # Recursos estáticos
├── docs/                    # Documentação do projeto
├── package.json
├── .gitignore
└── README.md
```

## API REST

Base URL: `http://localhost:3000/api`

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro de novo usuário |
| POST | /api/auth/login | Login (retorna JWT) |

### Peças (Público)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/parts | Listar peças (aceita ?search e ?category) |
| GET | /api/parts/:id | Detalhe de uma peça |

### Categorias (Público)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/categories | Listar categorias |

### Pedidos (Usuário autenticado)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/orders | Listar pedidos do usuário |
| GET | /api/orders/:id | Detalhe de um pedido |
| POST | /api/orders | Criar novo pedido |

### Admin (Requer role admin)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/admin/dashboard | Dados do dashboard |
| GET | /api/admin/orders | Listar todos os pedidos |
| GET | /api/admin/orders/:id | Detalhe de um pedido |
| PATCH | /api/admin/orders/:id/status | Atualizar status do pedido |
| POST | /api/admin/parts | Cadastrar nova peça |
| PUT | /api/admin/parts/:id | Atualizar peça existente |
| DELETE | /api/admin/parts/:id | Remover peça |

## Perfis de Usuário

- **Visitante**: navega pelo catálogo e visualiza detalhes das peças
- **Usuário**: adiciona ao carrinho, finaliza pedidos, acompanha status
- **Admin**: gerencia peças (CRUD), gerencia pedidos (status), visualiza dashboard

## Design Patterns Utilizados

1. **Singleton** (Criacional) — Conexão com o banco de dados
2. **Repository** (Estrutural) — Acesso a dados isolado dos services
3. **Middleware / Chain of Responsibility** (Comportamental) — Autenticação e autorização

Consulte `docs/design-patterns.md` para detalhes completos.

## Princípios SOLID Aplicados

1. **SRP** — Single Responsibility Principle
2. **OCP** — Open/Closed Principle
3. **DIP** — Dependency Inversion Principle

Consulte `docs/solid.md` para detalhes completos.

## Entregáveis

- [x] Repositório GitHub com código fonte
- [x] Aplicação funcional (backend + frontend)
- [x] Banco de dados SQLite com seed
- [x] Coleção Postman (`docs/autohub.postman.json`)
- [x] Diagrama ER (`docs/diagrama-er.md`)
- [x] Diagrama Estrutural (`docs/diagrama-estrutural.md`)
- [x] Documentação de Design Patterns (`docs/design-patterns.md`)
- [x] Documentação de SOLID (`docs/solid.md`)
- [x] README completo

## Autor

AutoHub Team — Projeto Integrado 2026
