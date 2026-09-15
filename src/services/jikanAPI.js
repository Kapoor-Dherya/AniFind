const BASE_URL = "https://api.jikan.moe/v4";
const ANILIST_URL = "https://graphql.anilist.co";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --------------------------------------------------
// Generic Jikan request with retry
// --------------------------------------------------

async function fetchJikanWithRetry(url, signal, retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { signal });

      if (response.ok) {
        return response;
      }

      if (
        response.status !== 429 &&
        response.status !== 500 &&
        response.status !== 502 &&
        response.status !== 503 &&
        response.status !== 504
      ) {
        throw new Error(`Jikan request failed: ${response.status}`);
      }

      lastError = new Error(`Jikan request failed: ${response.status}`);
    } catch (error) {
      if (error.name === "AbortError") {
        throw error;
      }

      lastError = error;
    }

    if (attempt < retries) {
      await wait(1000 * (attempt + 1));
    }
  }

  throw lastError || new Error("Jikan request failed");
}

// --------------------------------------------------
// Top Anime
// --------------------------------------------------

export async function getTopAnime(page = 1, signal) {
  const response = await fetchJikanWithRetry(
    `${BASE_URL}/top/anime?page=${page}`,
    signal,
  );

  return response.json();
}

// --------------------------------------------------
// Search Anime
// Uses AniList
// --------------------------------------------------

export async function searchAnime(query, page = 1, signal) {
  const graphqlQuery = `
    query ($search: String!, $page: Int!) {
      Page(page: $page, perPage: 25) {
        pageInfo {
          hasNextPage
        }

        media(
          search: $search
          type: ANIME
        ) {
          id
          idMal

          title {
            romaji
            english
            native
          }

          coverImage {
            large
          }

          averageScore
          episodes
          status
          format
          duration
          genres
          description
          seasonYear

          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  const response = await fetch(ANILIST_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      query: graphqlQuery,
      variables: {
        search: query,
        page,
      },
    }),

    signal,
  });

  if (!response.ok) {
    throw new Error(`AniList search failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error("AniList GraphQL error:", result.errors);

    throw new Error("AniList search failed");
  }

  const media = result.data?.Page?.media || [];

  const anime = media
    .filter((item) => item.idMal)
    .map((item) => ({
      mal_id: item.idMal,

      title:
        item.title.english ||
        item.title.romaji ||
        item.title.native ||
        "Unknown Anime",

      title_english: item.title.english,
      title_japanese: item.title.native,

      images: {
        jpg: {
          large_image_url: item.coverImage?.large,
        },
      },

      score: item.averageScore
        ? Number((item.averageScore / 10).toFixed(1))
        : null,

      scored_by: null,

      episodes: item.episodes,

      status: formatStatus(item.status),

      type: item.format,

      duration: item.duration ? `${item.duration} min per ep` : "Unknown",

      genres: (item.genres || []).map((genre) => ({
        name: genre,
      })),

      synopsis: cleanDescription(item.description),

      year: item.seasonYear,

      studios: item.studios?.nodes || [],

      popularity: null,
    }));

  return {
    data: anime,

    pagination: {
      last_visible_page: result.data.Page.pageInfo.hasNextPage
        ? page + 1
        : page,

      has_next_page: result.data.Page.pageInfo.hasNextPage,
    },
  };
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatStatus(status) {
  const statusMap = {
    FINISHED: "Finished Airing",
    RELEASING: "Currently Airing",
    NOT_YET_RELEASED: "Not yet aired",
    CANCELLED: "Cancelled",
    HIATUS: "On Hiatus",
  };

  return statusMap[status] || status;
}

function cleanDescription(description) {
  if (!description) {
    return "No synopsis available.";
  }

  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();
}

// --------------------------------------------------
// Anime Details
// --------------------------------------------------

export async function getAnimeById(id, signal) {
  const response = await fetchJikanWithRetry(`${BASE_URL}/anime/${id}`, signal);

  return response.json();
}
