-- Seed dynamic data for artist/admin pages: schedules, earnings, orders and order items

-- Reset sample dependent rows (safe for demo/dev environments)
DELETE oi FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.order_code LIKE 'GMO%';

DELETE FROM orders WHERE order_code LIKE 'GMO%';

DELETE ae FROM artist_earnings ae
JOIN artists a ON a.id = ae.artist_id
WHERE a.stage_name IN ('Joong Archen', 'Boom Tharatorn', 'Aston Ratiphat', 'Dunk Natachai');

DELETE s FROM artist_schedules s
JOIN artists a ON a.id = s.artist_id
WHERE a.stage_name IN ('Joong Archen', 'Boom Tharatorn', 'Aston Ratiphat', 'Dunk Natachai');

-- Artist schedules
INSERT INTO artist_schedules (artist_id, title, event_date, start_time, end_time, status, note, created_by)
SELECT a.id, 'Quay phim "Dare You To Death"', '2026-03-12', '09:00:00', '17:00:00', 'upcoming', 'Lich quay chinh', u.id
FROM artists a
LEFT JOIN users u ON u.email = 'joong@gmail.com'
WHERE a.stage_name = 'Joong Archen';

INSERT INTO artist_schedules (artist_id, title, event_date, start_time, end_time, status, note, created_by)
SELECT a.id, 'Tham du le trao giai', '2026-03-15', '19:00:00', '22:00:00', 'upcoming', 'Su kien cong khai', u.id
FROM artists a
LEFT JOIN users u ON u.email = 'joong@gmail.com'
WHERE a.stage_name = 'Joong Archen';

INSERT INTO artist_schedules (artist_id, title, event_date, start_time, end_time, status, note, created_by)
SELECT a.id, 'Buoi chup hinh quang cao', '2026-03-05', '10:00:00', '13:00:00', 'completed', 'Da hoan thanh', u.id
FROM artists a
LEFT JOIN users u ON u.email = 'joong@gmail.com'
WHERE a.stage_name = 'Joong Archen';

-- Artist earnings
INSERT INTO artist_earnings (artist_id, description, amount, status, earning_date)
SELECT a.id, 'Doanh thu tu ban qua tang', 50000, 'pending', '2026-03-11'
FROM artists a WHERE a.stage_name = 'Joong Archen';

INSERT INTO artist_earnings (artist_id, description, amount, status, earning_date)
SELECT a.id, 'Tien quang cao san pham', 75000, 'pending', '2026-03-10'
FROM artists a WHERE a.stage_name = 'Joong Archen';

INSERT INTO artist_earnings (artist_id, description, amount, status, earning_date)
SELECT a.id, 'Doanh thu tu phim The Heart Killers', 300000, 'paid', '2026-02-28'
FROM artists a WHERE a.stage_name = 'Joong Archen';

INSERT INTO artist_earnings (artist_id, description, amount, status, earning_date)
SELECT a.id, 'Tien quang cao brand', 450000, 'paid', '2026-02-28'
FROM artists a WHERE a.stage_name = 'Joong Archen';

-- Sample orders for admin and artist order pages
INSERT INTO orders (order_code, user_id, customer_name, customer_email, customer_phone, subtotal, shipping_fee, total_amount, status, payment_status, note)
SELECT 'GMO001', u.id, 'Nguyen Van A', 'a@example.com', '0900000001', 100000, 25000, 125000, 'delivered', 'paid', 'Don hang mau 1'
FROM users u WHERE u.role = 'user' LIMIT 1;

INSERT INTO orders (order_code, user_id, customer_name, customer_email, customer_phone, subtotal, shipping_fee, total_amount, status, payment_status, note)
SELECT 'GMO002', u.id, 'Tran Thi B', 'b@example.com', '0900000002', 150000, 25000, 175000, 'processing', 'paid', 'Don hang mau 2'
FROM users u WHERE u.role = 'user' LIMIT 1;

INSERT INTO order_items (order_id, product_id, seller_user_id, seller_role, product_name, product_price, quantity, total_price)
SELECT o.id, p.id, p.created_by_user_id, p.created_by_role, p.name, p.price, 2, p.price * 2
FROM orders o
JOIN products p ON p.name = 'Box JimmySea'
WHERE o.order_code = 'GMO001'
LIMIT 1;

INSERT INTO order_items (order_id, product_id, seller_user_id, seller_role, product_name, product_price, quantity, total_price)
SELECT o.id, p.id, p.created_by_user_id, p.created_by_role, p.name, p.price, 1, p.price
FROM orders o
JOIN products p ON p.name = 'Ao Phong Domia'
WHERE o.order_code = 'GMO002'
LIMIT 1;
