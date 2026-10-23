-- 1. Create test owner
INSERT INTO users (full_name, email, role, password_hash)
VALUES (
  'Test Owner',
  'testowner@routeback.local',
  'owner',
  'test_hash'
)
ON CONFLICT (email) DO NOTHING;


-- 2. Create test driver
INSERT INTO users (full_name, email, role, password_hash)
VALUES (
  'Test Driver',
  'testdriver@routeback.local',
  'driver',
  'test_hash'
)
ON CONFLICT (email) DO NOTHING;


-- 3. Create test vehicle
INSERT INTO vehicles (
  owner_id,
  registration_number,
  vehicle_type,
  capacity_kg,
  verification_status
)
SELECT
  id,
  'KA01RB0001',
  'Truck',
  5000,
  'verified'
FROM users
WHERE email = 'testowner@routeback.local'
ON CONFLICT (registration_number) DO NOTHING;


-- 4. Create test trip
INSERT INTO trips (
  vehicle_id,
  driver_id,
  origin_city,
  destination_city,
  departure_at,
  available_capacity_kg,
  price,
  status
)
SELECT
  v.id,
  d.id,
  'Bengaluru',
  'Mysuru',
  NOW() + INTERVAL '1 day',
  5000,
  3500,
  'available'
FROM vehicles v
JOIN users d
  ON d.email = 'testdriver@routeback.local'
WHERE v.registration_number = 'KA01RB0001'
AND NOT EXISTS (
  SELECT 1
  FROM trips t
  WHERE t.vehicle_id = v.id
    AND t.origin_city = 'Bengaluru'
    AND t.destination_city = 'Mysuru'
);