# AniFind 🎬

AniFind is a responsive anime discovery platform built with React.  
It allows users to explore popular anime, search for specific titles, filter and sort results, view detailed information, and maintain a personal watchlist.

## ✨ Features 

-  **Anime Search** — Search for anime by title with debounced API requests.
-  **Genre Filtering** — Filter anime by genres such as Action, Comedy, Drama, Fantasy, Romance, and more.
-  **Sorting** — Sort anime by highest rating or alphabetically (A–Z).
-  **Pagination** — Browse anime across multiple pages.
-  **Anime Details** — View detailed information including synopsis, rating, episodes, status, genres, studio, and year.
-  **Watchlist** — Save anime to a personal watchlist.
-  **Local Storage** — Watchlist persists even after refreshing the browser.
-  **Loading States** — Clear loading feedback while fetching data.
-  **Error Handling** — Retry option when an API request fails.
-  **Empty States** — Helpful feedback when no anime match a search or filter.
-  **Responsive Design** — Works across desktop, tablet, and mobile screen sizes.

## 🛠️ Tech Stack

- **React**
- **Vite**
- **JavaScript**
- **CSS**
- **Jikan API**
- **LocalStorage**
- **React Router**

## 🔌 APIs

AniFind uses: 
### Jikan API
For:
- Top anime
- Anime details
- Anime search

Jikan provides access to MyAnimeList anime data.


## 📂 Project Structure

```text
src/
├── components/
│   ├── AnimeCard.jsx
│   ├── FilterBar.jsx
│   └── Navbar.jsx
│
├── pages/
│   ├── AnimeDetails.jsx
│   └── Watchlist.jsx
│
├── services/
│   └── jikanApi.js
│
├── App.jsx
├── index.css
└── main.jsx