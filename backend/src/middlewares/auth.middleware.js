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
    next();
  } catch (err) {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}

module.exports = authMiddleware;
