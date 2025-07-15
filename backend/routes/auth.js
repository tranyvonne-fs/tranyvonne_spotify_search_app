const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("./models/User"); // Ensure this file exists

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// 1️⃣ /login - redirect user to Spotify
router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const authUrl = "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
    });
  res.redirect(authUrl);
});

// 2️⃣ /callback - handle Spotify redirect with code
router.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    // Exchange code for access and refresh tokens
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Fetch Spotify profile to get spotifyId
    const profileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const spotifyId = profileResponse.data.id;

    // Issue JWT
    const tokenPayload = { spotifyId };
    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    // Persist to MongoDB
    let user = await User.findOne({ spotifyId });
    if (!user) {
      user = new User({
        spotifyId,
        jwt: jwtToken,
        accessToken: access_token,
        refreshToken: refresh_token,
      });
    } else {
      user.jwt = jwtToken;
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
    }
    await user.save();

    res.json({ jwt: jwtToken, access_token, refresh_token, spotifyId });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Callback failed");
  }
});

// 3️⃣ /refresh_token - refresh Spotify token
router.get("/refresh_token", async (req, res) => {
  const refreshToken = req.query.refresh_token;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = response.data;
    res.json({ access_token });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Token refresh failed");
  }
});

module.exports = router;
