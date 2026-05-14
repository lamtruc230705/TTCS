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
