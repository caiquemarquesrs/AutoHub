const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/user.repository');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

const SALT_ROUNDS = 10;

class AuthService {
  register({ name, email, password, phone, cpf_cnpj }) {
    const existing = userRepository.findByEmail(email);
    if (existing) {
      throw new ValidationError('Este e-mail já está cadastrado');
    }

    const password_hash = bcrypt.hashSync(password, SALT_ROUNDS);
    return userRepository.create({ name, email, password_hash, phone, cpf_cnpj });
  }

  login({ email, password }) {
    const user = userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRATION }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}

module.exports = new AuthService();
