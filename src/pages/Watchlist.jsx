import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const savedAnime =
      JSON.parse(localStorage.getItem("anifind-watchlist")) || [];

    setWatchlist(savedAnime);
  }, []);

  const removeFromWatchlist = (id) => {
    const updatedWatchlist = watchlist.filter(
      (anime) => anime.mal_id !== id
    );

    localStorage.setItem(
      "anifind-watchlist",
      JSON.stringify(updatedWatchlist)
    );

    setWatchlist(updatedWatchlist);
  };

  return (
    <main className="watchlist-page">
      <div className="watchlist-header">
        <div>
          <p className="section-label">YOUR COLLECTION</p>

          <h1>Watchlist</h1>

          <p className="watchlist-count">
            {watchlist.length}{" "}
            {watchlist.length === 1 ? "anime" : "anime"} saved
          </p>
        </div>

        <Heart
          size={42}
          className="watchlist-header-icon"
        />
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <Heart size={48} />

          <h2>Your watchlist is empty</h2>

          <p>
            Find an anime you love and add it to your
            watchlist.
          </p>

          <Link to="/" className="browse-button">
            Explore Anime
          </Link>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map((anime) => (
            <div
              className="watchlist-item"
              key={anime.mal_id}
            >
              <Link to={`/anime/${anime.mal_id}`}>
                <img
                  src={anime.images.jpg.large_image_url}
                  alt={anime.title}
                />
              </Link>

              <div className="watchlist-item-info">
                <Link to={`/anime/${anime.mal_id}`}>
                  <h3>{anime.title}</h3>
                </Link>

                <p>⭐ {anime.score || "N/A"}</p>

                <button
                  className="remove-button"
                  onClick={() =>
                    removeFromWatchlist(anime.mal_id)
                  }
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Watchlist;