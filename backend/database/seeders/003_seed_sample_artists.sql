INSERT INTO artists (user_id, stage_name, full_name, first_name, last_name, image, birth_date, height, weight, partner_name, mascot, artist_role, is_featured, status)
SELECT id, 'Joong Archen', 'Joong Archen Aydin', 'Joong', 'Archen', '/uploads/artists/joong.jpg', '2001-03-10', '186 cm', '72 kg', 'Dunk Natachai', 'Jadee', 'Dien vien chinh', TRUE, 'active'
FROM users WHERE email = 'joong@gmail.com'
ON DUPLICATE KEY UPDATE stage_name = stage_name;

INSERT INTO artists (stage_name, full_name, image, birth_date, height, weight, partner_name, mascot, artist_role, is_featured, status)
VALUES
('Boom Tharatorn', 'Boom Tharatorn', '/uploads/artists/boom.jpg', '1999-06-15', '180 cm', NULL, 'Aou Thanaboon', 'Ceri', 'Dien vien chinh', TRUE, 'active'),
('Aston Ratiphat', 'Aston Ratiphat', '/uploads/artists/aston.jpg', '1998-11-22', '178 cm', NULL, 'chokun', '-', 'Dien vien chinh', TRUE, 'active'),
('Dunk Natachai', 'Dunk Natachai', '/uploads/artists/dunk.jpg', '2000-08-02', '175 cm', NULL, 'Joong Archen', 'Jadee', 'Dien vien chinh', FALSE, 'active')
ON DUPLICATE KEY UPDATE stage_name = stage_name;

INSERT INTO artist_works (artist_id, title, release_year)
SELECT id, 'Dare You To Death', 2025 FROM artists WHERE stage_name = 'Joong Archen';
INSERT INTO artist_works (artist_id, title, release_year)
SELECT id, 'The Heart Killers', 2024 FROM artists WHERE stage_name = 'Joong Archen';
INSERT INTO artist_works (artist_id, title, release_year)
SELECT id, 'Hidden Agenda', 2023 FROM artists WHERE stage_name = 'Joong Archen';
INSERT INTO artist_works (artist_id, title, release_year)
SELECT id, 'Our Skyy 2', 2023 FROM artists WHERE stage_name = 'Joong Archen';
INSERT INTO artist_works (artist_id, title, release_year)
SELECT id, 'The Warp Effect', 2023 FROM artists WHERE stage_name = 'Joong Archen';
