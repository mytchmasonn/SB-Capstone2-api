DROP TABLE IF EXISTS files;
CREATE TABLE files
(
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  owner_id integer REFERENCES users (id)
);

DROP TABLE IF EXISTS tokens;
CREATE TABLE tokens
(
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  type_of TEXT NOT NULL,
  expire_at TEXT NOT NULL,
  owner_id integer REFERENCES users (id)
);

DROP TABLE IF EXISTS users;
CREATE TABLE users
(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  email_verified TEXT NOT NULL
);

DROP TABLE IF EXISTS contactus;
CREATE TABLE contactus
(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL
);


INSERT INTO users (name, email, password, email_verified)
values ('mytch', 'mytchmason@gmail.com', '$2b$10$u8Q9CLwitRAKk4Q2wbImtOm4YeBtxYijb6lbkMJH7gFEJZ0D/VC3m', 'true');
