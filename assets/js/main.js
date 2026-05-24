const pokeApi = {};
let offset = 0;
const limit = 10;
let allPokemons = [];
let allPokemonNames = [];
let activeFilter = null;
let isLoading = false;
let sortKey = 'id';
let sortDir = 'asc';
let searchQuery = '';
let searchDebounce = null;
let currentSearchId = 0;

const types = [
  "normal",
  "grass",
  "fire",
  "water",
  "electric",
  "ice",
  "ground",
  "flying",
  "poison",
  "fighting",
  "psychic",
  "dark",
  "rock",
  "bug",
  "ghost",
  "steel",
  "dragon",
  "fairy",
];

pokeApi.getPokemonDetail = function (pokemon) {
  return fetch(pokemon.url).then(function (response) {
    return response.json();
  });
};

pokeApi.getPokemons = function (offset, limit) {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
  return fetch(url)
    .then((res) => res.json())
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
    .then((requests) => Promise.all(requests))
    .catch((err) => console.error(err));
};

function allTheTypes(pokemonTypes) {
  return pokemonTypes.map(function (type) {
    return `<span class="type ${type.type.name}">${type.type.name}</span>`;
  });
}

function convertendoJsonPokemonToHtml(pokemon) {
  return `
        <li class="${pokemon.types[0].type.name}">
            <a class="no-link-style" onclick="goToPokemon(${pokemon.id});">
                <span class="number">#${pokemon.id}</span>
                <span class="name">${pokemon.name}</span>
                <div class="details">
                    <div class="poke-types">
                        ${allTheTypes(pokemon.types).join("")}
                    </div>
                    <div class="pokemon-img">
                        <img src="assets/img/pokemons/poke_${pokemon.id}.gif" alt="${pokemon.name}" onerror="this.src='${pokemon.sprites.other.dream_world.front_default}'">
                    </div>
                </div>
                <div class="pokeball-img">
                    <img src="assets/img/poke_ball_icon.png" alt="Pokeball background image">
                </div>
            </a>
        </li>
    `;
}

async function renderPokemons() {
  if (searchQuery) {
    const myId = ++currentSearchId;
    const matches = allPokemonNames
      .filter((p) => p.name.includes(searchQuery))
      .slice(0, 30);
    const pokemons = await Promise.all(matches.map(pokeApi.getPokemonDetail));
    if (myId !== currentSearchId) return;
    const toShow = activeFilter
      ? pokemons.filter((p) => p.types.some((t) => t.type.name === activeFilter))
      : pokemons;
    listaPokemonOl.innerHTML = toShow.map(convertendoJsonPokemonToHtml).join("");
    return;
  }
  currentSearchId++;
  let toShow = activeFilter
    ? allPokemons.filter((p) => p.types.some((t) => t.type.name === activeFilter))
    : allPokemons;
  listaPokemonOl.innerHTML = toShow.map(convertendoJsonPokemonToHtml).join("");
}

const listaPokemonOl = document.getElementById("listaPokemons");

fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0')
  .then((res) => res.json())
  .then((data) => { allPokemonNames = data.results; });

pokeApi.getPokemons(offset, limit).then(function (pokemons) {
  allPokemons = pokemons;
  renderPokemons();
});

let scrollTimeout;
window.onscroll = function () {
  if (activeFilter || searchQuery) return;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function () {
    if (
      window.innerHeight + window.pageYOffset >=
      document.body.offsetHeight - 10
    ) {
      if (isLoading) return;
      isLoading = true;
      offset += limit;
      pokeApi.getPokemons(offset, limit).then(function (newPokemons) {
        allPokemons = [...allPokemons, ...newPokemons];
        renderPokemons();
        isLoading = false;
      });
    }
  }, 600);
};

function goToPokemon(id) {
  window.location.href = `pokemon.html?url=https://pokeapi.co/api/v2/pokemon/${id}`;
}

function sortBy(key) {
  if (sortKey === key) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey = key;
    sortDir = 'asc';
  }
  if (sortKey === 'name') {
    allPokemons.sort((a, b) =>
      sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  } else {
    allPokemons.sort((a, b) =>
      sortDir === 'asc' ? a.id - b.id : b.id - a.id
    );
  }
  updateSortIcons();
  renderPokemons();
  closeMenu();
}

function updateSortIcons() {
  const idIcon = document.getElementById('sortByIdIcon');
  const nameIcon = document.getElementById('sortByNameIcon');
  if (sortKey === 'id') {
    idIcon.className = sortDir === 'asc' ? 'fa-solid fa-arrow-up-1-9' : 'fa-solid fa-arrow-down-9-1';
    nameIcon.className = 'fa-solid fa-arrow-down-a-z';
  } else {
    nameIcon.className = sortDir === 'asc' ? 'fa-solid fa-arrow-down-a-z' : 'fa-solid fa-arrow-up-z-a';
    idIcon.className = 'fa-solid fa-arrow-up-1-9';
  }
}

// --- Filter panel ---
const fabFilter = document.getElementById("fabFilter");
const filterPanel = document.getElementById("filterPanel");
const filterOverlay = document.getElementById("filterOverlay");
const filterTypesEl = document.getElementById("filterTypes");

filterTypesEl.innerHTML = types
  .map(
    (type) =>
      `<button class="type-filter-btn ${type}" data-type="${type}" onclick="filterByType('${type}')">${type}</button>`,
  )
  .join("");

function filterByType(type) {
  if (activeFilter === type) {
    activeFilter = null;
  } else {
    activeFilter = type;
  }
  document.querySelectorAll(".type-filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === activeFilter);
  });
  fabFilter.classList.toggle("filter-active", activeFilter !== null);
  renderPokemons();
  closeFilter();
}

document.getElementById("clearFilter").addEventListener("click", function () {
  activeFilter = null;
  searchQuery = '';
  document.getElementById('searchInput').value = '';
  document.querySelectorAll(".type-filter-btn").forEach((btn) => btn.classList.remove("active"));
  fabFilter.classList.remove("filter-active");
  renderPokemons();
  closeFilter();
});

document.getElementById('searchInput').addEventListener('input', function () {
  searchQuery = this.value.toLowerCase().trim();
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(renderPokemons, 300);
});

fabFilter.addEventListener("click", function () {
  filterPanel.classList.toggle("open");
  filterOverlay.classList.toggle("open");
  closeMenu();
});

filterOverlay.addEventListener("click", closeFilter);

function closeFilter() {
  filterPanel.classList.remove("open");
  filterOverlay.classList.remove("open");
}

// --- Hamburger menu ---
const menuBtn = document.getElementById("menuBtn");
const menuDrawer = document.getElementById("menuDrawer");

menuBtn.addEventListener("click", function () {
  menuDrawer.classList.toggle("open");
  closeFilter();
});

document.addEventListener("click", function (e) {
  if (!menuBtn.contains(e.target) && !menuDrawer.contains(e.target)) {
    closeMenu();
  }
});

function closeMenu() {
  menuDrawer.classList.remove("open");
}
