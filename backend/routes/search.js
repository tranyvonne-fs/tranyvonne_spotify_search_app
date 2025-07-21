const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getSpotifyAccessToken } = require('../utils/spotifyAuth');

router.get('/tracks', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing search query' });

  try {
    const token = await getSpotifyAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q, type: 'track', limit: 10 }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/artists', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing search query' });

  try {
    const token = await getSpotifyAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q, type: 'artist', limit: 10 }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/albums', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing search query' });

  try {
    const token = await getSpotifyAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q, type: 'album', limit: 10 }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
