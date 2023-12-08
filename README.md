# VentureVibes
-------------------------------------------

## Description: 

Want a vacation, but don't know where to go? Look no further. VentureVibes allows users to put in a range based on their current location, weather preference, and desired kind of activity! Giving the user a travel itinerary based on their preferences allows them to have the perfect vacation they didn't know they needed! 

## Vision Statement: 

Empowering personalized travel experiences, our app simplifies vacation planning by crafting tailored itineraries that match individual preferences. We aspire to streamline the overwhelming array of options and create memorable, personalized journeys for every traveler, ensuring each person discovers the perfect activities that resonate with their unique personality and desires. Unlike TripAdvisor, VentureVibes suggest vacation destinations and activities during their alloted vacation period that users can add to their trip iteneraries.

---------------------------------------------

## Technology Stack: 

Node.js, EJS, HTML, Bootsrap, JavaScript, PostgreSQL, VS Code, Azure, Tripadvisor API, OpenWeatherMap API, Mocha and Chai, Docker

-------------------------------------------------------------

## Prerequisites to run the application: 

Make sure to have VS Code and Docker already installed.

## How to run locally: 

1. Clone this repository

2. Create a .env file. Inside that file copy and paste:

    POSTGRES_USER="postgres"
    
    POSTGRES_PASSWORD="pwd"
    
    POSTGRES_DB="users_db"
    
    SESSION_SECRET = "super duper secret!"
    
    ADVISOR_KEY="9B92E43DA3494C1D9851666FE9486B1D"
    
    WEATHER_KEY="6f39900b6910c32d43c6e2a6233d9535"
   
3. Make sure docker is up and running

4. Change directory into Project folder

5. Type "docker compose up" into the terminal
   
6. => server should be running on localhost.

## How to run the tests: 

docker compose up, the tests will then show within the terminal.

--------------------------------------------------------------------------

## Link to the deployed application: 

http://recitation-11-team-02.eastus.cloudapp.azure.com:3000 

------------------------------------------------
Team 2, Adventure Squad

## Contributors 

Names: Mae Chen, Noah Rose, Wenbo Zhang, Emmy Wolf, Andrew Truong

GitHub Usernames: @maechen, @noro8514, @wenzh96, @emmy-wolf, @atruong7-bot

Emails: mach6290@colorado.edu, noro8514@colorado.edu, wezh6400@colorado.edu, mawo7163@colorado.edu, antr3219@colorado.edu,
