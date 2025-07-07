const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/login", async (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    res.json({ token: response.data.access_token });
  } catch (error) {
    res.status(500).json({ error: "Spotify Auth Failed" });
  }
});

module.exports = router;
