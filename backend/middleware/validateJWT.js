import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";

const validateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Missing authorization header" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ spotifyId: decoded.spotifyId });

    if (!user || user.jwt !== token) {
      return res.status(401).json({ message: "User not found or token mismatch" });
    }

    req.user = {
      spotifyId: user.spotifyId,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    };

    next();
  } catch (err) {
    console.error("JWT validation failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default validateJWT;
