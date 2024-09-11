const express = require('express'); // Imports Express library for building web servers
const axios = require('axios'); // Imports Axios, a library for making HTTP requests
const querystring = require('querystring'); // For query string formatting
require('dotenv').config(); // Loads environment variables from a .env file
const passport = require('passport');
const session = require('express-session');
const SpotifyStrategy = require('passport-spotify').Strategy;

// Create an Express application instance
const app = express();
const PORT = process.env.PORT || 3000;

// Configure Passport with Spotify Strategy
passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/spotify/callback'
  },
  (accessToken, refreshToken, expires_in, profile, done) => {
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

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to SpotBot!');
});

// Function to retrieve an access token from Spotify
async function getSpotifyAccessToken() {
  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'client_credentials' // Assuming client credentials grant type
    }), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return tokenResponse.data.access_token;
  } catch (error) {
    throw new Error('Error retrieving access token');
  }
}

// Endpoint to fetch an access token
app.get('/token', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error getting access token');
  }
});

// Endpoint to fetch track information
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

// Spotify authentication callback route
app.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
