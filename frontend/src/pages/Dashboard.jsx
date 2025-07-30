import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TopArtists from "../components/TopArtist";
import TopTracks from "../components/TopTrack";
import "../components/Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const triedFetching = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) {
          console.warn("No token found, redirecting to login...");
          navigate("/login");
          return;
        }
  
        const userRes = await fetch("http://localhost:5050/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const userData = await userRes.json();
        console.log("🔍 User fetch:", userData);
  
        if (!userRes.ok) {
          throw new Error(userData.message || "Failed to fetch user");
        }
  
        setUser(userData);
  
        const [artistsRes, tracksRes] = await Promise.all([
          fetch("http://localhost:5050/auth/top-artists", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5050/auth/top-tracks", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        const artistsData = await artistsRes.json();
        const tracksData = await tracksRes.json();
  
        setTopArtists(artistsData);
        setTopTracks(tracksData);
      } catch (err) {
        console.error("🚨 Dashboard load failed:", err.message);
        navigate("/login");
      }
    };
  
    load();
  }, [token]);  

  const handleLogout = () => {
    // Clear your app token
    localStorage.removeItem("jwt");

    // Open Spotify logout window
    const logoutWindow = window.open(
      "https://accounts.spotify.com/logout",
      "SpotifyLogout",
      "width=600,height=600"
    );

    // Wait for Spotify logout page to load, then auto-close
    const pollTimer = setInterval(() => {
      try {
        if (!logoutWindow || logoutWindow.closed) {
          clearInterval(pollTimer);
          window.location.href = "/login"; // Redirect back to login
        }
      } catch (e) {
        // Ignore cross-origin access errors
      }
    }, 500);

    // Optional: force-close the popup after 3 seconds even if Spotify doesn't close it
    setTimeout(() => {
      if (logoutWindow && !logoutWindow.closed) {
        logoutWindow.close();
      }
    }, 3000);
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <h2 className="nav-title">MagicTunes ✨</h2>
        <div className="nav-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/search">Search</a>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </nav>

      <div className="dashboard-content-wrapper">
        {user ? (
          <div className="profile-card">
            {user.images && user.images.length > 0 ? (
              <img
                src={user.images[0].url}
                alt="Profile"
                className="profile-img"
              />
            ) : (
              <img
                src="https://placehold.co/400"
                alt="Placeholder"
                className="profile-img"
              />
            )}
            <h2>{user.display_name || "No Name"}</h2>
            {user.external_urls?.spotify && (
              <a
                href={user.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
                className="spotify-link">
                View Spotify Profile ↗
              </a>
            )}
          </div>
        ) : (
          <p className="loading-text">Summoning your Spotify data... 🪄</p>
        )}

        <div className="spotify-info-section">
          <TopArtists />
          <TopTracks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
