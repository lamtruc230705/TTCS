CREATE DATABASE IF NOT EXISTS store_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE store_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS ShippingAddresses;
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS CartItems;
DROP TABLE IF EXISTS Carts;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS ProductCategories;
DROP TABLE IF EXISTS ArtistSocialLinks;
DROP TABLE IF EXISTS Artists;
DROP TABLE IF EXISTS Users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- 1. Users
-- =========================================
CREATE TABLE Users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'artist', 'admin') NOT NULL DEFAULT 'user',
    profileImage VARCHAR(500) NULL,
    isActive TINYINT(1) NOT NULL DEFAULT 1,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_phone UNIQUE (phone)
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_users_active ON Users(isActive);

-- =========================================
-- 2. Artists
-- =========================================
CREATE TABLE Artists (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    bio TEXT NULL,
    works TEXT NULL,
    image VARCHAR(500) NULL,
    followers INT UNSIGNED NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    isVerified TINYINT(1) NOT NULL DEFAULT 0,
    userId BIGINT UNSIGNED NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_artists PRIMARY KEY (id),
    CONSTRAINT uq_artists_userId UNIQUE (userId),
    CONSTRAINT chk_artists_followers CHECK (followers >= 0),
    CONSTRAINT chk_artists_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT fk_artists_user
        FOREIGN KEY (userId) REFERENCES Users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_artists_name ON Artists(name);
CREATE INDEX idx_artists_verified ON Artists(isVerified);

-- =========================================
-- 3. ArtistSocialLinks
-- =========================================
CREATE TABLE ArtistSocialLinks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    artistId BIGINT UNSIGNED NOT NULL,
    facebook VARCHAR(255) NULL,
    instagram VARCHAR(255) NULL,
    twitter VARCHAR(255) NULL,

    CONSTRAINT pk_artist_social_links PRIMARY KEY (id),
    CONSTRAINT uq_artist_social_links_artistId UNIQUE (artistId),
    CONSTRAINT fk_artist_social_links_artist
        FOREIGN KEY (artistId) REFERENCES Artists(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- 4. ProductCategories
-- =========================================
CREATE TABLE ProductCategories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    image VARCHAR(500) NULL,

    CONSTRAINT pk_product_categories PRIMARY KEY (id),
    CONSTRAINT uq_product_categories_name UNIQUE (name)
) ENGINE=InnoDB;

-- =========================================
-- 5. Products
-- =========================================
CREATE TABLE Products (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    category ENUM('album', 'poster', 'merchandise', 'book', 'other') NOT NULL DEFAULT 'other',
    image VARCHAR(500) NULL,
    stock INT NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    artistId BIGINT UNSIGNED NOT NULL,
    categoryId BIGINT UNSIGNED NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_products PRIMARY KEY (id),
    CONSTRAINT chk_products_price CHECK (price >= 0),
    CONSTRAINT chk_products_stock CHECK (stock >= 0),
    CONSTRAINT chk_products_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT fk_products_artist
        FOREIGN KEY (artistId) REFERENCES Artists(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_products_category_id
        FOREIGN KEY (categoryId) REFERENCES ProductCategories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_products_artistId ON Products(artistId);
CREATE INDEX idx_products_category ON Products(category);
CREATE INDEX idx_products_categoryId ON Products(categoryId);
CREATE INDEX idx_products_name ON Products(name);
CREATE INDEX idx_products_price ON Products(price);
CREATE INDEX idx_products_createdAt ON Products(createdAt);

-- =========================================
-- 6. Carts
-- =========================================
CREATE TABLE Carts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    userId BIGINT UNSIGNED NOT NULL,
    totalAmount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'completed', 'abandoned') NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_carts PRIMARY KEY (id),
    CONSTRAINT fk_carts_user
        FOREIGN KEY (userId) REFERENCES Users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_carts_userId ON Carts(userId);
CREATE INDEX idx_carts_status ON Carts(status);

-- =========================================
-- 7. CartItems
-- =========================================
CREATE TABLE CartItems (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    cartId BIGINT UNSIGNED NOT NULL,
    productId BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT pk_cart_items PRIMARY KEY (id),
    CONSTRAINT uq_cart_items_cart_product UNIQUE (cartId, productId),
    CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_cart_items_price CHECK (price >= 0),
    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cartId) REFERENCES Carts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (productId) REFERENCES Products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_cart_items_cartId ON CartItems(cartId);
CREATE INDEX idx_cart_items_productId ON CartItems(productId);

-- =========================================
-- 8. Orders
-- =========================================
CREATE TABLE Orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    orderNumber VARCHAR(50) NOT NULL,
    userId BIGINT UNSIGNED NOT NULL,
    totalAmount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    shippingFee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    paymentMethod ENUM('cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay', 'paypal') NOT NULL DEFAULT 'cod',
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    orderStatus ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    notes TEXT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_orders PRIMARY KEY (id),
    CONSTRAINT uq_orders_orderNumber UNIQUE (orderNumber),
    CONSTRAINT chk_orders_totalAmount CHECK (totalAmount >= 0),
    CONSTRAINT chk_orders_shippingFee CHECK (shippingFee >= 0),
    CONSTRAINT chk_orders_discount CHECK (discount >= 0),
    CONSTRAINT fk_orders_user
        FOREIGN KEY (userId) REFERENCES Users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_orders_userId ON Orders(userId);
CREATE INDEX idx_orders_status ON Orders(orderStatus);
CREATE INDEX idx_orders_paymentStatus ON Orders(paymentStatus);
CREATE INDEX idx_orders_createdAt ON Orders(createdAt);

-- =========================================
-- 9. OrderItems
-- =========================================
CREATE TABLE OrderItems (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    orderId BIGINT UNSIGNED NOT NULL,
    productId BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT pk_order_items PRIMARY KEY (id),
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_price CHECK (price >= 0),
    CONSTRAINT chk_order_items_subtotal CHECK (subtotal >= 0),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (orderId) REFERENCES Orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (productId) REFERENCES Products(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_orderId ON OrderItems(orderId);
CREATE INDEX idx_order_items_productId ON OrderItems(productId);

-- =========================================
-- 10. ShippingAddresses
-- =========================================
CREATE TABLE ShippingAddresses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    orderId BIGINT UNSIGNED NOT NULL,
    fullName VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,

    CONSTRAINT pk_shipping_addresses PRIMARY KEY (id),
    CONSTRAINT uq_shipping_addresses_orderId UNIQUE (orderId),
    CONSTRAINT fk_shipping_addresses_order
        FOREIGN KEY (orderId) REFERENCES Orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- 11. Reviews
-- =========================================
CREATE TABLE Reviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    userId BIGINT UNSIGNED NOT NULL,
    productId BIGINT UNSIGNED NOT NULL,
    rating INT NOT NULL,
    comment TEXT NULL,
    isVerified TINYINT(1) NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_reviews PRIMARY KEY (id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (userId) REFERENCES Users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_product
        FOREIGN KEY (productId) REFERENCES Products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_reviews_userId ON Reviews(userId);
CREATE INDEX idx_reviews_productId ON Reviews(productId);
CREATE INDEX idx_reviews_createdAt ON Reviews(createdAt);

-- =========================================
-- 12. Payments
-- =========================================
CREATE TABLE Payments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    orderId BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    method ENUM('cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay', 'paypal') NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    transactionId VARCHAR(150) NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT uq_payments_orderId UNIQUE (orderId),
    CONSTRAINT uq_payments_transactionId UNIQUE (transactionId),
    CONSTRAINT chk_payments_amount CHECK (amount >= 0),
    CONSTRAINT fk_payments_order
        FOREIGN KEY (orderId) REFERENCES Orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_payments_status ON Payments(status);
CREATE INDEX idx_payments_method ON Payments(method);

-- =========================================
-- 13. AuditLogs
-- =========================================
CREATE TABLE AuditLogs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    userId BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NULL,
    ipAddress VARCHAR(50) NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_audit_logs PRIMARY KEY (id),
    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (userId) REFERENCES Users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_audit_logs_userId ON AuditLogs(userId);
CREATE INDEX idx_audit_logs_action ON AuditLogs(action);
CREATE INDEX idx_audit_logs_createdAt ON AuditLogs(createdAt);

USE store_db;

INSERT INTO Users (username, email, phone, password, role, profileImage, isActive)
VALUES
('admin01', 'admin@example.com', '0900000001', '$2b$10$hashed_admin_password', 'admin', NULL, 1),
('user01', 'user01@example.com', '0900000002', '$2b$10$hashed_user_password', 'user', NULL, 1),
('artist01', 'artist01@example.com', '0900000003', '$2b$10$hashed_artist_password', 'artist', NULL, 1);

INSERT INTO Artists (name, bio, works, image, followers, rating, isVerified, userId)
VALUES
('Artist One', 'Tiểu sử nghệ sĩ', 'Movie A, Movie B', 'https://example.com/artist1.jpg', 1200, 4.80, 1, 3);

INSERT INTO ArtistSocialLinks (artistId, facebook, instagram, twitter)
VALUES
(1, 'https://facebook.com/artist1', 'https://instagram.com/artist1', 'https://twitter.com/artist1');

INSERT INTO ProductCategories (name, description, image)
VALUES
('Album', 'Các sản phẩm album', 'https://example.com/category-album.jpg'),
('Poster', 'Các sản phẩm poster', 'https://example.com/category-poster.jpg'),
('Merchandise', 'Các sản phẩm merchandise', 'https://example.com/category-merch.jpg'),
('Book', 'Sách và ấn phẩm', 'https://example.com/category-book.jpg'),
('Other', 'Danh mục khác', 'https://example.com/category-other.jpg');

INSERT INTO Products (name, description, price, category, image, stock, rating, artistId, categoryId)
VALUES
('Album Limited', 'Phiên bản giới hạn', 499000, 'album', 'https://example.com/product1.jpg', 20, 4.70, 1, 1),
('Poster Signed', 'Poster có chữ ký', 199000, 'poster', 'https://example.com/product2.jpg', 50, 4.50, 1, 2);

INSERT INTO Carts (userId, totalAmount, status)
VALUES
(2, 0, 'active');

USE store_db;

DROP TRIGGER IF EXISTS trg_cart_items_after_insert;
DROP TRIGGER IF EXISTS trg_cart_items_after_update;
DROP TRIGGER IF EXISTS trg_cart_items_after_delete;

DELIMITER $$

CREATE TRIGGER trg_cart_items_after_insert
AFTER INSERT ON CartItems
FOR EACH ROW
BEGIN
    UPDATE Carts
    SET totalAmount = (
        SELECT IFNULL(SUM(quantity * price), 0)
        FROM CartItems
        WHERE cartId = NEW.cartId
    )
    WHERE id = NEW.cartId;
END$$

CREATE TRIGGER trg_cart_items_after_update
AFTER UPDATE ON CartItems
FOR EACH ROW
BEGIN
    UPDATE Carts
    SET totalAmount = (
        SELECT IFNULL(SUM(quantity * price), 0)
        FROM CartItems
        WHERE cartId = NEW.cartId
    )
    WHERE id = NEW.cartId;
END$$

CREATE TRIGGER trg_cart_items_after_delete
AFTER DELETE ON CartItems
FOR EACH ROW
BEGIN
    UPDATE Carts
    SET totalAmount = (
        SELECT IFNULL(SUM(quantity * price), 0)
        FROM CartItems
        WHERE cartId = OLD.cartId
    )
    WHERE id = OLD.cartId;
END$$

DELIMITER ;

USE store_db;

DROP TRIGGER IF EXISTS trg_order_items_before_insert;
DROP TRIGGER IF EXISTS trg_order_items_before_update;

DELIMITER $$

CREATE TRIGGER trg_order_items_before_insert
BEFORE INSERT ON OrderItems
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.quantity * NEW.price;
END$$

CREATE TRIGGER trg_order_items_before_update
BEFORE UPDATE ON OrderItems
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.quantity * NEW.price;
END$$

DELIMITER ;