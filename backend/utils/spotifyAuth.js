const axios = require('axios');

let tokenCache = {
  access_token: null,
  expires_at: null
};

async function getSpotifyAccessToken() {
  const now = new Date().getTime();
  if (tokenCache.access_token && tokenCache.expires_at > now) {
    return tokenCache.access_token;
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const { access_token, expires_in } = response.data;
  tokenCache.access_token = access_token;
  tokenCache.expires_at = now + expires_in * 1000;
  return access_token;
}

module.exports = { getSpotifyAccessToken };
