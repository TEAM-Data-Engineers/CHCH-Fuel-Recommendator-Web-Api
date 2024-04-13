CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE DATABASE jwttutorial;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

SELECT * FROM users;

INSERT INTO users (username, email, password) VALUES ('aemon', 'aemon@gmail.com', 'password');
INSERT INTO users (username, email, password) VALUES ('hua', 'hua@gmail.com', 'password');

-- docker exec -it aemon_local_postgres bash  # to get into the container
-- psql -U root -d p_database