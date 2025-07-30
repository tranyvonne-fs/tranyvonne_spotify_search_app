import { useEffect, useState } from "react";
import axios from "axios";
import "./SpotifyCarousel.css";

const TopArtists = () => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const fetchTopArtists = async () => {
      const token = localStorage.getItem("jwt");
      try {
        const res = await axios.get("http://localhost:5050/auth/top-artists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtists(res.data.items);
      } catch (err) {
        console.error("Top Artists error:", err.response?.data || err.message);
      }
    };

    fetchTopArtists();
  }, []);

  return (
    <div className="spotify-section">
      <h2>🎨 Your Top Artists</h2>
      <div className="carousel-container">
        {artists.map((artist) => (
          <div className="carousel-card" key={artist.id}>
            <img style={{maxHeight: "150px"}} src={artist.images?.[0]?.url} alt={artist.name} />
            <div className="card-info">
              <h3>{artist.name}</h3>
              <p>{artist.genres.slice(0, 2).join(", ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopArtists;
