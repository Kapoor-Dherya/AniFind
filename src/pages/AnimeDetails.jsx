import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Star } from "lucide-react";

import { getAnimeById } from "../services/jikanAPI";

function AnimeDetails() {
  const { id } = useParams();

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        setLoading(true);
        setError(false);

        const result = await getAnimeById(id);

        setAnime(result.data);

        // Check if anime is already in watchlist
        const savedAnime =
          JSON.parse(localStorage.getItem("anifind-watchlist")) || [];

        const alreadySaved = savedAnime.some(
          (item) => item.mal_id === result.data.mal_id,
        );

        setIsInWatchlist(alreadySaved);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id]);

  const handleWatchlist = () => {
    if (!anime) return;

    const savedAnime =
      JSON.parse(localStorage.getItem("anifind-watchlist")) || [];

    if (isInWatchlist) {
      const updatedWatchlist = savedAnime.filter(
        (item) => item.mal_id !== anime.mal_id,
      );

      localStorage.setItem(
        "anifind-watchlist",
        JSON.stringify(updatedWatchlist),
      );

      setIsInWatchlist(false);
    } else {
      const updatedWatchlist = [...savedAnime, anime];

      localStorage.setItem(
        "anifind-watchlist",
        JSON.stringify(updatedWatchlist),
      );

      setIsInWatchlist(true);
    }
  };

  if (loading) {
    return <div className="details-loading">Loading anime...</div>;
  }

  if (error || !anime) {
    return (
      <div className="details-error">
        <h2>Something went wrong.</h2>

        <Link to="/">
          <ArrowLeft size={18} />
          Back to AniFind
        </Link>
      </div>
    );
  }

  return (
    <main className="details-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={18} />
        Back to Explore
      </Link>

      <section className="anime-details">
        <div className="details-poster">
          <img src={anime.images.jpg.large_image_url} alt={anime.title} />
        </div>

        <div className="details-content">
          <p className="details-label">{anime.type || "ANIME"}</p>

          <h1>{anime.title}</h1>

          {anime.title_japanese && (
            <p className="japanese-title">{anime.title_japanese}</p>
          )}

          <div className="details-rating">
            <Star size={20} fill="currentColor" />

            <strong>{anime.score || "N/A"}</strong>

            {anime.scored_by && (
              <span>{anime.scored_by.toLocaleString()} ratings</span>
            )}
          </div>

          <div className="details-meta">
            <span>{anime.episodes || "?"} Episodes</span>

            <span>{anime.status || "Unknown"}</span>

            <span>{anime.duration || "Unknown duration"}</span>
          </div>

          <div className="details-genres">
            {anime.genres?.map((genre) => (
              <span key={genre.mal_id}>{genre.name}</span>
            ))}
          </div>

          <p className="details-synopsis">
            {anime.synopsis || "No synopsis available."}
          </p>

          <div className="details-extra">
            <div>
              <span>Studio</span>

              <strong>
                {anime.studios?.length
                  ? anime.studios.map((studio) => studio.name).join(", ")
                  : "Unknown"}
              </strong>
            </div>

            <div>
              <span>Year</span>

              <strong>{anime.year || "Unknown"}</strong>
            </div>
          </div>

          <button
            className={`watchlist-button ${isInWatchlist ? "saved" : ""}`}
            onClick={handleWatchlist}
          >
            <Heart size={19} fill={isInWatchlist ? "currentColor" : "none"} />

            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default AnimeDetails;
