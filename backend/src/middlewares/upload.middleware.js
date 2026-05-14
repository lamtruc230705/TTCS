const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadConfig = require('../config/upload');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function safeFileName(originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  const random = Math.round(Math.random() * 1e9);
  return `${Date.now()}-${random}${ext}`;
}

function createUploader(folder) {
  ensureDir(folder);

  const storage = multer.diskStorage({
    destination: function destination(req, file, cb) {
      cb(null, folder);
    },
    filename: function filename(req, file, cb) {
      cb(null, safeFileName(file.originalname));
    }
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function fileFilter(req, file, cb) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Chi cho phep upload anh JPG, PNG, WEBP hoac GIF.'));
      }
      cb(null, true);
    }
  });
}

module.exports = {
  uploadArtist: createUploader(uploadConfig.artistDir),
  uploadProduct: createUploader(uploadConfig.productDir),
  uploadAvatar: createUploader(uploadConfig.avatarDir),
  uploadGeneral: createUploader(uploadConfig.generalDir)
};
