const express = require('express');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const uploadController = require('../controllers/upload.controller');
const {
  uploadGeneral,
  uploadProduct,
  uploadArtist,
  uploadAvatar
} = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/', auth, authorize('admin'), uploadController.getUploadedFiles);

// Upload anh chung. Form-data field name: image
router.post('/image', auth, uploadGeneral.single('image'), uploadController.uploadImage);

// Upload anh dai dien cua tai khoan dang dang nhap. Form-data field name: image
router.post('/avatar', auth, uploadAvatar.single('image'), uploadController.uploadAvatar);

// Upload anh san pham va tu dong cap nhat products.image neu is_main=true. Form-data field name: image
router.post('/products/:productId/image', auth, authorize('admin', 'artist'), uploadProduct.single('image'), uploadController.uploadProductImage);

// Upload anh chinh thuc cua nghe si. Chi admin duoc cap nhat truc tiep. Form-data field name: image
router.post('/artists/:artistId/image', auth, authorize('admin'), uploadArtist.single('image'), uploadController.uploadArtistImage);

module.exports = router;
