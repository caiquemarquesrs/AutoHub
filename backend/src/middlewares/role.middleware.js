/**
 * @function authorize
 * @description Middleware de autorização por perfil. Verifica se o usuário tem o role necessário.
 * 
 * @pattern Chain of Responsibility / Middleware (Comportamental)
 * @problem Bloquear acesso a recursos restritos por perfil sem duplicar verificação em cada controller.
 * @benefit Reutilizável — basta encadear authorize('admin') em qualquer rota que precise de admin.
 */
const { ForbiddenError } = require('../utils/errors');

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError('Acesso negado');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Você não tem permissão para acessar este recurso');
    }
    next();
  };
}

module.exports = authorize;
