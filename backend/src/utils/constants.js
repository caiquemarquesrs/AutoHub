const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

const ORDER_STATUS = {
  PROCESSING: 'Processando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
};

const ORDER_STATUS_FLOW = ['Processando', 'Enviado', 'Entregue'];

const PAYMENT_METHODS = {
  PIX: 'pix',
  CREDIT: 'credit',
  DEBIT: 'debit',
};

const SHIPPING_FREE_THRESHOLD = 300;
const SHIPPING_COST = 19.90;

const CATEGORIES = ['Motor', 'Freios', 'Suspensão', 'Elétrica', 'Rodas', 'Manutenção'];

module.exports = {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  PAYMENT_METHODS,
  SHIPPING_FREE_THRESHOLD,
  SHIPPING_COST,
  CATEGORIES,
};
