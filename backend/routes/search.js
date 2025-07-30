import express from "express";
import axios from "axios";
import querystring from "querystring";
import validateJWT from "../middleware/validateJWT.js";
import Token from "../models/Token.js";
import User from "../models/User.js";

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function refreshSpotifyToken(refreshToken) {
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

  return response.data;
}

router.get("/", validateJWT, async (req, res) => {
  const query = req.query.q;
  console.log("🟡 Search Query:", query);

  if (!query) return res.status(400).json({ message: "Missing search query" });

  try {
    let user = await User.findOne({ spotifyId: req.user.spotifyId });
    if (!user || !user.accessToken)
      return res.status(401).json({ message: "Spotify access token missing" });

    let spotifyRes;
    try {
      spotifyRes = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        params: {
          q: query,
          type: "track,artist,album",
          limit: 12,
        },
      });
    } catch (err) {
      if (err.response?.status === 401 && user.refreshToken) {
        const tokenData = await refreshSpotifyToken(user.refreshToken);
        user.accessToken = tokenData.access_token;
        await user.save();

        spotifyRes = await axios.get("https://api.spotify.com/v1/search", {
          headers: { Authorization: `Bearer ${user.accessToken}` },
          params: {
            q: query,
            type: "track,artist,album",
            limit: 12,
          },
        });
      } else {
        throw err;
      }
    }

    const results = [];

    const extractData = (items, type) => {
      return items.map((item) => ({
        id: item.id,
        name: item.name,
        type,
        image:
          item.images?.[0]?.url ||
          item.album?.images?.[0]?.url ||
          item.icons?.[0]?.url ||
          "",
        spotifyUrl: item.external_urls.spotify,
      }));
    };

    results.push(
      ...extractData(spotifyRes.data.tracks?.items || [], "Track"),
      ...extractData(spotifyRes.data.albums?.items || [], "Album"),
      ...extractData(spotifyRes.data.artists?.items || [], "Artist")
    );

    console.log(
      "🟢 Spotify Search Response:",
      JSON.stringify(spotifyRes.data, null, 2)
    );
    console.log("🟢 Final Parsed Results:", results.length);

    res.json({ results });
  } catch (err) {
    console.error("Search failed:", err.response?.data || err.message);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
