const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const { router: authRoutes, callbackHandler } = require('./routes/auth');
const searchRoutes = require('./routes/search');
const validateJWT = require('./middleware/validateJWT');

app.use('/auth', authRoutes);
app.get('/callback', callbackHandler);
app.use('/search', searchRoutes);
app.get('/auth/validate', validateJWT);

// DB connection (optional, if not connected yet)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
