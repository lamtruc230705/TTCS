// hash và so sánh mật khẩu

const bcrypt = require('bcryptjs');
const env = require('../configs/env');

async function hashPassword(password) {
  return bcrypt.hash(password, env.bcrypt.saltRounds);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword
};