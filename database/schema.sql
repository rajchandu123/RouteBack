
-- RouteBack: initial database schema

CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('customer', 'driver', 'owner', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity_kg NUMERIC(12, 2) NOT NULL CHECK (capacity_kg > 0),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    driver_id BIGINT NOT NULL REFERENCES users(id),
    origin_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    departure_at TIMESTAMPTZ NOT NULL,
    available_capacity_kg NUMERIC(12, 2) NOT NULL
        CHECK (available_capacity_kg > 0),
    price NUMERIC(12, 2) CHECK (price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'fully_booked', 'in_transit', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (LOWER(TRIM(origin_city)) <> LOWER(TRIM(destination_city)))
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(id),
    customer_id BIGINT NOT NULL REFERENCES users(id),
    goods_description TEXT NOT NULL,
    weight_kg NUMERIC(12, 2) NOT NULL CHECK (weight_kg > 0),
    quoted_price NUMERIC(12, 2) CHECK (quoted_price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_owner
    ON vehicles(owner_id);

CREATE INDEX IF NOT EXISTS idx_trips_route_departure
    ON trips(origin_city, destination_city, departure_at);

CREATE INDEX IF NOT EXISTS idx_trips_driver
    ON trips(driver_id);

CREATE INDEX IF NOT EXISTS idx_bookings_customer
    ON bookings(customer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_trip
    ON bookings(trip_id);