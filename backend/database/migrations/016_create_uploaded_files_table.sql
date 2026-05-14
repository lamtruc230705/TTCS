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
