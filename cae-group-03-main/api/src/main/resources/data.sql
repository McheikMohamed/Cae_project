-- Vider les tables existantes avec cascade pour éviter les conflits
TRUNCATE TABLE batches CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE product_types CASCADE;
TRUNCATE TABLE units CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE addresses CASCADE;
TRUNCATE TABLE countries CASCADE;
TRUNCATE TABLE notifications CASCADE;

-- Insérer les pays
INSERT INTO countries(name)
VALUES ('Belgique');

-- Insérer les adresses
INSERT INTO addresses(street, number, box, postal_code, country_id_country, city)
VALUES
    ('Rue de la Loi', '1', 'A', 1000, (SELECT id_country FROM countries WHERE name = 'Belgique'), 'Bruxelles'),
    ('Rue des baies', '15', NULL, 6730, (SELECT id_country FROM countries WHERE name = 'Belgique'), 'Nivelles');

-- Insérer les utilisateurs
INSERT INTO users(email, honorific, first_name, last_name, phone_number, password, register_date, role, company, address_id_address)
VALUES
    ('benevol@gmail.com', 'Mr', 'Benevole', 'Benevole', '0478123456', '$2a$10$RhuqWnpmyCGhub5l5LkDROKyFPTmEs8aYQJk0APqi.AlQ77NJROAS', NOW(), 'VOLUNTEER', 'Vinci', (SELECT id_address FROM addresses WHERE street = 'Rue de la Loi' AND number = '1')),
    ('a', 'Mr', 'Programmeur', 'Programmeur', '0478123456', '$2a$10$DjYR4XZWSRPsrKbtt7FIaucQjyF4/m.B.2faSitux9q6AXiCewKAe', NOW(), 'DEVELOPER', 'Vinci', (SELECT id_address FROM addresses WHERE street = 'Rue de la Loi' AND number = '1')),
    ('p', 'Mr', 'Producteur', 'Producteur', '0478123456', '$2a$10$g/jwItAOR0a5jYI9izZpMOJ9vJfB1vm3DKCjbdax/J89Ev6YfZQGy', NOW(), 'PRODUCER', 'Vinci', (SELECT id_address FROM addresses WHERE street = 'Rue de la Loi' AND number = '1')),
    ('g', 'Mr', 'Gestionnaire', 'Gestionnaire', '0478123456', '$2a$10$7kcbYv4d8bRWGBm.4kherOAlFVAoEZa//m3bXfEOd7rf0pO7jpEkW', NOW(), 'MANAGER', 'Vinci', (SELECT id_address FROM addresses WHERE street = 'Rue de la Loi' AND number = '1')),
    ('c', 'Mr', 'Client', 'Client', '0478123456', '$2a$10$x/6K.g8MJiT/jTSIzqPQY.s2DPOQCgF1m3aZe.yyhPzC92j8FeHV2', NOW(), 'CLIENT', 'Vinci', (SELECT id_address FROM addresses WHERE street = 'Rue de la Loi' AND number = '1')),
    ('suzanne.droity@gmail.com', 'Mme', 'Suzanne', 'Droity', '0478123456', '$2a$10$RhuqWnpmyCGhub5l5LkDROKyFPTmEs8aYQJk0APqi.AlQ77NJROAS', NOW(), 'CLIENT', 'Vinci', (SELECT id_address FROM addresses WHERE street = 'Rue de la Loi' AND number = '1')),
    ('manu.dubois@gmail.com', 'Mr', 'Manu', 'Dubois', '0478123456', '$2a$10$RhuqWnpmyCGhub5l5LkDROKyFPTmEs8aYQJk0APqi.AlQ77NJROAS', NOW(), 'MANAGER', 'Vinci', (SELECT id_address FROM addresses WHERE street = 'Rue de la Loi' AND number = '1')),
    ('roger.maerckx@gmail.com', 'Mr', 'Roger', 'Maerckx', '0478123456', '$2a$10$RhuqWnpmyCGhub5l5LkDROKyFPTmEs8aYQJk0APqi.AlQ77NJROAS', NOW(), 'PRODUCER', 'Vinci', (SELECT id_address FROM addresses WHERE street = 'Rue de la Loi' AND number = '1')),
    ('marie.dubois89@valmont.be', 'Mr', 'Amir', 'Laugesen', '324745682', '$2a$10$RhuqWnpmyCGhub5l5LkDROKyFPTmEs8aYQJk0APqi.AlQ77NJROAS', NOW(), 'USER', NULL, (SELECT id_address FROM addresses WHERE street = 'Rue des baies' AND number = '15'));

