import { useEffect, useRef, useState } from "react";

import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { getTopAnime, searchAnime } from "./services/jikanApi";

import AnimeCard from "./components/AnimeCard";
import Navbar from "./components/Navbar";
import FilterBar from "./components/FilterBar";
import AnimeDetails from "./pages/AnimeDetails";
import Watchlist from "./pages/Watchlist";

function ScrollManager() {
  const location = useLocation();
  const navigate = useNavigate();

  const firstLoad = useRef(true);

  useEffect(() => {
    if (!firstLoad.current) {
      return;
    }

    firstLoad.current = false;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const navigationEntry = performance.getEntriesByType("navigation")[0];

    const isReload = navigationEntry?.type === "reload";

    if (isReload && location.pathname.startsWith("/anime/")) {
      navigate("/", { replace: true });
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (firstLoad.current) {
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [location.pathname]);

  return null;
}

function Home() {
  const [anime, setAnime] = useState([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [sortBy, setSortBy] = useState("score");
  const [genre, setGenre] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [retryCount, setRetryCount] = useState(0);

  const resultsRef = useRef(null);
  const requestIdRef = useRef(0);

  // --------------------------------------------------
  // Fetch anime
  // --------------------------------------------------

  useEffect(() => {
    const searchTerm = query.trim();

    const controller = new AbortController();

    const requestId = ++requestIdRef.current;

    const fetchAnime = async () => {
      try {
        setLoading(true);
        setError(false);

        let result;

        if (searchTerm) {
          result = await searchAnime(searchTerm, page, controller.signal);
        } else {
          result = await getTopAnime(page, controller.signal);
        }

        // Ignore old requests that finished late
        if (requestId !== requestIdRef.current) {
          return;
        }

        setAnime(result.data || []);

        setHasNextPage(result.pagination?.has_next_page || false);

        // Scroll to results after a search
        if (searchTerm) {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Anime Fetch Error:", error);

        if (requestId === requestIdRef.current) {
          setError(true);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    // Search gets a debounce.
    // Top anime loads immediately.
    if (searchTerm) {
      const debounceTimer = setTimeout(() => {
        fetchAnime();
      }, 800);

      return () => {
        clearTimeout(debounceTimer);
        controller.abort();
      };
    }

    fetchAnime();

    return () => {
      controller.abort();
    };
  }, [query, page, retryCount]);

  // --------------------------------------------------
  // Search input
  // --------------------------------------------------

  const handleSearchChange = (value) => {
    setQuery(value);

    // Whenever a new search starts, go back to page 1
    setPage(1);
    setRetryCount(0);
  };

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const goToNextPage = () => {
    if (!hasNextPage || loading) {
      return;
    }

    setPage((currentPage) => currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (page === 1 || loading) {
      return;
    }

    setPage((currentPage) => currentPage - 1);
  };

  // --------------------------------------------------
  // Filter by genre
  // --------------------------------------------------

  const filteredAnime = anime.filter((item) => {
    if (genre === "all") {
      return true;
    }

    return item.genres?.some((itemGenre) => itemGenre.name === genre);
  });

  // --------------------------------------------------
  // Sort results
  // --------------------------------------------------

  const sortedAnime = [...filteredAnime].sort((a, b) => {
    if (sortBy === "score") {
      return (b.score || 0) - (a.score || 0);
    }

    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }

    return 0;
  });

  return (
    <main>
      <section className="hero">
        <p className="hero-tag">YOUR ANIME DISCOVERY HUB</p>

        <h1>
          Find your next
          <br />
          <span>favorite anime.</span>
        </h1>

        <p className="hero-description">
          Explore popular series, discover hidden gems, and find your next
          obsession.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search anime..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </section>

      <section className="anime-section" ref={resultsRef}>
        <div className="section-heading">
          <div>
            <p className="section-label">
              {query ? "SEARCH RESULTS" : "EXPLORE"}
            </p>

            <h2>{query ? `Results for "${query}"` : "Top Anime"}</h2>
          </div>
        </div>

        <FilterBar
          sortBy={sortBy}
          setSortBy={setSortBy}
          genre={genre}
          setGenre={setGenre}
        />

        <div className="results-container">
          {loading && (
            <div className="state-message">
              <div className="loading-spinner"></div>

              <h3>{query ? "Searching anime..." : "Loading anime..."}</h3>

              <p>Finding something good for you.</p>
            </div>
          )}

          {!loading && error && (
            <div className="state-message">
              <div className="state-icon">⚠</div>

              <h3>Something went wrong</h3>

              <p>We couldn't load the anime right now. Please try again.</p>

              <button
                className="retry-button"
                onClick={() => {
                  setError(false);
                  setRetryCount((count) => count + 1);
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && sortedAnime.length === 0 && (
            <div className="state-message">
              <div className="state-icon">🔍</div>

              <h3>No anime found</h3>

              <p>We couldn't find anything matching your search or filter.</p>
            </div>
          )}

          {!loading && !error && sortedAnime.length > 0 && (
            <>
              <div className="anime-grid">
                {sortedAnime.map((item) => (
                  <AnimeCard key={item.mal_id} anime={item} />
                ))}
              </div>

              {/* Pagination */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "18px",
                  marginTop: "50px",
                  marginBottom: "20px",
                }}
              >
                <button
                  className="retry-button"
                  onClick={goToPreviousPage}
                  disabled={page === 1 || loading}
                  style={{
                    opacity: page === 1 || loading ? 0.4 : 1,
                    cursor: page === 1 || loading ? "not-allowed" : "pointer",
                  }}
                >
                  ← Previous
                </button>

                <span
                  style={{
                    color: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: "600",
                    minWidth: "70px",
                    textAlign: "center",
                  }}
                >
                  Page {page}
                </span>

                <button
                  className="retry-button"
                  onClick={goToNextPage}
                  disabled={!hasNextPage || loading}
                  style={{
                    opacity: !hasNextPage || loading ? 0.4 : 1,
                    cursor: !hasNextPage || loading ? "not-allowed" : "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <ScrollManager />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/anime/:id" element={<AnimeDetails />} />

        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </>
  );
}

export default App;
