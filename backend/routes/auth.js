const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// 1️⃣ /login - redirect user to Spotify
router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
    });
  res.redirect(authUrl);
});

// 2️⃣ /refresh_token - refresh Spotify token
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
          Authorization: `Basic ${Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`
          ).toString("base64")}`,
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

// 3️⃣ /validate - check if JWT is valid and exists in DB
router.get("/validate", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.json({ valid: false });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ spotifyId: decoded.spotifyId, jwt: token });
    if (!user) return res.json({ valid: false });

    return res.json({ valid: true });
  } catch (err) {
    return res.json({ valid: false });
  }
});

// 4️⃣ callbackHandler to export explicitly for /callback route
const callbackHandler = async (req, res) => {
  const code = req.query.code || null;

  try {
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
          Authorization: `Basic ${Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    const profileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const spotifyId = profileResponse.data.id;

    const tokenPayload = { spotifyId };
    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    let user = await User.findOneAndUpdate(
      { spotifyId },
      {
        spotifyId,
        jwt: jwtToken,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
      { upsert: true, new: true }
    );

    res.json({ jwt: jwtToken, access_token, refresh_token, spotifyId });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Callback failed");
  }
};

module.exports = {
  router,
  callbackHandler
};
