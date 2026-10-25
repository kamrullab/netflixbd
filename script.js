const CONFIG = {
  corsProxy: "https://cors-anywhere.pulkitpareekofficial.workers.dev/?url=",
  tmdbKey: "b6b677eb7d4ec17f700e3d4dfc31d005",
  tmdbBase: "https://api.themoviedb.org/3",
  imageBase: "https://image.tmdb.org/t/p/original",
};

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const results = document.querySelector("#results");
const resultsTitle = document.querySelector("#results-title");
const resultsCount = document.querySelector("#results-count");
const statusBox = document.querySelector("#status");
const details = document.querySelector("#details");

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle("error", isError);
  statusBox.hidden = !message;
}

function normalizePoster(url) {
  return url ? url.replace("._V1_.", "._V1_QL85_UX500_.") : "";
}

function createCard(item) {
  const card = document.createElement("button");
  card.className = "movie-card";
  card.type = "button";
  card.setAttribute("aria-label", `View details for ${item.l}`);

  const poster = document.createElement("div");
  poster.className = "poster";
  if (item.i?.imageUrl) {
    const image = document.createElement("img");
    image.src = normalizePoster(item.i.imageUrl);
    image.alt = `${item.l} poster`;
    image.loading = "lazy";
    poster.appendChild(image);
  }

  const tag = document.createElement("span");
  tag.className = "type-tag";
  tag.textContent = item.qid === "tvSeries" ? "Series" : "Movie";

  const copy = document.createElement("div");
  copy.className = "card-copy";
  const title = document.createElement("h3");
  title.textContent = item.l;
  const meta = document.createElement("p");
  meta.textContent = [item.y, item.s].filter(Boolean).join(" • ") || "Title details";
  copy.append(title, meta);
  card.append(poster, tag, copy);
  card.addEventListener("click", () => openDetails(item));
  return card;
}

async function searchTitles(query, updateHistory = true) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return;

  setStatus("Searching the catalogue…");
  results.replaceChildren();
  details.hidden = true;
  resultsTitle.textContent = `Results for “${cleanQuery}”`;
  resultsCount.textContent = "Searching…";
  if (updateHistory) history.replaceState({}, "", `?search=${encodeURIComponent(cleanQuery)}`);

  try {
    const endpoint = `${CONFIG.corsProxy}https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(cleanQuery)}.json`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Search service unavailable");
    const data = await response.json();
    const titles = (data.d || []).filter(item => item.i && ["movie", "tvSeries"].includes(item.qid));
    setStatus("");
    resultsCount.textContent = `${titles.length} ${titles.length === 1 ? "title" : "titles"} found`;
    if (!titles.length) {
      setStatus("No matching movies or series were found. Try another title.");
      return;
    }
    const fragment = document.createDocumentFragment();
    titles.forEach(item => fragment.appendChild(createCard(item)));
    results.appendChild(fragment);
    document.querySelector(".results-section").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    resultsCount.textContent = "Search unavailable";
    setStatus("We couldn’t reach the catalogue right now. Please try again shortly.", true);
    console.error(error);
  }
}

async function getTmdbDetails(item) {
  const findUrl = `${CONFIG.tmdbBase}/find/${item.id}?api_key=${CONFIG.tmdbKey}&language=en-US&external_source=imdb_id`;
  const findResponse = await fetch(findUrl);
  if (!findResponse.ok) throw new Error("Metadata lookup failed");
  const found = await findResponse.json();
  const isTv = item.qid === "tvSeries";
  const match = isTv ? found.tv_results?.[0] : found.movie_results?.[0];
  if (!match) return null;
  const type = isTv ? "tv" : "movie";
  const response = await fetch(`${CONFIG.tmdbBase}/${type}/${match.id}?api_key=${CONFIG.tmdbKey}&language=en-US`);
  if (!response.ok) throw new Error("Metadata details failed");
  return { ...(await response.json()), type };
}

async function openDetails(item) {
  details.hidden = false;
  details.querySelector("#details-type").textContent = item.qid === "tvSeries" ? "Series details" : "Movie details";
  details.querySelector("#details-title").textContent = item.l;
  details.querySelector("#details-meta").textContent = "Loading details…";
  details.querySelector("#details-overview").textContent = "";
  details.querySelector("#details-genres").replaceChildren();
  details.querySelector("#details-backdrop").style.backgroundImage = item.i?.imageUrl ? `url("${normalizePoster(item.i.imageUrl)}")` : "none";
  const imdbLink = details.querySelector("#imdb-link");
  imdbLink.href = `https://www.imdb.com/title/${encodeURIComponent(item.id)}/`;
  details.scrollIntoView({ behavior: "smooth", block: "center" });
  history.replaceState({}, "", `?title=${encodeURIComponent(item.id)}`);

  try {
    const data = await getTmdbDetails(item);
    if (!data) throw new Error("No metadata found");
    const year = (data.release_date || data.first_air_date || "").slice(0, 4);
    const runtime = data.runtime ? `${data.runtime} min` : data.number_of_seasons ? `${data.number_of_seasons} season${data.number_of_seasons === 1 ? "" : "s"}` : "";
    const rating = data.vote_average ? `★ ${data.vote_average.toFixed(1)}` : "";
    details.querySelector("#details-title").textContent = data.title || data.name || item.l;
    details.querySelector("#details-meta").textContent = [year, runtime, rating].filter(Boolean).join("  •  ");
    details.querySelector("#details-overview").textContent = data.overview || "No overview is currently available for this title.";
    if (data.backdrop_path) details.querySelector("#details-backdrop").style.backgroundImage = `url("${CONFIG.imageBase}${data.backdrop_path}")`;
    const genres = details.querySelector("#details-genres");
    (data.genres || []).forEach(genre => {
      const chip = document.createElement("span");
      chip.textContent = genre.name;
      genres.appendChild(chip);
    });
  } catch (error) {
    details.querySelector("#details-meta").textContent = [item.y, item.qid === "tvSeries" ? "Series" : "Movie"].filter(Boolean).join(" • ");
    details.querySelector("#details-overview").textContent = "Extended details are unavailable, but you can continue to IMDb for more information.";
    console.error(error);
  }
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  searchTitles(searchInput.value);
});

document.querySelector("#details-close").addEventListener("click", () => {
  details.hidden = true;
  const query = searchInput.value.trim();
  history.replaceState({}, "", query ? `?search=${encodeURIComponent(query)}` : location.pathname);
});

const initialSearch = new URLSearchParams(location.search).get("search");
if (initialSearch) {
  searchInput.value = initialSearch;
  searchTitles(initialSearch, false);
}
