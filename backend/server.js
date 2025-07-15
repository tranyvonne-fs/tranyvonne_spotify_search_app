require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose"); // if using MongoDB
const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = 5050;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
