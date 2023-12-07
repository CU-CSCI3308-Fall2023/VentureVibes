// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************
const express = require("express"); // To build an application server or API
const app = express();
const pgp = require("pg-promise")(); // To connect to the Postgres DB from the node server
const bodyParser = require("body-parser");
const session = require("express-session"); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require("bcrypt"); //  To hash passwords
const axios = require("axios"); // To make HTTP requests from our server. We'll learn more about it in Part B.
// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************
// database configuration
const dbConfig = {
    host: "db", // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};
const db = pgp(dbConfig);
// test your database
db.connect()
    .then((obj) => {
        console.log("Database connection successful"); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch((error) => {
        console.log("ERROR:", error.message || error);
    });
// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************
app.set("view engine", "ejs"); // set the view engine to EJS
app.set("view engine", "ejs"); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

const user_trips = `
  SELECT DISTINCT
    trips.trip_id,
    trips.start_date,
    trips.end_date,
    users.username = $1 AS "added"
  FROM
    users
    JOIN trips ON users.user_id = trips.user_id
    JOIN activities ON activities.trip_id = trips.trip_id
  WHERE users.username = $1`;

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************
// TODO - Include your API routes here
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("pages/login");
});
app.get("/register", (req, res) => {
    res.status(202).render("pages/register");
});

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // To-DO: Insert username and hashed password into 'users' table
    try {
        const hash = bcrypt.hash(password, 10);
        const insert = await db.query(
            "INSERT into users(username, password) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
            [username, hash]
        );
        res.redirect("/login");
    } catch (error) {
        res.redirect("/register");
    }
});

