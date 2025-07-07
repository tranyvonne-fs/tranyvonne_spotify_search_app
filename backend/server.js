require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Spotify Music Search API"));

app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
