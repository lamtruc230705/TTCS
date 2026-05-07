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

INSERT INTO users (id, username, full_name, email, phone, password, role, status) VALUES
(1, 'admin', 'Administrator', 'admin@gmail.com', '0900000000', '$2a$10$5g3n4TBTPIIifeMbIWiOeuBN4MIFkkrJiVwTsm2sfs9JZiH.nbAoG', 'admin', 'active'),
(2, 'user1', 'Nguyen Van A', 'user@gmail.com', '0912345678', '$2a$10$HuaxdenkdZj5yx8oXRFpM.gyDyGSDhHdafzHmOCeVVs6dFxstxnNe', 'user', 'active'),
(3, 'joong', 'Joong Archen', 'joong@gmail.com', '0912345679', '$2a$10$Z1XpR2SW5i0MJ1mT3blfi.35aHEC6P2p3lpuG0AuXhuLyfvNSe0uu', 'artist', 'active');

INSERT INTO site_contacts (id, address, phone, email, website) VALUES
(1, 'Ha Dong, Ha Noi', '19001900', 'GMTheeVN@gmail.com', 'www.GMTheeVN.com');

INSERT INTO artists
(id, user_id, stage_name, full_name, first_name, last_name, image, birth_date, height, weight, partner_name, partner_artist_id, mascot, artist_role, description, is_featured, status)
VALUES
(1, 3, 'Joong Archen', 'Joong Archen Aydin', 'Joong', 'Archen', '/uploads/artists/joong.jpg', '2001-03-10', '186 cm', '72 kg', 'Dunk Natachai', NULL, 'Jadee', 'Dien vien chinh', 'Dien vien/nghe si cua GMTheeVN.', TRUE, 'active'),
(2, NULL, 'Boom Tharatorn', 'Boom Tharatorn', 'Boom', 'Tharatorn', '/uploads/artists/boom.jpg', '1999-06-15', '180 cm', NULL, 'Aou Thanaboon', NULL, 'Ceri', 'Dien vien chinh', NULL, TRUE, 'active'),
(3, NULL, 'Aston Ratiphat', 'Aston Ratiphat', 'Aston', 'Ratiphat', '/uploads/artists/aston.jpg', '1998-11-22', '178 cm', NULL, 'Chokun', NULL, '-', 'Dien vien chinh', NULL, TRUE, 'active'),
(4, NULL, 'Dunk Natachai', 'Dunk Natachai', 'Dunk', 'Natachai', '/uploads/artists/dunk.jpg', '2000-08-02', '175 cm', NULL, 'Joong Archen', 1, 'Jadee', 'Dien vien chinh', NULL, FALSE, 'active'),
(5, NULL, 'Win Metawin', 'Win Metawin', 'Win', 'Metawin', '/uploads/artists/win.jpg', '1999-02-21', '183 cm', NULL, NULL, NULL, NULL, 'Dien vien chinh', NULL, FALSE, 'active'),
(6, NULL, 'Force Jiratchapong', 'Force Jiratchapong', 'Force', 'Jiratchapong', '/uploads/artists/force.jpg', '1997-03-09', '185 cm', NULL, NULL, NULL, NULL, 'Dien vien chinh', NULL, FALSE, 'active'),
(7, NULL, 'Aou Thanaboon', 'Aou Thanaboon', 'Aou', 'Thanaboon', '/uploads/artists/aou.jpg', '2000-01-09', '180 cm', NULL, 'Boom Tharatorn', 2, NULL, 'Dien vien chinh', NULL, FALSE, 'active'),
(8, NULL, 'Book Kasidet', 'Book Kasidet', 'Book', 'Kasidet', '/uploads/artists/book.jpg', '1996-10-25', '181 cm', NULL, NULL, NULL, NULL, 'Dien vien chinh', NULL, FALSE, 'active');

INSERT INTO artist_works (artist_id, title, release_year) VALUES
(1, 'Dare You To Death', 2025),
(1, 'The Heart Killers', 2024),
(1, 'Hidden Agenda', 2023),
(1, 'Our Skyy 2', 2023),
(1, 'The Warp Effect', 2023),
(1, 'Star & Sky: Star in My Mind', 2022),
(1, '2Moons2', 2019),
(2, 'Hidden Agenda', 2023),
(3, 'Project Alpha', 2022),
(4, 'Star in My Mind', 2022);

