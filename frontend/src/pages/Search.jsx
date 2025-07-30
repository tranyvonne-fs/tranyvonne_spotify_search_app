import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Search.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return navigate("/login");
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNoResults(false);

    try {
      const res = await fetch(
        `http://localhost:5050/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`, // ✅ MATCHES LOGIN
          },
        }
      );
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        setResults([]);
        setNoResults(true);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="search-container">
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

      <div className="search-content">
        <h1 className="dashboard-title">🔍 Search Your MagicTunes</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type artist, album, or track..."
          />
          <button type="submit" disabled={!query}>
            Search
          </button>
        </form>

        {loading && <p className="search-loading">Searching...</p>}
        {noResults && <p className="search-no-results">No results found ✨</p>}

        <div className="search-scroll-wrapper">
          <div className="search-results">
            {results.map((item) => (
              <div key={item.id} className="search-card">
                <img
                  src={item.image || "https://placehold.co/300?text=No+Image"}
                  alt={item.name}
                />
                <h3>{item.name}</h3>
                <p>{item.type}</p>
                <a
                  href={item.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="search-link">
                  Open in Spotify ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
