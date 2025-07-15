const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  jwt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" },  // optional TTL
});

module.exports = mongoose.model("Token", TokenSchema);
