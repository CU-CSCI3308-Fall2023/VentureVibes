DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(60) PRIMARY KEY,
    password CHAR(60) NOT NULL
);
INSERT into users (username, password) VALUES ('mae', 'test') ON CONFLICT DO NOTHING;