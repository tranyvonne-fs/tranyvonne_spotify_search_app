import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true },
  jwt: { type: String, required: true },
  accessToken: String,
  refreshToken: String,
});

export default mongoose.model("User", userSchema);
