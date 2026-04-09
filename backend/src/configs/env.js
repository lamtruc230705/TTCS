require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'thuong230705',
    database: process.env.DB_NAME || 'store_db'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  },

  paths: {
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    logDir: process.env.LOG_DIR || 'logs'
  }
};

module.exports = env;