app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const userData = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (userData.length === 0) {
            // If the user is not found, redirect to GET /register route
            return res.redirect("/register");
        }
        const user = userData[0];
        const match = bcrypt.compare(req.body.password, user.password);
        if (!match) {
            // If the password is incorrect, throw an error
            return res.render("pages/login", {
                status: "success",
                message: "Invalid input",
            });
        }

        req.session.user = user;
        req.session.save();

        return res.redirect("/discover");
    } catch (error) {
        // If the database request fails, send an appropriate message to the user and render the login.ejs page
        return res.render("pages/login", {
            status: "success",
            message: "Invalid input",
        });
    }
});
//Messing with Middleware
app.use("/api/endpoint1", async (req, res, next) => {
    try {
        // Make an API call using Axios to some external API (replace with your actual API endpoint)
        const response = await axios.get(
            "https://jsonplaceholder.typicode.com/todos/1"
        );

        // Process data as needed
        const processedData =
            response.data.title + " - Processed by Middleware for Endpoint 1";

        // Attach processed data to the request object for use in the next middleware or route handler
        req.processedData = processedData;

        next(); // Pass control to the next middleware in the stack
    } catch (error) {
        console.error("Error in Middleware for Endpoint 1:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/discoverData", async (req, res) => {
    try {
        const latitude = parseFloat(req.query.latitude);
        const longitude = parseFloat(req.query.longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).render("pages/discover", {
                data: [],
                status: "error",
                message: "Invalid input",
            });
        }

        const tripAdvisorResults = await axios.get(
            `https://api.content.tripadvisor.com/api/v1/location/nearby_search`,
            {
                params: {
                    key: process.env.ADVISOR_KEY,
                    latLong: `${latitude},${longitude}`,
                    radius: req.query.radius,
                    radiusUnit: "mi",
                    language: "en",
                },
            }
        );

        if (!tripAdvisorResults.data) {
            return res.status(500).render("pages/discover", {
                data: [],
                status: "error",
                message: "Internal Server Error",
            });
        }

        // Create an array to store the results at each step
        const resultArray = [];

        for (const key in tripAdvisorResults.data.data) {
            if (tripAdvisorResults.data.data.hasOwnProperty(key)) {
                const data = tripAdvisorResults.data.data[key];

                // Second Axios call
                const specificLocationSearch = await axios.get(
                    `https://api.content.tripadvisor.com/api/v1/location/${data.location_id}/details`,
                    {
                        params: {
                            key: process.env.ADVISOR_KEY,
                        },
                    }
                );

                const photo = await axios.get(
                    `https://api.content.tripadvisor.com/api/v1/location/${data.location_id}/photos`,
                    {
                        params: {
                            key: process.env.ADVISOR_KEY,
                        },
                    }
                );

                // Third Axios call
                const weatherResults = await axios.get(
                    `https://api.openweathermap.org/data/2.5/forecast`,
                    {
                        params: {
                            appid: process.env.WEATHER_KEY,
                            lat: specificLocationSearch.data.latitude,
                            lon: specificLocationSearch.data.longitude,
                            units: "imperial",
                        },
                    }
                );

                console.log(
                    "WEATHER: ",
                    weatherResults.data.list[0].weather[0].main,
                    req.query.prefWeather
                );
                // Push the result of the second call to the array
                if (
                    weatherResults.data.list[0].weather[0].main ==
                    req.query.prefWeather
                ) {
                    specificLocationSearch.data["url"] =
                        photo.data.data[0] !== undefined
                            ? photo.data.data[0].images.original.url
                            : "";
                    resultArray.push(specificLocationSearch.data);
                }
            }
        }

        // Now, resultArray contains the results of each step in between the Axios calls
        return res.status(200).render("pages/discover", {
            data: resultArray,
            dates: {
                endDate: req.query.endDate,
                startDate: req.query.startDate,
            },
            status: "success",
            message: "Success",
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).render("pages/discover", {
            data: [],
            dates: {
                endDate: req.query.endDate,
                startDate: req.query.startDate,
            },
            status: "error",
            message: "Internal Server Error",
        });
    }
});

app.get("/welcome", (req, res) => {
    res.json({ status: "success", message: "Welcome!" });
});

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
        // Default to login page.
        return res.redirect("/login");
    }
    next();
}; // Authentication Required
app.use(auth);

app.get("/mytrips", (req, res) => {
    res.render("pages/mytrips");
});
app.get("/discover", (req, res) => {
    res.status(200).render("pages/discover", { data: [] });
});
app.get("/trips", async (req, res) => {
    try {
        const userID = await db.one(
            "SELECT user_id FROM users WHERE username = $1;",
            [req.session.user.username]
        );

        const activities = `
            SELECT activities.title, activities.description, activities.location, trips.end_date, trips.start_date, trips.trip_id
            FROM activities
            INNER JOIN trips ON trips.trip_id = activities.trip_id
            WHERE trips.user_id = ${userID.user_id};
        `;

        const result = await db.any(activities);

        console.log(result);

        res.render("pages/mytrips", { result });
    } catch (error) {
        res.render("pages/mytrips", { result: [], message: error });
    }
});

app.post("/discover/add", async (req, res) => {
    console.log(req.body);
    try {
        const activityTitle = req.body.activity_title;
        const description = req.body.description;
        const location = req.body.location;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        // Fetch user_id based on the username in the session
        const user = await db.one(
            "SELECT user_id FROM users WHERE username = $1;",
            [req.session.user.username]
        );

        const userId = user.user_id;

        // Insert the trip
        const tripResult = await db.one(
            "INSERT INTO trips(user_id, start_date, end_date) VALUES ($1, $2, $3) RETURNING trip_id;",
            [userId, startDate, endDate]
        );

        const tripId = tripResult.trip_id;

        // Insert the activity using the obtained trip_id
        await db.none(
            "INSERT INTO activities(trip_id, title, description, location) VALUES ($1, $2, $3, $4);",
            [tripId, activityTitle, description, location]
        );

        res.json({ message: `Successfully added ${activityTitle} to MyTrips` });
    } catch (err) {
        res.json({ message: err.message });
    }
});

app.post("/trips/delete", async (req, res) => {
    try {
        // Fetch user_id based on the username in the session
        const user = await db.one(
            "SELECT user_id FROM users WHERE username = $1;",
            [req.session.user.username]
        );

        const userId = user.user_id;

        await db.none(
            `DELETE FROM activities WHERE trip_id = $1 AND title = $2;`,
            [req.body.trip_id, req.body.activity_title]
        );

        res.redirect("/trips");
    } catch (err) {
        console.log(err);
        res.render("pages/mytrips", {
            result: [],
            error: true,
            message: err.message,
        });
    }
});

app.get("/weather", (req, res) => {
    var test = null;
    res.render("pages/weather", { test });
});
app.get("/weatherData", async (req, res) => {
    axios({
        url: `https://api.openweathermap.org/data/2.5/forecast`,
        method: "GET",
        dataType: "json",
        headers: {
            "Accept-Encoding": "application/json",
        },
        params: {
            appid: process.env.WEATHER_KEY,
            lat: req.query.latitude,
            lon: req.query.longitude,
            units: "imperial",
        },
    })
        .then((results) => {
            console.log(req.query.latitude); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
            console.log(req.query.longitude);
            var test = results.data;
            return res.render("pages/weather", { test });
        })
        .catch((error) => {
            // Handle errors
            console.log(error);
        });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});
// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
//app.listen(3000);
module.exports = app.listen(3000);
console.log("Server is listening on port 3000");
