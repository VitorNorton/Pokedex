const pokeApi = {}
let offset = 0;
let limit = 10;

pokeApi.getPokemonDetail = function (pokemon) {
    return fetch(pokemon.url) // caminha por todos os pokemons, e retorna o fetch de cada um deles
        .then(function (response) {
            return response.json(); // transforma o fetch de cada pokemon em json
        })
}

pokeApi.getPokemons = function(offset, limit) { // criando o método getPokemons para pokeApi
    console.log(`offset: ${offset} limit: ${limit}`)
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    return fetch(url)
        .then(function (response) { // quando dar o fetch, retorna response
            responseJson = response.json(); // transformando response em json para que possa ser manipulado
            return responseJson;
        }) // após isso retorna response em json para a próxima função
        .then(function (jsonBody) {
            return jsonBody.results; // retorna para a prox função apenas a parte dos resultados do jsonBody, que é o que interessa
        })
        .then(function (pokemons){
            return pokemons.map(pokeApi.getPokemonDetail) // mapeia todos os fetchs de todos os pokemons, e retorna um json de cada um deles, dessa forma teremos todos os detalhes de todos os pokemons
        }).then(function (detailRequests) {
            return Promise.all(detailRequests); // promise.all recebe um array de promessas e retorna uma nova promessa resolvida
        }).then(function (pokemonsDetails) {
            return pokemonsDetails;
        })
        .catch(function (error) {
            console.log(error)
        })
        .finally(function () {
            console.log('Requisição concluida!');
        })
}


function convertendoJsonPokemonToHtml(pokemon) {
    return `
        <li class="${pokemon.types[0].type.name}">
            <a class="no-link-style" onclick="pokemonSpecified(${pokemon.id});">
                <span class="number">#${pokemon.id}</span>
                <span class="name">${pokemon.name}</span>
                <div class="details">
                    <div class="poke-types">
                        ${allTheTypes(pokemon.types).join('')}
                    </div>
                    <div class="pokemon-img">
                        <img src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}">
                    </div>
                </div>
                <div class="pokeball-img">
                    <img src="assets/img/poke_ball_icon.png" alt="Pokeball background image">
                </div>
            </a>
        </li>
    `
}

function allTheTypes(pokemonTypes) {
    return pokemonTypes.map(function (type){
        return `
            <span class="type ${type.type.name}">${type.type.name}</span>
        `
        })
}

const listaPokemonOl = document.getElementById('listaPokemons');

pokeApi.getPokemons(offset, limit)
    .then(function (pokemons = [] ) { // apenas para caso não retorne nada, estarei deixando uma lista criada por padrão
        const newList = pokemons.map(function (pokemon){ // método map substitui um for, é usado para percorrer toda lista
                return convertendoJsonPokemonToHtml(pokemon);
            })
        const newHtml = newList.join('') // pega a lista newList, onde estão a lista de todos os elementos htmls com todos os pokemons, e junta nesta lista newHtml
        listaPokemonOl.innerHTML = newHtml // joga no html da listaPokemonOl
    })
 
function loadMoreButton(offset, limit) {
    pokeApi.getPokemons(offset, limit).then(function (pokemons = []){
        const newHtml = pokemons.map(function (pokemon) { 
            return `
            <li class="${pokemon.types[0].type.name}">
                <a class="no-link-style" onclick="pokemonSpecified(${pokemon.id});">
                    <span class="number">#${pokemon.id}</span>
                    <span class="name">${pokemon.name}</span>
                    <div class="details">
                        <div class="poke-types">
                            ${allTheTypes(pokemon.types).join('')}
                        </div>
                        <div class="pokemon-img">
                            <img src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}">
                        </div>
                    </div>
                    <div class="pokeball-img">
                        <img src="assets/img/poke_ball_icon.png" alt="Pokeball background image">
                    </div>
                </a>
            </li> `
        }).join('');
        listaPokemonOl.innerHTML += newHtml
    })
}

let scrollTimeout;

window.onscroll = function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
            console.log("you're at the bottom of the page");
            offset += 10;
            limit = limit + 10
            loadMoreButton(offset, limit);  
        }
    }, 800);
};

function pokemonSpecified(pokemon) {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    fetch(url)
        .then(function (response) { // quando dar o fetch, retorna response
            responseJson = response.json(); // transformando response em json para que possa ser manipulado
            return responseJson;
        }).then(function (pokemon) {
            window.location.href = `pokemon.html?url=${url}`
        })
}