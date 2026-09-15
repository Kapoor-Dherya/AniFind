function FilterBar({ sortBy, setSortBy, genre, setGenre }) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="sort">Sort by:</label>

        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="score">Highest Rated</option>
          <option value="title">A - Z</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="genre">Genre:</label>

        <select
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="all">All Genres</option>
          <option value="Action">Action</option>
          <option value="Adventure">Adventure</option>
          <option value="Comedy">Comedy</option>
          <option value="Drama">Drama</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Romance">Romance</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Sports">Sports</option>
          <option value="Mystery">Mystery</option>
          <option value="Horror">Horror</option>
        </select>
      </div>
    </div>
  );
}

export default FilterBar;