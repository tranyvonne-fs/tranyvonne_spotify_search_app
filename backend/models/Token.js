import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  jwt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // TTL
});

const Token = mongoose.model("Token", TokenSchema);
export default Token;