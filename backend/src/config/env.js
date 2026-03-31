const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const env = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  DB_PATH: process.env.DB_PATH || './database.sqlite',
};

module.exports = env;
