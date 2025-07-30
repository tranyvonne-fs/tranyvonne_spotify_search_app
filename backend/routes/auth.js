import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import querystring from "querystring";
import jwt from "jsonwebtoken";
import qs from "qs";
import validateJWT from "../middleware/validateJWT.js";
import User from "../models/User.js";

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// 1️⃣ /login - redirect user to Spotify
router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email user-top-read";
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });

  res.redirect(authUrl);
});

// 2️⃣ /refresh_token - refresh Spotify token
router.get("/refresh_token", async (req, res) => {
  const refreshToken = req.query.refresh_token;
  if (!refreshToken) return res.status(400).send("Missing refresh_token");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken, // ✅ correct field
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
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
  const code = req.query.code;
  if (!code) {
    console.error("No code returned from Spotify");
    return res.status(400).send("No code found");
  }

  console.log("Received code from Spotify:", code);

  try {
    // Exchange code for access + refresh tokens
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Get user profile info
    const userProfileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const spotifyUser = userProfileResponse.data;

    // Create or update user in DB
    let user = await User.findOne({ spotifyId: spotifyUser.id });
    if (!user) {
      user = new User({
        spotifyId: spotifyUser.id,
        displayName: spotifyUser.display_name,
        accessToken: access_token,
        refreshToken: refresh_token,
      });
    } else {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
    }

    // Generate JWT (minimal payload)
    const jwtToken = jwt.sign(
      { spotifyId: spotifyUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save JWT to user
    user.jwt = jwtToken;
    await user.save();

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URI}/login?jwt=${jwtToken}`);
  } catch (err) {
    console.error("Callback error:", err.response?.data || err.message);
    res.status(500).send("Callback failed");
  }
};

// 5️⃣ /me - get current user's Spotify profile
router.get("/me", validateJWT, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }

  console.log("🔍 Decoded Spotify ID:", decoded.spotifyId);

  try {
    const user = await User.findOne({ spotifyId: decoded.spotifyId });
    if (!user) {
      console.error("❌ No user found with Spotify ID:", decoded.spotifyId);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.jwt !== token) {
      console.error("❌ Token mismatch for user:", user.spotifyId);
      return res.status(401).json({ message: "Token mismatch" });
    }

    // Now call Spotify API to fetch fresh profile info
    const spotifyRes = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });

    res.json(spotifyRes.data);
  } catch (err) {
    console.error("Failed to fetch user:", err.response?.data || err.message);
    res.status(500).send("Failed to fetch user");
  }
});

// Top Artists
router.get("/top-artists", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findOne({ spotifyId: decoded.spotifyId });
  if (!user) return res.status(404).json({ message: "User not found" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=5", {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Top Artists error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch top artists" });
  }
});

// Top Tracks
router.get("/top-tracks", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findOne({ spotifyId: decoded.spotifyId });
  if (!user) return res.status(404).json({ message: "User not found" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=5", {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Top Tracks error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch top tracks" });
  }
});

router.get("/callback", callbackHandler);

export { router, callbackHandler };