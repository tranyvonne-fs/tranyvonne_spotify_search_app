const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true },
  jwt: { type: String, required: true },
  accessToken: String,
  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