-- Insérer les types de produits
INSERT INTO product_types(libelle)
VALUES
    ('Légumes'),
    ('Fruits'),
    ('Boulangerie'),
    ('Viande'),
    ('Produits laitiers'),
    ('Boissons'),
    ('Autres');

-- Insérer les unités
INSERT INTO units(name)
VALUES
    ('kg'),
    ('piece'),
    ('L');

-- Insérer les produits
INSERT INTO products(name, description, product_type_id_product_type, unit_id_unit)
VALUES
    ('Pomme Golden', 'Pomme Golden de qualité supérieure, parfaite pour les tartes et les compotes.',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Fruits'),
     (SELECT id_unit FROM units WHERE name = 'piece')),
    ('Carotte Golden', 'Carotte Golden de qualité supérieure, parfaite pour les tartes au carotte ou les jus de carotte.',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Légumes'),
     (SELECT id_unit FROM units WHERE name = 'piece')),
    ('Haricots Mistik', 'Haricots extra-fins d''un beau pourpre foncé',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Légumes'),
     (SELECT id_unit FROM units WHERE name = 'kg')),
    ('Carotte Flakkée', 'Carotte Flakkée de qualité supérieure, parfaite pour les tartes au carotte ou les jus de carotte.',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Légumes'),
     (SELECT id_unit FROM units WHERE name = 'piece')),
    ('Chou-fleur Cheddar', 'Chou-fleur Cheddar de qualité supérieure, parfaite pour les tartes au carotte ou les jus de carotte.',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Légumes'),
     (SELECT id_unit FROM units WHERE name = 'piece')),
    ('Laitue Blonde de Paris', 'Excellente laitue de printemps, d’été et d’automne verte clair, pommée, ondulée et croquante',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Légumes'),
     (SELECT id_unit FROM units WHERE name = 'piece')),
    ('Courgette Blanche d''Egypte', 'Courgette ventrue à peau vert très pâle',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Légumes'),
     (SELECT id_unit FROM units WHERE name = 'kg')),
    ('Carottes Cosmic Purple', 'Carottes à la saveur sucrée, de couleur pourpre violet dont la chair est orangée',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Légumes'),
     (SELECT id_unit FROM units WHERE name = 'kg')),
    ('Miel de Pissenlit Bio 250gr', 'Texture onctueuse cristallisée, arômes rappellent la richesse florale des prairies printanières',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Autres'),
     (SELECT id_unit FROM units WHERE name = 'piece')),
    ('Cerise Napoléon', 'Cerise de couleur jaune marbrée de rouge, ferme et croquante',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Fruits'),
     (SELECT id_unit FROM units WHERE name = 'kg')),
    ('Tomate Voyage', 'Belle tomate rouge , bien juteuse, bien voyageuse',
     (SELECT id_product_type FROM product_types WHERE libelle = 'Fruits'),
     (SELECT id_unit FROM units WHERE name = 'kg'));

