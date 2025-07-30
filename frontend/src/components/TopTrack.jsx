import { useEffect, useState } from "react";
import axios from "axios";
import "./SpotifyCarousel.css";

const TopTracks = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchTopTracks = async () => {
      const token = localStorage.getItem("jwt");
      try {
        const res = await axios.get("http://localhost:5050/auth/top-tracks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTracks(res.data.items);
      } catch (err) {
        console.error("Top Tracks error:", err.response?.data || err.message);
      }
    };

    fetchTopTracks();
  }, []);

  return (
    <div className="spotify-section">
      <h2>🎵 Your Top Tracks</h2>
      <div className="carousel-container">
        {tracks.map((track) => (
          <div className="carousel-card" key={track.id}>
            <img
              style={{ maxHeight: "150px" }}
              src={track.album.images?.[0]?.url}
              alt={track.name}
            />
            <div className="card-info">
              <h3
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "140px",
                }}>
                {track.name}
              </h3>
              <p>{track.artists[0].name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTracks;
