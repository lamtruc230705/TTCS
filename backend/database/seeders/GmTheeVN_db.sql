DROP DATABASE IF EXISTS gmtheevn_db;
CREATE DATABASE gmtheevn_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gmtheevn_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(150) NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) NULL,
  role ENUM('user', 'artist', 'admin') NOT NULL DEFAULT 'user',
  status ENUM('active', 'locked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,
  stage_name VARCHAR(150) NOT NULL,
  full_name VARCHAR(150) NULL,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  image VARCHAR(255) NULL,
  birth_date DATE NULL,
  height VARCHAR(50) NULL,
  weight VARCHAR(50) NULL,
  partner_name VARCHAR(150) NULL,
  partner_artist_id INT NULL,
  mascot VARCHAR(150) NULL,
  artist_role VARCHAR(100) NULL,
  description TEXT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('active', 'hidden') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_artists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_artists_partner FOREIGN KEY (partner_artist_id) REFERENCES artists(id) ON DELETE SET NULL,
  INDEX idx_artists_stage_name (stage_name),
  INDEX idx_artists_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS artist_works (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  release_year YEAR NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_artist_works_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  INDEX idx_artist_works_artist (artist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS artist_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  status ENUM('upcoming', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
  note TEXT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_artist_schedules_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  CONSTRAINT fk_artist_schedules_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_artist_schedules_artist (artist_id),
  INDEX idx_artist_schedules_date (event_date),
  INDEX idx_artist_schedules_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255) NULL,
  created_by_user_id INT NULL,
  created_by_role ENUM('admin', 'artist') NOT NULL DEFAULT 'admin',
  status ENUM('active', 'hidden', 'out_of_stock') NOT NULL DEFAULT 'active',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sold_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_products_name (name),
  INDEX idx_products_status (status),
  INDEX idx_products_created_by (created_by_user_id, created_by_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_images_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS product_artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  artist_id INT NOT NULL,
  CONSTRAINT fk_product_artists_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_artists_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  CONSTRAINT uq_product_artist UNIQUE (product_id, artist_id),
  INDEX idx_product_artists_product (product_id),
  INDEX idx_product_artists_artist (artist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  is_selected BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id),
  INDEX idx_cart_items_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  customer_name VARCHAR(150) NULL,
  customer_email VARCHAR(150) NULL,
  customer_phone VARCHAR(20) NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 25000,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'processing', 'shipping', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid') NOT NULL DEFAULT 'paid',
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  seller_user_id INT NULL,
  seller_role ENUM('admin', 'artist') NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_seller FOREIGN KEY (seller_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_seller (seller_user_id, seller_role),
  INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receiver_user_id INT NOT NULL,
  sender_user_id INT NULL,
  type ENUM('artist_profile_update', 'order_update', 'system') NOT NULL DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NULL,
  reference_id INT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_receiver FOREIGN KEY (receiver_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_notifications_receiver (receiver_user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS artist_profile_update_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  requested_by INT NOT NULL,
  old_data JSON NULL,
  new_data JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  admin_note TEXT NULL,
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_artist_profile_requests_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  CONSTRAINT fk_artist_profile_requests_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_artist_profile_requests_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_artist_profile_requests_status (status),
  INDEX idx_artist_profile_requests_artist (artist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS artist_earnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
  earning_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_artist_earnings_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  INDEX idx_artist_earnings_artist (artist_id),
  INDEX idx_artist_earnings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS site_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(150) NULL,
  website VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS uploaded_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL DEFAULT 0,
  folder ENUM('products', 'artists', 'avatars', 'general') NOT NULL DEFAULT 'general',
  url VARCHAR(255) NOT NULL,
  uploaded_by INT NULL,
  entity_type ENUM('product', 'artist', 'user', 'general') NULL,
  entity_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_uploaded_files_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_uploaded_files_folder (folder),
  INDEX idx_uploaded_files_entity (entity_type, entity_id),
  INDEX idx_uploaded_files_uploaded_by (uploaded_by)
);

-- =============================
-- Du lieu mau
-- Tai khoan test:
-- Admin : admin@gmail.com / admin123
-- Artist: joong@gmail.com / artist123
-- User  : user@gmail.com / user123
-- =============================

USE gmtheevn_db;
SET NAMES utf8mb4;
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE uploaded_files AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE artist_profile_update_requests AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE cart_items AUTO_INCREMENT = 1;
ALTER TABLE product_artists AUTO_INCREMENT = 1;
ALTER TABLE product_images AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE artist_earnings AUTO_INCREMENT = 1;
ALTER TABLE artist_schedules AUTO_INCREMENT = 1;
ALTER TABLE artist_works AUTO_INCREMENT = 1;
ALTER TABLE artists AUTO_INCREMENT = 1;
ALTER TABLE site_contacts AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Nguyen tac xu ly o trong:
-- image/avatar trong: tu tao /uploads/artists/<username>.jpg de frontend khong bi vo anh.
-- partner_artist_id trong: tu lien ket theo partner_name neu tim thay nghe si trong danh sach.
-- mascot/partner_name khong co du lieu: de NULL dung theo schema hien tai.


INSERT INTO users
(id, username, full_name, email, phone, password, avatar, role, status, created_at)
VALUES

(1, 'admin', 'Administrator', 'admin@gmail.com', '0900000000', '$2a$10$2MiEAxoFSS/rqk7jsRv2V.48JTs8D5xTtTREzeX2NnmeVwwwPmAem', NULL, 'admin', 'active', NOW()),
(2, 'user1', 'Nguyen Van A', 'user@gmail.com', '0912345678', '$2a$10$zbAp/x3yMfzbVo7SnXpABuoyPdZ98AMrBoxWcZQTL/9WlLN87Jlm6', NULL, 'user', 'active', NOW()),
(3, 'almond', 'Almond Poomsuwan Suwansatit', 'Almond@gmail.com', '0912345679', '$2a$10$sFYyXaEWHhsx3ZsIUzxqH.cLArUoqa.75M3J.Ner5RAduLnP8cOmu', '/uploads/artists/almond.jpg', 'artist', 'active', NOW()),
(4, 'aou', 'Aou Thanaboon Kiatniran', 'Aou@gmail.com', '0912345680', '$2a$10$vd0R.YWq2GGstQQDeYbTOu01tutpgMDkaU34ZMpZIQKWu0Xj4mcV2', '/uploads/artists/aou.jpg', 'artist', 'active', NOW()),
(5, 'aston', 'Aston Ratiphat Luengvoraphan', 'Aston@gmail.com', '0912345681', '$2a$10$uKrbVFa8B8MQqlxFXIp13OIQ9SU4JGV86HSgIZrk8elYEOlpUFt.O', '/uploads/artists/aston.jpg', 'artist', 'active', NOW()),
(6, 'book', 'Book Kasidet Plookphol', 'Book@gmail.com', '0912345682', '$2a$10$/ALFNI8xz5Hv04GQvMkDdeE1i0ak3Rqj/DWcA/XTetEGdHq5AQvBa', '/uploads/artists/book.jpg', 'artist', 'active', NOW()),
(7, 'boom', 'Boom tharatorn jantharaworakarn', 'Boom@gmail.com', '0912345683', '$2a$10$QlfJcxe72EAGA3SXVH/f6uRicuui666X7rFEIkxp1n42dB6sS4zve', '/uploads/artists/boom.jpg', 'artist', 'active', NOW()),
(8, 'boun', 'Boun Noppanut Guntachai', 'Boun@gmail.com', '0912345684', '$2a$10$3zEMifDb2L4L1jU2YwwcFu0hIKs1sLDg/FSz1jPYqS6lWS8CEPGPa', '/uploads/artists/boun.jpg', 'artist', 'active', NOW()),
(9, 'chokun', 'Chokun Puttipong Jitbut', 'Chokun@gmail.com', '0912345685', '$2a$10$kguqkB5TL0Dro2pZ7Tkt3eo/cNtE1iNKM1ocfzdcgKgHo6l8Fd1Ri', '/uploads/artists/chokun.jpg', 'artist', 'active', NOW()),
(10, 'dunk', 'Dunk Natachai Boonprasert', 'Dunk@gmail.com', '0912345686', '$2a$10$BkeK1gFbbChU/S890vrLF.R/dsUF6wjWXhCOVWQQDnT/rdKC7BiYy', '/uploads/artists/dunk.jpg', 'artist', 'active', NOW()),
(11, 'emi', 'Emi Thasorn Klinnium', 'Emi@gmail.com', '0912345687', '$2a$10$nCuiMj/kcE9RU9333uc8vuQY.Hy8g.WacOLggeCKnzcI3pIRatHZC', '/uploads/artists/emi.jpg', 'artist', 'active', NOW()),
(12, 'est', 'Est Sunpha Sangaworawong', 'Est@gmail.com', '0912345688', '$2a$10$EQIUcnZdA7QeWfWLlqdY3eKRUEDQD9nQ2N5pJvfI8CXcvX5ll//FG', '/uploads/artists/est.jpg', 'artist', 'active', NOW()),
(13, 'force', 'Force Jiratchapong Srisang', 'Force@gmail.com', '0912345689', '$2a$10$DlcDf.Ngggg7Idoh6n/4BeaYk..w.HZt4Opw32YBEMcRTGD9g5CqO', '/uploads/artists/force.jpg', 'artist', 'active', NOW()),
(14, 'joong', 'Joong Archen Aydin', 'Joong@gmail.com', '0912345690', '$2a$10$hJt25sfgXqCWyFqwnElFE.68OTQbDeXyMe/4Vzj25IXVeGt/5JiQq', '/uploads/artists/joong.jpg', 'artist', 'active', NOW());

ALTER TABLE users AUTO_INCREMENT = 100;


INSERT INTO artists
(id, user_id, stage_name, full_name, first_name, last_name, image, birth_date, height, weight, partner_name, partner_artist_id, mascot, artist_role, description, is_featured, status)
VALUES

(1, 3, 'Almond Poomsuwan', 'Almond Poomsuwan Suwansatit', 'Almond', 'Poomsuwan Suwansatit', '/uploads/artists/almond.jpg', '2007-10-30', '182 cm', '65 kg', NULL, NULL, NULL, 'Diễn Viên', 'Almond Poomsuwan - nghệ sĩ của GMTheeVN.', TRUE, 'active'),
(2, 4, 'Aou Thanaboon', 'Aou Thanaboon Kiatniran', 'Aou', 'Thanaboon Kiatniran', '/uploads/artists/aou.jpg', '2000-01-09', '184 cm', '63 kg', 'Boom Tharatorn', NULL, NULL, 'Diễn viên, Ca sĩ', 'Aou Thanaboon - nghệ sĩ của GMTheeVN.', TRUE, 'active'),
(3, 5, 'Aston Ratiphat', 'Aston Ratiphat Luengvoraphan', 'Aston', 'Ratiphat Luengvoraphan', '/uploads/artists/aston.jpg', '2005-11-12', '176 cm', '61 kg', 'Chokun Puttipong', NULL, NULL, 'Diễn viên, Ca sĩ', 'Aston Ratiphat - nghệ sĩ của GMTheeVN.', TRUE, 'active'),
(4, 6, 'Book Kasidet', 'Book Kasidet Plookphol', 'Book', 'Kasidet Plookphol', '/uploads/artists/book.jpg', '1996-10-25', '181 cm', '65 kg', 'Force Jiratchapong', NULL, NULL, 'Diễn viên, Ca sĩ', 'Book Kasidet - nghệ sĩ của GMTheeVN.', TRUE, 'active'),
(5, 7, 'Boom Tharatorn', 'Boom tharatorn jantharaworakarn', 'Boom', 'tharatorn jantharaworakarn', '/uploads/artists/boom.jpg', '1998-09-28', '187 cm', '68 kg', 'Aou Thanaboon', NULL, NULL, 'Diễn viên, Ca sĩ', 'Boom Tharatorn - nghệ sĩ của GMTheeVN.', TRUE, 'active'),
(6, 8, 'Boun Noppanut', 'Boun Noppanut Guntachai', 'Boun', 'Noppanut Guntachai', '/uploads/artists/boun.jpg', '1995-07-10', '185 cm', '63 kg', NULL, NULL, NULL, 'Diễn viên, Ca sĩ', 'Boun Noppanut - nghệ sĩ của GMTheeVN.', FALSE, 'active'),
(7, 9, 'Chokun Puttipong', 'Chokun Puttipong Jitbut', 'Chokun', 'Puttipong Jitbut', '/uploads/artists/chokun.jpg', '2005-10-20', '183 cm', '68 kg', 'Aston Ratiphat', NULL, NULL, 'Diễn viên, Ca sĩ', 'Chokun Puttipong - nghệ sĩ của GMTheeVN.', FALSE, 'active'),
(8, 10, 'Dunk Natachai', 'Dunk Natachai Boonprasert', 'Dunk', 'Natachai Boonprasert', '/uploads/artists/dunk.jpg', '2000-10-01', '185 cm', '69 kg', 'Joong Archen', NULL, NULL, 'Diễn viên, Ca sĩ', 'Dunk Natachai - nghệ sĩ của GMTheeVN.', TRUE, 'active'),
(9, 11, 'Emi Thasorn', 'Emi Thasorn Klinnium', 'Emi', 'Thasorn Klinnium', '/uploads/artists/emi.jpg', '1998-04-25', '165 cm', '48 kg', NULL, NULL, NULL, 'Diễn viên, Ca sĩ', 'Emi Thasorn - nghệ sĩ của GMTheeVN.', FALSE, 'active'),
(10, 12, 'Est Sunpha', 'Est Sunpha Sangaworawong', 'Est', 'Sangaworawong', '/uploads/artists/est.jpg', '2001-05-19', '180 cm', '72 kg', NULL, NULL, NULL, 'Diễn viên, Ca sĩ', 'Est Sunpha - nghệ sĩ của GMTheeVN.', FALSE, 'active'),
(11, 13, 'Force Jiratchapong', 'Force Jiratchapong Srisang', 'Force', 'Jiratchapong Srisang', '/uploads/artists/force.jpg', '1997-03-09', '185 cm', '68 kg', 'Book Kasidet', NULL, NULL, 'Diễn viên, Ca sĩ', 'Force Jiratchapong - nghệ sĩ của GMTheeVN.', TRUE, 'active'),
(12, 14, 'Joong Archen', 'Joong Archen Aydin', 'Joong', 'Archen Aydin', '/uploads/artists/joong.jpg', '2001-03-10', '186 cm', '72 kg', 'Dunk Natachai', NULL, NULL, 'Diễn viên, Ca sĩ', 'Joong Archen - nghệ sĩ của GMTheeVN.', TRUE, 'active');


UPDATE artists SET partner_artist_id = 5 WHERE id = 2;


UPDATE artists SET partner_artist_id = 7 WHERE id = 3;


UPDATE artists SET partner_artist_id = 11 WHERE id = 4;


UPDATE artists SET partner_artist_id = 2 WHERE id = 5;


UPDATE artists SET partner_artist_id = 3 WHERE id = 7;


UPDATE artists SET partner_artist_id = 12 WHERE id = 8;


UPDATE artists SET partner_artist_id = 4 WHERE id = 11;


UPDATE artists SET partner_artist_id = 8 WHERE id = 12;



ALTER TABLE artists AUTO_INCREMENT = 100;


INSERT INTO artist_works (artist_id, title, release_year) VALUES
(1, 'Hồ sơ nghệ sĩ Almond Poomsuwan', 2026),
(2, 'Hidden Agenda', 2023),
(2, 'We Are', 2024),
(3, 'Hồ sơ nghệ sĩ Aston Ratiphat', 2026),
(4, 'A Boss and a Babe', 2023),
(4, 'Only Friends', 2023),
(5, 'Hidden Agenda', 2023),
(5, 'We Are', 2024),
(6, 'Between Us', 2022),
(6, 'Until We Meet Again', 2019),
(7, 'Hồ sơ nghệ sĩ Chokun Puttipong', 2026),
(8, 'Hidden Agenda', 2023),
(8, 'Star & Sky: Star in My Mind', 2022),
(9, 'Hồ sơ nghệ sĩ Emi Thasorn', 2026),
(10, 'Hồ sơ nghệ sĩ Est Sunpha', 2026),
(11, 'A Boss and a Babe', 2023),
(11, 'Enchanté', 2022),
(12, 'Dare You To Death', 2025),
(12, 'The Heart Killers', 2024),
(12, 'Hidden Agenda', 2023),
(12, 'Star & Sky: Star in My Mind', 2022);


INSERT INTO artist_schedules (artist_id, title, event_date, start_time, end_time, status, note, created_by) VALUES
(12, 'Lịch quay nội dung Joong', '2026-05-15', '09:00:00', '17:00:00', 'upcoming', 'Lịch mẫu để test quản lý lịch trình', 1),
(8, 'Fan meeting Dunk', '2026-05-18', '18:00:00', '20:00:00', 'upcoming', 'Sự kiện công khai', 1),
(2, 'Chụp ảnh sản phẩm AouBoom', '2026-05-20', '10:00:00', '12:00:00', 'upcoming', 'Chụp ảnh merch', 1),
(5, 'Livestream Boom', '2026-05-22', '19:00:00', '20:00:00', 'upcoming', 'Livestream bán sản phẩm', 1),
(1, 'Cập nhật hồ sơ Almond', '2026-05-10', '14:00:00', '15:00:00', 'completed', 'Đã hoàn thành', 1);


INSERT INTO products
(id, name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured, sold_count)
VALUES
(1, 'Box JimmySea', 'Hộp quà tặng GMTheeVN', 150000, 25, '/uploads/products/box-jimmysea.jpg', 1, 'admin', 'active', TRUE, 2),
(2, 'Card Clover', 'Bộ card Clover', 50000, 50, '/uploads/products/card-clover.jpg', 1, 'admin', 'active', TRUE, 0),
(3, 'Túi sách GMTheeVN', 'Túi sách GMTheeVN', 120000, 30, '/uploads/products/tui-sach-gmtheevn.jpg', 1, 'admin', 'active', TRUE, 0),
(4, 'Photocard JoongDunk', 'Photocard cặp đôi Joong Archen và Dunk Natachai', 60000, 45, '/uploads/products/photocard-joongdunk.jpg', 14, 'artist', 'active', TRUE, 1),
(5, 'Poster AouBoom', 'Poster Aou Thanaboon và Boom Tharatorn', 70000, 35, '/uploads/products/poster-aouboom.jpg', 4, 'artist', 'active', TRUE, 0),
(6, 'Keychain AstonChokun', 'Móc khóa Aston Ratiphat và Chokun Puttipong', 35000, 80, '/uploads/products/keychain-astonchokun.jpg', 5, 'artist', 'active', FALSE, 0),
(7, 'Standee BookForce', 'Standee Book Kasidet và Force Jiratchapong', 90000, 28, '/uploads/products/standee-bookforce.jpg', 6, 'artist', 'active', FALSE, 0),
(8, 'Lightstick GMTheeVN', 'Lightstick dùng cho fan meeting', 180000, 40, '/uploads/products/lightstick-gmtheevn.jpg', 1, 'admin', 'active', TRUE, 0),
(9, 'Album Boun Special', 'Album ảnh đặc biệt của Boun Noppanut', 200000, 15, '/uploads/products/album-boun.jpg', 8, 'artist', 'active', FALSE, 0),
(10, 'Badge Almond', 'Huy hiệu Almond Poomsuwan', 30000, 100, '/uploads/products/badge-almond.jpg', 3, 'artist', 'active', FALSE, 0),
(11, 'Poster Emi', 'Poster Emi Thasorn', 70000, 30, '/uploads/products/poster-emi.jpg', 11, 'artist', 'active', FALSE, 0),
(12, 'Photobook Est', 'Photobook Est Sunpha', 160000, 20, '/uploads/products/photobook-est.jpg', 12, 'artist', 'active', FALSE, 0);
ALTER TABLE products AUTO_INCREMENT = 100;


INSERT INTO product_images (product_id, image_url, is_main) VALUES
(1, '/uploads/products/box-jimmysea.jpg', TRUE),
(2, '/uploads/products/card-clover.jpg', TRUE),
(3, '/uploads/products/tui-sach-gmtheevn.jpg', TRUE),
(4, '/uploads/products/photocard-joongdunk.jpg', TRUE),
(5, '/uploads/products/poster-aouboom.jpg', TRUE),
(6, '/uploads/products/keychain-astonchokun.jpg', TRUE),
(7, '/uploads/products/standee-bookforce.jpg', TRUE),
(8, '/uploads/products/lightstick-gmtheevn.jpg', TRUE),
(9, '/uploads/products/album-boun.jpg', TRUE),
(10, '/uploads/products/badge-almond.jpg', TRUE),
(11, '/uploads/products/poster-emi.jpg', TRUE),
(12, '/uploads/products/photobook-est.jpg', TRUE);


INSERT INTO product_artists (product_id, artist_id) VALUES
(1, 12),
(1, 8),
(2, 12),
(3, 2),
(3, 5),
(3, 12),
(3, 8),
(4, 12),
(4, 8),
(5, 2),
(5, 5),
(6, 3),
(6, 7),
(7, 4),
(7, 11),
(8, 1),
(8, 2),
(8, 3),
(8, 4),
(8, 5),
(8, 6),
(8, 7),
(8, 8),
(8, 9),
(8, 10),
(8, 11),
(8, 12),
(9, 6),
(10, 1),
(11, 9),
(12, 10);


INSERT INTO cart_items (user_id, product_id, quantity, is_selected) VALUES
(2, 2, 1, TRUE),
(2, 3, 1, TRUE),
(2, 4, 1, TRUE);


INSERT INTO orders
(id, order_code, user_id, customer_name, customer_email, customer_phone, subtotal, shipping_fee, total_amount, status, payment_status, note, created_at)
VALUES
(1, 'GM0001', 2, 'Nguyen Van A', 'user@gmail.com', '0912345678', 300000, 25000, 325000, 'delivered', 'paid', 'Đơn hàng mẫu sản phẩm admin', '2026-05-08 14:30:00'),
(2, 'GM0002', 2, 'Nguyen Van A', 'user@gmail.com', '0912345678', 60000, 25000, 85000, 'shipping', 'paid', 'Đơn hàng mẫu sản phẩm nghệ sĩ', '2026-05-10 10:15:00'),
(3, 'GM0003', 2, 'Nguyen Van A', 'user@gmail.com', '0912345678', 70000, 25000, 95000, 'processing', 'paid', 'Đơn hàng đang xử lý', '2026-05-12 09:00:00');
ALTER TABLE orders AUTO_INCREMENT = 100;


INSERT INTO order_items
(order_id, product_id, seller_user_id, seller_role, product_name, product_price, quantity, total_price)
VALUES
(1, 1, 1, 'admin', 'Box JimmySea', 150000, 2, 300000),
(2, 4, 14, 'artist', 'Photocard JoongDunk', 60000, 1, 60000),
(3, 5, 4, 'artist', 'Poster AouBoom', 70000, 1, 70000);


INSERT INTO artist_earnings (artist_id, description, amount, status, earning_date) VALUES
(12, 'Doanh thu từ Photocard JoongDunk', 60000, 'pending', '2026-05-10'),
(8, 'Doanh thu từ Photocard JoongDunk', 60000, 'pending', '2026-05-10'),
(2, 'Doanh thu từ Poster AouBoom', 70000, 'pending', '2026-05-12'),
(5, 'Doanh thu từ Poster AouBoom', 70000, 'pending', '2026-05-12'),
(6, 'Doanh thu từ Album Boun Special', 200000, 'pending', '2026-05-11'),
(4, 'Doanh thu từ Standee BookForce', 90000, 'paid', '2026-04-28'),
(11, 'Doanh thu từ Standee BookForce', 90000, 'paid', '2026-04-28');


INSERT INTO notifications (receiver_user_id, sender_user_id, type, title, message, reference_id, is_read) VALUES
(1, 14, 'artist_profile_update', 'Yêu cầu cập nhật hồ sơ nghệ sĩ', 'Joong Archen đã gửi yêu cầu cập nhật hồ sơ.', NULL, FALSE),
(14, 1, 'system', 'Chào mừng nghệ sĩ', 'Tài khoản nghệ sĩ của bạn đã được kích hoạt.', NULL, TRUE),
(2, 1, 'order_update', 'Đơn hàng đang vận chuyển', 'Đơn hàng GM0002 đang được vận chuyển.', 2, FALSE);


INSERT INTO site_contacts (id, address, phone, email, website) VALUES
(1, 'Ha Dong, Ha Noi', '19001900', 'GMTheeVN@gmail.com', 'www.GMTheeVN.com');


INSERT INTO uploaded_files
(original_name, stored_name, mime_type, size_bytes, folder, url, uploaded_by, entity_type, entity_id)
VALUES
('almond.jpg', 'almond.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/almond.jpg', 1, 'artist', 1),
('aou.jpg', 'aou.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/aou.jpg', 1, 'artist', 2),
('aston.jpg', 'aston.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/aston.jpg', 1, 'artist', 3),
('book.jpg', 'book.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/book.jpg', 1, 'artist', 4),
('boom.jpg', 'boom.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/boom.jpg', 1, 'artist', 5),
('boun.jpg', 'boun.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/boun.jpg', 1, 'artist', 6),
('chokun.jpg', 'chokun.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/chokun.jpg', 1, 'artist', 7),
('dunk.jpg', 'dunk.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/dunk.jpg', 1, 'artist', 8),
('emi.jpg', 'emi.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/emi.jpg', 1, 'artist', 9),
('est.jpg', 'est.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/est.jpg', 1, 'artist', 10),
('force.jpg', 'force.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/force.jpg', 1, 'artist', 11),
('joong.jpg', 'joong.jpg', 'image/jpeg', 102400, 'artists', '/uploads/artists/joong.jpg', 1, 'artist', 12),
('box-jimmysea.jpg', 'box-jimmysea.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/box-jimmysea.jpg', 1, 'product', 1),
('card-clover.jpg', 'card-clover.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/card-clover.jpg', 1, 'product', 2),
('tui-sach-gmtheevn.jpg', 'tui-sach-gmtheevn.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/tui-sach-gmtheevn.jpg', 1, 'product', 3),
('photocard-joongdunk.jpg', 'photocard-joongdunk.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/photocard-joongdunk.jpg', 14, 'product', 4),
('poster-aouboom.jpg', 'poster-aouboom.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/poster-aouboom.jpg', 4, 'product', 5),
('keychain-astonchokun.jpg', 'keychain-astonchokun.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/keychain-astonchokun.jpg', 5, 'product', 6),
('standee-bookforce.jpg', 'standee-bookforce.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/standee-bookforce.jpg', 6, 'product', 7),
('lightstick-gmtheevn.jpg', 'lightstick-gmtheevn.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/lightstick-gmtheevn.jpg', 1, 'product', 8),
('album-boun.jpg', 'album-boun.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/album-boun.jpg', 8, 'product', 9),
('badge-almond.jpg', 'badge-almond.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/badge-almond.jpg', 3, 'product', 10),
('poster-emi.jpg', 'poster-emi.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/poster-emi.jpg', 11, 'product', 11),
('photobook-est.jpg', 'photobook-est.jpg', 'image/jpeg', 102400, 'products', '/uploads/products/photobook-est.jpg', 12, 'product', 12);
