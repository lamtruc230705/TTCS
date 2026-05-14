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
