import { Link } from "react-router-dom";

function AnimeCard({ anime }) {
  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="anime-card"
    >
      <img
        src={anime.images.jpg.large_image_url}
        alt={anime.title}
      />

      <div className="anime-card-info">
        <h3>{anime.title}</h3>

        <p>⭐ {anime.score || "N/A"}</p>
      </div>
    </Link>
  );
}

export default AnimeCard;