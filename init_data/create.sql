DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL
);
INSERT into users (username, password) VALUES ('mae', 'test') ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS discovered CASCADE;
CREATE TABLE discovered (
    lat FLOAT  NOT NULL,
    long FLOAT NOT NULL,
    title VARCHAR(255) NOT NULL, -- Title of the activity
    description TEXT, -- Description of the activity
    location VARCHAR(255) -- Location of the activity
    url VARCHAR(255)
);

-- Drop existing trips and activities tables if they exist, to redefine them with the proper relations
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

-- Create the 'trips' table with a reference to the 'users' table
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY, -- A unique ID for each trip
    user_id INTEGER NOT NULL REFERENCES users (user_id) ON DELETE CASCADE, -- Foreign key to the 'users' table
    start_date DATE, -- The start date of the trip
    end_date DATE -- The end date of the trip
);

-- Create the 'activities' table with a reference to the 'trips' table
CREATE TABLE activities (
    activity_id SERIAL PRIMARY KEY, -- A unique ID for each activity
    trip_id INT REFERENCES trips(trip_id) ON DELETE CASCADE, -- Foreign key to the 'trips' table
    title VARCHAR(255) NOT NULL, -- Title of the activity
    description TEXT, -- Description of the activity
    location VARCHAR(255) -- Location of the activity
);