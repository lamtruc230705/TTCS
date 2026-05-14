const path = require('path');

const uploadPath = process.env.UPLOAD_PATH || 'src/uploads';

module.exports = {
  uploadPath,
  artistDir: path.join(uploadPath, 'artists'),
  productDir: path.join(uploadPath, 'products'),
  avatarDir: path.join(uploadPath, 'avatars'),
  generalDir: path.join(uploadPath, 'general')
};
