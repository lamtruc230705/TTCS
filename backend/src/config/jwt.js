module.exports = {
  secret: process.env.JWT_SECRET || 'gmtheevn_secret_key_change_me',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
