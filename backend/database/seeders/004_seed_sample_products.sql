INSERT INTO products (name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured)
SELECT 'Box JimmySea', 'Hop qua tang JimmySea', 1, 25, '/uploads/products/box-jimmysea.jpg', id, 'admin', 'active', TRUE FROM users WHERE role = 'admin' LIMIT 1;

INSERT INTO products (name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured)
SELECT 'Card Clover', 'Bo card Clover', 1, 50, '/uploads/products/card-clover.jpg', id, 'admin', 'active', TRUE FROM users WHERE role = 'admin' LIMIT 1;

INSERT INTO products (name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured)
SELECT 'Tui sach GMTheeVN', 'Tui sach GMTheeVN', 1, 30, '/uploads/products/tui-sach.jpg', id, 'admin', 'active', TRUE FROM users WHERE role = 'admin' LIMIT 1;

INSERT INTO products (name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured)
SELECT 'Ao Phong Domia', 'Ao thun nam cao cap', 1, 40, '/uploads/products/ao-phong-domia.jpg', id, 'artist', 'active', FALSE FROM users WHERE email = 'joong@gmail.com';

INSERT INTO products (name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured)
SELECT 'Box Yours Win Metawin', 'Hop qua tang dac biet', 1, 15, '/uploads/products/box-yours.jpg', id, 'artist', 'active', FALSE FROM users WHERE email = 'joong@gmail.com';

INSERT INTO product_artists (product_id, artist_id)
SELECT p.id, a.id FROM products p JOIN artists a ON a.stage_name = 'Joong Archen' WHERE p.created_by_role = 'artist';
