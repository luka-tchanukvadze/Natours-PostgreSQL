CREATE DATABASE natourspsql;

CREATE TABLE tours (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  duration INTEGER NOT NULL,
  max_group_size INTEGER NOT NULL,

  rating NUMERIC(2,1) DEFAULT 4.5,
  ratings_quantity INTEGER DEFAULT 0,

  price INTEGER NOT NULL,
  price_discount INTEGER,

  summary TEXT NOT NULL,
  description TEXT NOT NULL,

  image_cover VARCHAR(255) NOT NULL,
  images TEXT[],

  created_at TIMESTAMP DEFAULT NOW(),
  start_dates TIMESTAMP[],

  slug VARCHAR(255),

  difficulty VARCHAR(20) NOT NULL
    CHECK (difficulty IN ('easy', 'medium', 'difficult')),

  secret_tour BOOLEAN DEFAULT FALSE,

  -- startLocation (GeoJSON)
  start_location_type VARCHAR(10) DEFAULT 'Point'
    CHECK (start_location_type = 'Point'),
  start_location_coordinates NUMERIC[],
  start_location_address TEXT,
  start_location_description TEXT,

  -- locations (array of embedded objects)
  locations JSONB,

  -- guides (user references)
  guides INTEGER[]
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,

    photo VARCHAR(255) DEFAULT 'default.jpg',
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'guide', 'lead-guide', 'admin')),

    password VARCHAR(255) NOT NULL,

    password_changed_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,

    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,

  review TEXT NOT NULL,

  rating INTEGER
    CHECK (rating BETWEEN 1 AND 5),

  created_at TIMESTAMP DEFAULT NOW(),

  tour_id INTEGER NOT NULL
    REFERENCES tours(id) ON DELETE CASCADE,

  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  -- one review per user per tour
  UNIQUE (tour_id, user_id)
);



CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,

  tour_id INTEGER NOT NULL
    REFERENCES tours(id) ON DELETE CASCADE,

  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  price INTEGER NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),

  paid BOOLEAN DEFAULT TRUE
);
