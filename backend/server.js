import dotenv from 'dotenv';
dotenv.config();

console.log("✅ CLIENT_ID from .env:", process.env.SPOTIFY_CLIENT_ID);

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import { router as authRoutes, callbackHandler } from './routes/auth.js';
import searchRoutes from './routes/search.js';
import validateJWT from './middleware/validateJWT.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.get('/callback', callbackHandler);
app.use('/search', searchRoutes);
app.get('/auth/validate', validateJWT);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
