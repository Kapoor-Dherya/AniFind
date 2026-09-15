import { Heart, Search } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Ani<span>Find</span>
      </Link>

      <div className="nav-links">
        <Link to="/">
          Explore
        </Link>

        <Link to="/watchlist">
          <Heart size={18} />
          Watchlist
        </Link>
      </div>

      <Link
        to="/"
        className="nav-search"
        aria-label="Search anime"
      >
        <Search size={20} />
      </Link>
    </nav>
  );
}

export default Navbar;