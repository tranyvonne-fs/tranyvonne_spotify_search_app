const jwt = require('jsonwebtoken');
const User = require('../models/User');

const validateJWT = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ spotifyId: decoded.spotifyId });
    if (!user) return res.json({ valid: false });

    return res.json({ valid: true });
  } catch (err) {
    return res.json({ valid: false });
  }
};

module.exports = validateJWT;
