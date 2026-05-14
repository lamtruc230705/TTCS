const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtConfig.secret);
}

module.exports = {
  signToken,
  verifyToken
};
