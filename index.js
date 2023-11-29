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
    res.redirect("/login");
});
app.get("/login", (req, res) => {
    res.render("pages/login");
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
        const insert = await db.query(
            "INSERT into users(username, password) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
            [username, password]
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
      if (req.body.password != user.password) {
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

  app.get("/discoverData", async (req, res) => {
      const latitude = req.query.latitude;
      const longitude = req.query.longitude;

      if (isNaN(latitude) || isNaN(longitude)) {
          // res.set('Content-Type', 'application/json');
          return res.status(404).render("pages/discover", {
              data: [],
              status: "success",
              message: "Invalid input",
          });
      }

      axios({
          url: `https://api.content.tripadvisor.com/api/v1/location/nearby_search?language=en`,
          method: "GET",
          dataType: "json",
          headers: {
              "Accept-Encoding": "application/json",
          },
          params: {
              key: process.env.ADVISOR_KEY,
              latLong: `${req.query.latitude},${req.query.longitude}`,
              radius:`${req.query.radius}`,
              radiusUnit: "mi",
          },
      })
          .then((results) => {
              return res.status(200).render("pages/discover", {
                  data: results.data.data,
                  status: "success",
                  message: "Success",
              });
          })
          .catch((error) => {
              // Handle errors
              console.log(error);
              return res.status(400).render("pages/discover", {
                  data: [],
                  status: "ERROR",
                  message: "ERROR",
              });
          });
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
};// Authentication Required
app.use(auth);

app.get("/mytrips", (req, res) => {
    res.render("pages/mytrips");
});
app.get("/discover", (req, res) => {
    res.status(200).render("pages/discover", { data: [] });
});

app.get("/trips", (req, res) => {
    const added = req.query.added;
    // Query to list all the courses taken by a student
  if (added) {
      db.any(user_trips, [req.session.user[0]])
          .then((trips) => {
              res.render("pages/mytrips", {
                  trips
              });
          })
          .catch((err) => {
              res.render("pages/mytrips", {
                  trips: [],
                  error: true,
                  message: err.message,
              });
          });
  } else {
      // Do nothing or handle the case where added is not true
      res.render("pages/mytrips", {
          trips: [] // You might want to pass an empty array or handle it as needed
      });
  }
});

app.post("/discover/add", async (req, res) => {
    try {
        const activityTitle = req.body.activity_title;
        const description = req.body.description;
        const location = req.body.location;
        const startDate = req.body.start_date;
        const endDate = req.body.end_date;

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

        // Render the "discover" page with a success message
        res.render("pages/discover", {
            message: `Successfully added ${activityTitle} to MyTrips`,
            action: "add",
        });
    } catch (err) {
        res.render("pages/discover", {
            error: true,
            message: err.message,
        });
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

        // Perform the deletion and fetch updated list of trips
        const [, trips] = await db.task("delete-activity", (task) => {
            return task.batch([
                task.none(
                    `DELETE FROM activities
                    WHERE user_id = $1 AND title = $2;`,
                    [userId, req.body.activity_title]
                ),
                task.any(user_trips, [userId]),
            ]);
        });

        res.render("pages/mytrips", {
            trips,
            message: `Successfully removed activity ${req.body.activity_title}`,
            action: "delete",
        });
    } catch (err) {
        res.render("pages/mytrips", {
            trips: [],
            error: true,
            message: err.message,
        });
    }
});

 app.get("/logout", (req, res) => {
     req.session.destroy();
     res.redirect("/login");
 });
});
// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
//app.listen(3000);
module.exports = app.listen(3000);
console.log("Server is listening on port 3000");