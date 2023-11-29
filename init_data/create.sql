DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(60) PRIMARY KEY,
    password VARCHAR(60) NOT NULL  
);
INSERT into users (username, password) VALUES ('andy', 'test') ON CONFLICT DO NOTHING;

-- Drop existing trips and activities tables if they exist, to redefine them with the proper relations
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

-- Create the 'trips' table with a reference to the 'users' table
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY, -- A unique ID for each trip
    username VARCHAR(60) REFERENCES users(username) ON DELETE CASCADE, -- Foreign key to the 'users' table
    trip_name VARCHAR(255) NOT NULL, -- The name of the trip
    trip_description TEXT, -- A description of the trip
    trip_image VARCHAR(255), -- A reference to the trip's image, e.g., a URL or file path
    start_date DATE, -- The start date of the trip
    end_date DATE -- The end date of the trip
);

-- Create the 'activities' table with a reference to the 'trips' table
CREATE TABLE activities (
    activity_id SERIAL PRIMARY KEY, -- A unique ID for each activity
    trip_id INT REFERENCES trips(trip_id) ON DELETE CASCADE, -- Foreign key to the 'trips' table
    activity_image VARCHAR(255), -- A reference to the activity's image
    title VARCHAR(255) NOT NULL, -- Title of the activity
    description TEXT, -- Description of the activity
    location VARCHAR(255), -- Location of the activity
    date_available DATE -- The date when the activity is available
);