-- Insérer les lots
INSERT INTO batches(receipt_date, quantity, removed_quantity, reserved_quantity, sold_quantity, price_per_unit, status, product_id_product, producer_id_user, image_location)
VALUES
    ('2023-03-01', 2000, 0, 0, 0, 1.5, 'available',
     (SELECT id_product FROM products WHERE name = 'Pomme Golden'),
     (SELECT id_user FROM users WHERE email = 'a'),
     'https://imagestoragecae03.blob.core.windows.net/dev/e8451af3-966f-484a-8088-959e4397708e'),
    ('2023-03-01', 0, 0, 0, 100, 2.5, 'removed',
     (SELECT id_product FROM products WHERE name = 'Carotte Golden'),
     (SELECT id_user FROM users WHERE email = 'a'),
     NULL),
    ('2024-03-01', 101, 0, 0, 0, 2.5, 'available',
     (SELECT id_product FROM products WHERE name = 'Chou-fleur Cheddar'),
     (SELECT id_user FROM users WHERE email = 'p'),
     'https://imagestoragecae03.blob.core.windows.net/dev/9bd0fdfe-0c3c-4580-87ae-b369124598f4'),
    ('2024-03-01', 100, 0, 0, 0, 2.5, 'available',
     (SELECT id_product FROM products WHERE name = 'Carotte Flakkée'),
     (SELECT id_user FROM users WHERE email = 'p'),
     'https://imagestoragecae03.blob.core.windows.net/dev/b6b195a4-fbb6-42a3-9850-1d22ddafb381'),
    ('2025-03-01', 67, 0, 0, 0, 0.73, 'available',
     (SELECT id_product FROM products WHERE name = 'Laitue Blonde de Paris'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com'), /**/
     'https://imagestoragecae03.blob.core.windows.net/dev/9cb1b556-67e0-48c7-add4-eb8b3412b7d0'),
    ('2025-03-01', 300, 0, 0, 0, 3.75, 'available',
     (SELECT id_product FROM products WHERE name = 'Courgette Blanche d''Egypte'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com'), /**/
     'https://imagestoragecae03.blob.core.windows.net/dev/f675e893-7400-43c6-808c-3c39ad295348'),
    ('2025-03-01', 220, 0, 0, 0, 2.99, 'removed',
     (SELECT id_product FROM products WHERE name = 'Haricots Mistik'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com'),
     'https://imagestoragecae03.blob.core.windows.net/dev/8194a398-f7e2-4fef-8a31-721f30a69464'),
    ('2025-03-01', 185, 0, 0, 0, 3.22, 'removed',
     (SELECT id_product FROM products WHERE name = 'Carottes Cosmic Purple'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com'),
     'https://imagestoragecae03.blob.core.windows.net/dev/05d7aeff-a15b-4449-8dc2-88ea4a9a4bc5'),
    ('2025-03-01', 8, 0, 0, 0, 11.9, 'available',
     (SELECT id_product FROM products WHERE name = 'Miel de Pissenlit Bio 250gr'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com'),           /**/
     'https://imagestoragecae03.blob.core.windows.net/dev/37bf369c-c445-4fde-98bb-c697eba8a229'),
    ('2025-03-01', 105, 0, 0, 0, 32, 'refused',
     (SELECT id_product FROM products WHERE name = 'Cerise Napoléon'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com'),
     'https://imagestoragecae03.blob.core.windows.net/dev/39eaf2a2-2e4f-4d07-a5ec-f00cc815e6cb'),
     ('2025-03-01', 105, 0, 0, 0, 32, 'refused',
          (SELECT id_product FROM products WHERE name = 'Tomate Voyage'),
     (SELECT id_user FROM users WHERE email = 'p'),
     'https://imagestoragecae03.blob.core.windows.net/dev/21c93e3e-e5d2-4326-9af1-718e28c17ae0');

-- Insérer les notifications
INSERT INTO notifications(date, message, read, reason_of_reject,batch_id_batch,producer_id_user)
VALUES
    (NOW(), 'Votre réservation a été acceptée', FALSE, NULL,
     (SELECT id_batch FROM batches WHERE product_id_product = (SELECT id_product FROM products WHERE name = 'Laitue Blonde de Paris') AND receipt_date = '2025-03-01'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com')),
         (NOW(), 'Votre réservation a été acceptée', TRUE, NULL,
     (SELECT id_batch FROM batches WHERE product_id_product = (SELECT id_product FROM products WHERE name = 'Miel de Pissenlit Bio 250gr') AND receipt_date = '2025-03-01'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com')),
         (NOW(), 'Votre réservation a été acceptée', TRUE, NULL,
     (SELECT id_batch FROM batches WHERE product_id_product = (SELECT id_product FROM products WHERE name = 'Carottes Cosmic Purple') AND receipt_date = '2025-03-01'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com')),
         (NOW(), 'Votre réservation a été acceptée', TRUE, NULL,
     (SELECT id_batch FROM batches WHERE product_id_product = (SELECT id_product FROM products WHERE name = 'Haricots Mistik') AND receipt_date = '2025-03-01'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com')),
         (NOW(), 'Votre réservation a été acceptée', TRUE, NULL,
     (SELECT id_batch FROM batches WHERE product_id_product = (SELECT id_product FROM products WHERE name = 'Courgette Blanche d''Egypte') AND receipt_date = '2025-03-01'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com')),
         (NOW(), 'Votre réservation a été refusé', TRUE, NULL ,
     (SELECT id_batch FROM batches WHERE product_id_product = (SELECT id_product FROM products WHERE name = 'Cerise Napoléon') AND receipt_date = '2025-03-01'),
     (SELECT id_user FROM users WHERE email = 'roger.maerckx@gmail.com'));


-- Insérer les 12 réservations (une par mois) pour l'utilisateur 'c'
INSERT INTO reservations(recovery_date, status, user_id_user)
VALUES
    ('2024-01-01', 'approved', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-02-01', 'approved', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-03-01', 'approved', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-04-01', 'approved', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-05-01', 'approved', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-06-01', 'approved', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-07-01', 'approved', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-08-01', 'approved', (SELECT id_user FROM users WHERE email = 'c')),
    ('2025-05-13', 'Pending', (SELECT id_user FROM users WHERE email = 'c')),
    ('2025-05-13', 'Pending', (SELECT id_user FROM users WHERE email = 'c')),
    ('2025-05-13', 'Pending', (SELECT id_user FROM users WHERE email = 'c')),
    ('2025-05-13', 'Pending', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-07-05', 'abandoned', (SELECT id_user FROM users WHERE email = 'c')),
    ('2024-02-21', 'removed', (SELECT id_user FROM users WHERE email = 'c')),
    ('2025-05-13', 'Pending', (SELECT id_user FROM users WHERE email = 'suzanne.droity@gmail.com')),
    ('2025-05-14', 'Pending', (SELECT id_user FROM users WHERE email = 'suzanne.droity@gmail.com')),
    ('2025-05-06', 'approved', (SELECT id_user FROM users WHERE email = 'suzanne.droity@gmail.com')),
    ('2025-04-29', 'abandoned', (SELECT id_user FROM users WHERE email = 'suzanne.droity@gmail.com')),
    ('2025-04-28', 'removed', (SELECT id_user FROM users WHERE email = 'suzanne.droity@gmail.com'));
;
-- Insérer les réservationsLines
INSERT INTO reservation_lines(quantity, batch_id_batch, reservation_id_reservation)
VALUES (3,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Laitue Blonde de Paris'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2025-05-13'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'suzanne.droity@gmail.com'
         )
        )
       ),
       (2,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Miel de Pissenlit Bio 250gr'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2025-05-13'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'suzanne.droity@gmail.com'
         )
        )
       ),
       (4,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Courgette Blanche d''Egypte'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2025-05-14'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'suzanne.droity@gmail.com'
         )
        )
       ),
       (1,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Cerise Napoléon'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2025-05-06'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'suzanne.droity@gmail.com'
         )
        )
       ),
       (3,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Carottes Cosmic Purple'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2025-04-29'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'suzanne.droity@gmail.com'
         )
        )
       ),
       (1,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Haricots Mistik'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2025-04-28'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'suzanne.droity@gmail.com'
         )
        )
       ),
       (10,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-01-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (20,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-02-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (30,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-03-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (40,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-04-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (50,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-05-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (60,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-06-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (200,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-07-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (210,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-08-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (220,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-09-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (230,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-10-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (240,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-11-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (250,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-12-01'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (42,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-07-05'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       ),
       (74,
        (SELECT id_batch
         FROM batches
         WHERE product_id_product = (
             SELECT id_product
             FROM products
             WHERE name = 'Pomme Golden'
         )
        ),
        (SELECT id_reservation
         FROM reservations
         WHERE recovery_date      = '2024-02-21'
           AND user_id_user = (
             SELECT id_user
             FROM users
             WHERE email = 'c'
         )
        )
       );