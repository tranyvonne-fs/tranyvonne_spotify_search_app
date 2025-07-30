import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Login.css";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const jwtFromUrl = queryParams.get("jwt");

    if (jwtFromUrl) {
      console.log("✅ New JWT from URL, storing and redirecting");
      localStorage.setItem("jwt", jwtFromUrl);
      navigate("/dashboard", { replace: true });
    } else {
      const storedJwt = localStorage.getItem("jwt");

      if (storedJwt) {
        console.log("⏭ Already have JWT, going to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("🔒 No JWT, staying on login");
      }
    }
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = "http://localhost:5050/auth/login";
  };

  return (
    <div className="login-container">
      <h1>Welcome to MagicTunes ✨</h1>
      <p>Your enchanted Spotify experience starts here.</p>
      <button className="login-button" onClick={handleLogin}>
        💚 Login with Spotify
      </button>
    </div>
  );
};

export default Login;