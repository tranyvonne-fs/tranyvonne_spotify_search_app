
# 🎧 Spotify Search App

A full-stack web app that allows users to authenticate with Spotify, persist JWT tokens securely, and search for tracks, artists, and albums using the Spotify Web API.

---

## 🚀 Features
- Spotify OAuth 2.0 login flow
- JWT issued and persisted securely
- JWT status validation route (`/auth/validate`)
- Refresh token workflow (`/auth/refresh_token`)
- Custom backend search routes:
  - `/search/tracks?q=...`
  - `/search/artists?q=...`
  - `/search/albums?q=...`

---

## 📦 Project Structure
.
├── backend/
│   ├── models/          # MongoDB models (User, Token)
│   ├── routes/          # Express routes: auth.js, search.js
│   ├── middleware/      # JWT validation middleware
│   ├── utils/           # Spotify auth helpers
│   └── server.js        # API entry point
├── frontend/            # Frontend UI (Week 4 task)
└── README.md

---

## 🛠 Prerequisites
- Node.js v18+
- MongoDB running locally or in cloud (Atlas)
- Spotify Developer Account
- Postman (optional, for API testing)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
git clone https://github.com/tranyvonne-fs/tranyvonne_spotify_search_app.git
cd tranyvonne_spotify_search_app

### 2️⃣ Install backend dependencies
cd backend
npm install

### 3️⃣ Environment variables
Create a `.env` file inside `/backend`:
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5050/callback
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

⚠️ Note: The Spotify redirect URI must exactly match what’s registered in your Spotify Developer Dashboard.

---

## ▶️ Running the API
npm start

API will run on:
http://127.0.0.1:5050

---

## 🧪 API Testing Workflow (Postman)

### 📌 Pre-requisites:
- Use provided Postman Collection and Environment files:
  - `spotify-auth-api.postman_collection.json`
  - `spotify-auth-api.postman_environment.json`

### 📝 Testing flow:
1️⃣ Visit `/auth/login` in your browser:
http://127.0.0.1:5050/auth/login

- Complete Spotify authentication.
- You will be redirected back to `/callback` and see a JSON payload with `jwt` and `refresh_token`.

2️⃣ Copy `jwt` and `refresh_token` into Postman environment variables.

3️⃣ Run Postman collection:
- `GET /auth/validate`: Check if JWT is valid.
- `GET /search/tracks?q=beatles`: Search Spotify tracks.
- `GET /search/artists?q=queen`: Search Spotify artists.
- `GET /search/albums?q=adele`: Search Spotify albums.
- `GET /auth/refresh_token`: Refresh Spotify token.

---

## 🔌 API Routes Summary
- `GET /auth/login`: Redirect to Spotify auth
- `GET /callback`: Handle Spotify auth callback
- `GET /auth/validate`: Check JWT status
- `GET /auth/refresh_token`: Refresh Spotify token
- `GET /search/tracks`: Search for tracks
- `GET /search/artists`: Search for artists
- `GET /search/albums`: Search for albums

---

## 🤝 Acknowledgments
This project was developed as part of coursework at Full Sail University.  
Based on Spotify API documentation and course template repository (not copied directly).

---

## 📄 License
MIT License
