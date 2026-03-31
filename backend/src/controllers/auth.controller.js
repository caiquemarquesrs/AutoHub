const authService = require('../services/auth.service');

class AuthController {
  register(req, res, next) {
    try {
      const user = authService.register(req.body);
      res.status(201).json({ success: true, message: 'Conta criada com sucesso', data: user });
    } catch (err) {
      next(err);
    }
  }

  login(req, res, next) {
    try {
      const result = authService.login(req.body);
      res.status(200).json({ success: true, message: 'Login realizado com sucesso', data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
