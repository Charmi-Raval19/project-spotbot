// Import required packages
const cron = require('node-cron');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();  


// Spotify API credentials from environment variables
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Function to authenticate with Spotify
async function authenticate() {
    try {
        // Request an access token using client credentials
        const data = await spotifyApi.clientCredentialsGrant();

        // Set the access token on the Spotify API object
        spotifyApi.setAccessToken(data.body['access_token']);

        console.log('Successfully authenticated with Spotify!');
    } catch (err) {
        console.error('Failed to authenticate with Spotify:', err);
    }
}

// Function to play a playlist
/* async function playPlaylist(playlistId) {
    try {
        // Fetch playlist details
        const playlist = await spotifyApi.getplaylist(playlistId);

        // Log playlist details
        console.log(`Playing playlist: ${playlist.body.name}`);
        console.log(`Description: ${playlist.body.description}`);
        console.log(`Tracks:`);
        playlist.body.tracks.items.forEach((item, index) => {
            console.log(`${index + 1}. ${item.track.name} by ${item.track.artists.map(artist => artist.name).join(', ')}`);
        });

    
        // Need to use Spotify's Playback SDK or other methods.
    } catch (err) {
        console.error('Error playing playlist:', err);
    }
}

cron.schedule('* * * * *', () => {
    console.log('Playing test playlist 1...');
    playPlaylist('3cEYpjA9oz9GiPac4AsH4n'); // Replace with your first playlist ID
});
*/

// Call the authenticate function to get an access token
authenticate()


// Function to play tracks
 async function playTracks(trackIds) {
    try {
        // Fetch track details
        const response = await spotifyApi.getTracks(trackIds);

        // Log track details
        response.body.tracks.forEach((track, index) => {
            console.log(`Playing track: ${track.name}`);
           
        });

    
        // Note: Spotify Web API does not directly support playing music. Need to use Spotify's Playback SDK or other methods.
    } catch (err) {
        console.error('Error playing tracks:', err);
    }
}

cron.schedule('* * * * *', () => {
    console.log('Playing tracks ...');
    //await getAuth();
    playTracks(['7ouMYWpwJ422jRcDASZB7P,4VqPOruhp5EdPBeR92t6lQ,2takcwOaAZWiXQijPHIx7B']); 
});

