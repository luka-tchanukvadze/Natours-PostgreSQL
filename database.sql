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
  start_dates TIMESTAMP[]
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,

    photo VARCHAR(255) DEFAULT 'default.jpg',
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'guide', 'lead-guide', 'admin')),

    password VARCHAR(255) NOT NULL,
    password_confirm VARCHAR(255) NOT NULL,

    password_changed_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,

    active BOOLEAN DEFAULT TRUE
);


