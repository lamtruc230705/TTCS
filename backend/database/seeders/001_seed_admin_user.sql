INSERT INTO users (username, full_name, email, phone, password, role, status)
VALUES
('__ADMIN_USERNAME__', 'Administrator', '__ADMIN_EMAIL__', '__ADMIN_PHONE__', '__ADMIN_PASSWORD_HASH__', 'admin', 'active'),
('user1', 'Nguyen Van A', 'user@gmail.com', '0912345678', '__USER_PASSWORD_HASH__', 'user', 'active'),
('joong', 'Joong Archen', 'joong@gmail.com', '0912345679', '__ARTIST_PASSWORD_HASH__', 'artist', 'active')
ON DUPLICATE KEY UPDATE username = username;
