const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ValidationError('Dados inválidos', messages);
  }
  next();
}

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').trim().isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('phone').optional().trim(),
  body('cpf_cnpj').optional().trim(),
  handleValidation,
];

const validateLogin = [
  body('email').trim().notEmpty().withMessage('E-mail é obrigatório'),
  body('password').trim().notEmpty().withMessage('Senha é obrigatória'),
  handleValidation,
];

const validatePart = [
  body('name').trim().notEmpty().withMessage('Nome da peça é obrigatório'),
  body('price').isFloat({ gt: 0 }).withMessage('Preço deve ser maior que zero'),
  body('category_id').optional(),
  body('description').optional().trim(),
  body('specifications').optional(),
  body('compatible_cars').optional(),
  handleValidation,
];

const validateOrder = [
  body('address').trim().notEmpty().withMessage('Endereço de entrega é obrigatório'),
  body('payment_method').isIn(['pix', 'credit', 'debit']).withMessage('Forma de pagamento inválida'),
  body('installments').optional().isInt({ min: 1 }).withMessage('Número de parcelas inválido'),
  body('items').isArray({ min: 1 }).withMessage('O carrinho está vazio'),
  body('items.*.part_id').isInt().withMessage('ID da peça inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade inválida'),
  handleValidation,
];

const validateStatusUpdate = [
  body('status').isIn(['Processando', 'Enviado', 'Entregue']).withMessage('Status inválido'),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePart,
  validateOrder,
  validateStatusUpdate,
};