INSERT INTO artist_schedules (artist_id, title, event_date, start_time, end_time, status, note, created_by) VALUES
(1, 'Quay phim Dare You To Death', '2026-03-12', '09:00:00', '17:00:00', 'upcoming', NULL, 1),
(1, 'Tham du le trao giai', '2026-03-15', '19:00:00', '22:00:00', 'upcoming', NULL, 1),
(1, 'Phong van truyen hinh', '2026-03-18', '14:00:00', '15:30:00', 'upcoming', NULL, 1),
(1, 'Buoi chup hinh quang cao', '2026-03-05', '10:00:00', '13:00:00', 'completed', NULL, 1);

INSERT INTO products
(id, name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured, sold_count)
VALUES
(1, 'Box JimmySea', 'Hop qua tang JimmySea', 1.00, 25, '/uploads/products/box-jimmysea.jpg', 1, 'admin', 'active', TRUE, 0),
(2, 'Card Clover', 'Bo card Clover', 1.00, 50, '/uploads/products/card-clover.jpg', 1, 'admin', 'active', TRUE, 0),
(3, 'Tui sach GMTheeVN', 'Tui sach GMTheeVN', 1.00, 30, '/uploads/products/tui-sach.jpg', 1, 'admin', 'active', TRUE, 0),
(4, 'Ao Phong Domia', 'Ao thun nam cao cap', 1.00, 40, '/uploads/products/ao-phong-domia.jpg', 3, 'artist', 'active', FALSE, 0),
(5, 'Box Yours Win Metawin', 'Hop qua tang dac biet', 1.00, 15, '/uploads/products/box-yours.jpg', 3, 'artist', 'active', FALSE, 0),
(6, 'Quat SeaKeen', 'Quat cam tay tien loi', 1.00, 60, '/uploads/products/quat-seakeen.jpg', 3, 'artist', 'active', FALSE, 0),
(7, 'Pin Any', 'Pin badge trang tri', 1.00, 80, '/uploads/products/pin-any.jpg', 3, 'artist', 'active', FALSE, 0),
(8, 'Moc khoa Permpoon', 'Moc khoa Permpoon', 1.00, 100, '/uploads/products/moc-khoa-permpoon.jpg', 3, 'artist', 'active', FALSE, 0);

INSERT INTO product_artists (product_id, artist_id) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 5),
(6, 1),
(7, 1),
(8, 1);

INSERT INTO artist_earnings (artist_id, description, amount, status, earning_date) VALUES
(1, 'Doanh thu tu ban qua tang', 50000.00, 'pending', '2026-03-11'),
(1, 'Tien quang cao san pham', 75000.00, 'pending', '2026-03-10'),
(1, 'Doanh thu tu phim The Heart Killers', 300000.00, 'paid', '2026-02-28'),
(1, 'Tien quang cao brand', 450000.00, 'paid', '2026-02-28'),
(1, 'Doanh thu tu phim Hidden Agenda', 200000.00, 'paid', '2026-01-25');

-- Don hang mau de test doanh thu va quan ly don hang
INSERT INTO orders
(id, order_code, user_id, customer_name, customer_email, customer_phone, subtotal, shipping_fee, total_amount, status, payment_status, note, created_at)
VALUES
(1, 'GM0001', 2, 'Nguyen Van A', 'user@gmail.com', '0912345678', 2.00, 25000.00, 25002.00, 'delivered', 'paid', 'Don hang mau san pham admin', '2026-03-08 14:30:00'),
(2, 'GM0002', 2, 'Nguyen Van A', 'user@gmail.com', '0912345678', 2.00, 25000.00, 25002.00, 'shipping', 'paid', 'Don hang mau san pham artist', '2026-03-06 10:15:00');

INSERT INTO order_items
(order_id, product_id, seller_user_id, seller_role, product_name, product_price, quantity, total_price)
VALUES
(1, 1, 1, 'admin', 'Box JimmySea', 1.00, 2, 2.00),
(2, 4, 3, 'artist', 'Ao Phong Domia', 1.00, 2, 2.00);