// Required libraries 
const SpotifyWebApi = require('spotify-web-api-node'); // Helps interact with Spotify API. Provides methods to request data from Spotify 
require('dotenv').config(); // Loads envrioment variables from a .env file into process.env

// Creates new instance of Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi.clientCredentialsGrant() // Requests an access token from Spotify
  // handles repsonse from the request. Data contains access token
  .then(data => {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it can be used in other requests
    spotifyApi.setAccessToken(data.body['access_token']);

    // Example: Get a playlist
    return spotifyApi.getPlaylist('37i9dQZF1DXcBWIGoYBM5M');
  })
  .then(data => {
    console.log('Playlist info', data.body);
  })
  .catch(err => {
    console.error('Something went wrong!', err);
  });

