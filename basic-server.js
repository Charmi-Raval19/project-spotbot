/* // Imports required libraries
const express = require('express'); // Imports Express library for building web servers
const axios = require('axios'); // Imports Axios, a library for making HTTP requests
require('dotenv').config();

// Creates an Express application instance. This object will be used to define routes and handle requests
const app = express(); 
// This sets the port number for the server. 
const PORT = process.env.PORT || 3000;

// This sets up a route handler for HTTP Get requests to root URL (`/`)
app.get('/', (req, res) => {
    // This sends the response to the client who made the request
  res.send('Welcome to SpotBot!');
});

// This starts the Express server and makes it listen for incoming requests on the specified port. 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); 
});

// Setting up an endpoint on an Express server to fetch and return a Spotify access token

const qs = require('querystring'); // Imports querystring module, which is used to format data into url-encoded string format

// Retrieve an access token from Spotify
async function getSpotifyAccessToken() {
    // Uses Axios to make an HTTP POST request to Spotify's token endpoint
  const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({ // Converts request body to url-encoded string. 
  }), {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  // Returns access token from the repsonse data
  return tokenResponse.data.access_token; 
}

// Defines an endpoint /token that handles GET requests. 
app.get('/token', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken(); 
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error getting access token');
  }
});

// Interacting with Spotify API
app.get('/track/:id', async (req, res) => {
    try {
      const token = await getSpotifyAccessToken();
      const trackId = req.params.id;
      const trackResponse = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      res.json(trackResponse.data);
    } catch (error) {
      res.status(500).send('Error fetching track information');
    }
  });
  
  */ 

// Imports required libraries
const express = require('express'); // Imports Express library for building web servers
const axios = require('axios'); // Imports Axios, a library for making HTTP requests
require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const SpotifyStrategy = require('passport-spotify').Strategy;

// Creates an Express application instance. This object will be used to define routes and handle requests
const app = express(); 
// This sets the port number for the server. 
const PORT = process.env.PORT || 3000;

// Configure Passport
passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/spotify/callback'
  },
  function(accessToken, refreshToken, expires_in, profile, done) {
    // Here you can save the user info in the database or session
    return done(null, { profile, accessToken });
  }
));

// Serialize user information into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user information from session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Initialize middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// This sets up a route handler for HTTP Get requests to root URL (`/`)
app.get('/', (req, res) => {
  res.send('Welcome to SpotBot!');
});

// This starts the Express server and makes it listen for incoming requests on the specified port. 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); 
});

// Setting up an endpoint on an Express server to fetch and return a Spotify access token

const qs = require('querystring'); // Imports querystring module, which is used to format data into url-encoded string format

// Retrieve an access token from Spotify
async function getSpotifyAccessToken() {
    // Uses Axios to make an HTTP POST request to Spotify's token endpoint
  const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({ // Converts request body to url-encoded string. 
  }), {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  // Returns access token from the repsonse data
  return tokenResponse.data.access_token; 
}

// Defines an endpoint /token that handles GET requests. 
app.get('/token', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken(); 
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error getting access token');
  }
});

// Interacting with Spotify API
app.get('/track/:id', async (req, res) => {
    try {
      const token = await getSpotifyAccessToken();
      const trackId = req.params.id;
      const trackResponse = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      res.json(trackResponse.data);
    } catch (error) {
      res.status(500).send('Error fetching track information');
    }
  });
  
// Authentication routes
app.get('/auth/spotify',
  passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'] })
);

// The callback after Spotify has authenticated the user
app.get('/auth/spotify/callback', 
  passport.authenticate('spotify', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
