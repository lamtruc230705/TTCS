const { query, execute, transaction } = require('../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildFileUrl(folder, filename) {
  return `/uploads/${folder}/${filename}`;
}

function normalizeFolder(folder) {
  const allowed = ['products', 'artists', 'avatars', 'general'];
  return allowed.includes(folder) ? folder : 'general';
}

async function saveUploadedFile(file, user, options = {}, connection = null) {
  if (!file) {
    throw createHttpError('Vui long chon anh can upload.', 400);
  }

  const folder = normalizeFolder(options.folder);
  const url = buildFileUrl(folder, file.filename);
  const params = [
    file.originalname,
    file.filename,
    file.mimetype,
    file.size || 0,
    folder,
    url,
    user ? user.id : null,
    options.entity_type || 'general',
    options.entity_id || null
  ];

  const sql = `
    INSERT INTO uploaded_files
      (original_name, stored_name, mime_type, size_bytes, folder, url, uploaded_by, entity_type, entity_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = connection
    ? await connection.execute(sql, params)
    : await execute(sql, params);

  const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;

  return {
    id: insertId,
    original_name: file.originalname,
    stored_name: file.filename,
    mime_type: file.mimetype,
    size_bytes: file.size || 0,
    folder,
    url,
    entity_type: options.entity_type || 'general',
    entity_id: options.entity_id || null
  };
}

async function uploadGeneralImage(file, user, body = {}) {
  return saveUploadedFile(file, user, {
    folder: normalizeFolder(body.folder || 'general'),
    entity_type: body.entity_type || 'general',
    entity_id: body.entity_id || null
  });
}

async function uploadProductImage(productId, file, user, isMain = true) {
  const products = await query('SELECT id, image, created_by_user_id, created_by_role FROM products WHERE id = ? LIMIT 1', [productId]);

  if (!products.length) {
    throw createHttpError('Khong tim thay san pham.', 404);
  }

  const product = products[0];
  const isOwner = product.created_by_user_id && Number(product.created_by_user_id) === Number(user.id);

  if (user.role !== 'admin' && !isOwner) {
    throw createHttpError('Ban khong co quyen upload anh cho san pham nay.', 403);
  }

  return transaction(async (connection) => {
    const savedFile = await saveUploadedFile(file, user, {
      folder: 'products',
      entity_type: 'product',
      entity_id: productId
    }, connection);

    if (isMain) {
      await connection.execute('UPDATE product_images SET is_main = 0 WHERE product_id = ?', [productId]);
    }

    await connection.execute(
      'INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)',
      [productId, savedFile.url, isMain ? 1 : 0]
    );

    if (isMain || !product.image) {
      await connection.execute('UPDATE products SET image = ? WHERE id = ?', [savedFile.url, productId]);
    }

    return savedFile;
  });
}

async function uploadArtistImage(artistId, file, user) {
  if (user.role !== 'admin') {
    throw createHttpError('Chi admin moi duoc cap nhat anh chinh thuc cua nghe si.', 403);
  }

  const artists = await query('SELECT id FROM artists WHERE id = ? LIMIT 1', [artistId]);

  if (!artists.length) {
    throw createHttpError('Khong tim thay nghe si.', 404);
  }

  return transaction(async (connection) => {
    const savedFile = await saveUploadedFile(file, user, {
      folder: 'artists',
      entity_type: 'artist',
      entity_id: artistId
    }, connection);

    await connection.execute('UPDATE artists SET image = ? WHERE id = ?', [savedFile.url, artistId]);

    return savedFile;
  });
}

async function uploadAvatar(file, user) {
  return transaction(async (connection) => {
    const savedFile = await saveUploadedFile(file, user, {
      folder: 'avatars',
      entity_type: 'user',
      entity_id: user.id
    }, connection);

    await connection.execute('UPDATE users SET avatar = ? WHERE id = ?', [savedFile.url, user.id]);

    return savedFile;
  });
}

async function getUploadedFiles(params = {}) {
  const folder = params.folder || null;
  const entityType = params.entity_type || null;
  const entityId = params.entity_id || null;

  return query(`
    SELECT uf.*, u.username AS uploaded_by_username, u.full_name AS uploaded_by_name
    FROM uploaded_files uf
    LEFT JOIN users u ON u.id = uf.uploaded_by
    WHERE (? IS NULL OR uf.folder = ?)
      AND (? IS NULL OR uf.entity_type = ?)
      AND (? IS NULL OR uf.entity_id = ?)
    ORDER BY uf.created_at DESC
  `, [folder, folder, entityType, entityType, entityId, entityId]);
}

module.exports = {
  uploadGeneralImage,
  uploadProductImage,
  uploadArtistImage,
  uploadAvatar,
  getUploadedFiles
};
