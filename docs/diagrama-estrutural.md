# Diagrama Estrutural — AutoHub

## Arquitetura em Camadas

```mermaid
graph TD
    Client["🖥️ Frontend<br/>HTML + CSS + JS"]
    
    Client -->|"HTTP Request"| Routes

    subgraph Backend["Backend (Node.js + Express)"]
        Routes["Routes<br/>auth.routes.js<br/>parts.routes.js<br/>orders.routes.js<br/>admin.routes.js<br/>categories.routes.js"]
        
        Middlewares["Middlewares<br/>authMiddleware<br/>authorize(role)<br/>validatePart<br/>validateOrder<br/>errorMiddleware"]
        
        Controllers["Controllers<br/>AuthController<br/>PartsController<br/>OrdersController<br/>AdminController<br/>CategoriesController"]
        
        Services["Services<br/>AuthService<br/>PartsService<br/>OrdersService<br/>AdminService"]
        
        Repositories["Repositories<br/>UserRepository<br/>PartRepository<br/>OrderRepository<br/>CategoryRepository"]
        
        Database["Database (Singleton)<br/>SQLite via better-sqlite3"]
        
        Routes --> Middlewares
        Middlewares --> Controllers
        Controllers --> Services
        Services --> Repositories
        Repositories --> Database
    end

    style Client fill:#E63946,color:#fff,stroke:none
    style Routes fill:#1D3557,color:#fff,stroke:none
    style Middlewares fill:#457B9D,color:#fff,stroke:none
    style Controllers fill:#A8DADC,color:#1C1C1E,stroke:none
    style Services fill:#F1FAEE,color:#1C1C1E,stroke:none
    style Repositories fill:#E8EBF0,color:#1C1C1E,stroke:none
    style Database fill:#1D3557,color:#fff,stroke:none
```

## Fluxo de uma Requisição

```mermaid
sequenceDiagram
    participant C as Cliente (Browser)
    participant R as Router
    participant M as Middlewares
    participant CT as Controller
    participant S as Service
    participant RP as Repository
    participant DB as SQLite

    C->>R: POST /api/orders
    R->>M: authMiddleware
    M->>M: Valida JWT
    M->>M: validateOrder (body)
    M->>CT: req com user + body validado
    CT->>S: ordersService.create(userId, body)
    S->>RP: partRepository.findById(partId)
    RP->>DB: SELECT * FROM parts WHERE id = ?
    DB-->>RP: Part data
    RP-->>S: Part object
    S->>S: Calcula subtotal, frete, total
    S->>RP: orderRepository.create(orderData)
    RP->>DB: INSERT INTO orders + INSERT INTO order_items
    DB-->>RP: lastInsertRowid
    RP-->>S: Order object
    S-->>CT: Order completo com items
    CT-->>C: 201 { success: true, data: order }
```

## Diagrama de Classes (Simplificado)

```mermaid
classDiagram
    class AuthController {
        +register(req, res, next)
        +login(req, res, next)
    }
    
    class PartsController {
        +findAll(req, res, next)
        +findById(req, res, next)
    }
    
    class OrdersController {
        +findAll(req, res, next)
        +findById(req, res, next)
        +create(req, res, next)
    }
    
    class AdminController {
        +getDashboard(req, res, next)
        +findAllOrders(req, res, next)
        +findOrderById(req, res, next)
        +updateOrderStatus(req, res, next)
        +createPart(req, res, next)
        +updatePart(req, res, next)
        +deletePart(req, res, next)
    }
    
    class AuthService {
        +register(data)
        +login(credentials)
    }
    
    class PartsService {
        +findAll(filters)
        +findById(id)
        +create(data)
        +update(id, data)
        +delete(id)
    }
    
    class OrdersService {
        +findByUserId(userId)
        +findById(id, userId)
        +create(userId, data)
    }
    
    class AdminService {
        +getDashboard()
        +findAllOrders(filters)
        +findOrderById(id)
        +updateOrderStatus(id, status)
    }
    
    class UserRepository {
        +findByEmail(email)
        +findById(id)
        +create(data)
    }
    
    class PartRepository {
        +findAll(filters)
        +findById(id)
        +create(data)
        +update(id, data)
        +delete(id)
        +count()
    }
    
    class OrderRepository {
        +findByUserId(userId)
        +findAll(filters)
        +findById(id)
        +findItemsByOrderId(orderId)
        +create(data)
        +updateStatus(id, status)
        +countAll()
        +countByStatus(status)
        +getTotalRevenue()
        +getRecentOrders(limit)
    }
    
    class CategoryRepository {
        +findAll()
        +findById(id)
        +findByName(name)
    }

    class AppError {
        +message: string
        +statusCode: number
        +isOperational: boolean
    }
    
    class NotFoundError
    class UnauthorizedError
    class ForbiddenError
    class ValidationError

    AuthController --> AuthService
    PartsController --> PartsService
    OrdersController --> OrdersService
    AdminController --> AdminService
    AdminController --> PartsService
    
    AuthService --> UserRepository
    PartsService --> PartRepository
    OrdersService --> OrderRepository
    OrdersService --> PartRepository
    AdminService --> OrderRepository
    
    NotFoundError --|> AppError
    UnauthorizedError --|> AppError
    ForbiddenError --|> AppError
    ValidationError --|> AppError
```

## Responsabilidade de Cada Camada

| Camada | Responsabilidade | Exemplo |
|--------|-----------------|---------|
| **Routes** | Mapear URL + verbo HTTP → middleware → controller | `router.get('/parts/:id', partsController.findById)` |
| **Middlewares** | Verificações transversais antes do controller | `authMiddleware`, `authorize('admin')`, `validatePart` |
| **Controllers** | Receber req, chamar service, retornar response com status correto | `res.status(201).json({ success: true, data })` |
| **Services** | Lógica de negócio, regras, cálculos | Calcular frete, validar fluxo de status |
| **Repositories** | Queries SQL, CRUD no banco | `db.prepare('SELECT ...').all()` |
| **Database** | Conexão única com SQLite (Singleton) | `module.exports = db` |
