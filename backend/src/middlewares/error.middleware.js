/**
 * @function errorMiddleware
 * @description Middleware centralizado de tratamento de erros.
 * 
 * @pattern Chain of Responsibility / Middleware (Comportamental)
 * @problem Sem ele, cada controller teria que ter seu próprio try/catch e formatação de erros.
 * @benefit Ponto único para tratar todos os erros da aplicação de forma consistente.
 */
const { AppError } = require('../utils/errors');

function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
}

module.exports = errorMiddleware;
