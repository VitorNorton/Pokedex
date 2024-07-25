const pokemonSpecified = document.getElementById("pokemonSpecified");
// Recuperar parâmetros da URL
const urlParams = new URLSearchParams(window.location.search);
const url = urlParams.get("url");
console.log(url);

function allTheTypes(pokemonTypes) {
    return pokemonTypes.map(function (type){
        return `
            <span class="type ${type.type.name}">${type.type.name}</span>
        `
        })
}

function allTheTypesTd(pokemonTypes) {
    return pokemonTypes.map(function (type){
        return `
            <td class="capitalize">${type.type.name}</td>
        `
        })
}

function allTheAbilities(pokemonAbilities) {
    return pokemonAbilities.map(function (ability) {
        return `
            ${ability.ability.name}
        `
    })
}

fetch(url)
    .then(function (response) { // quando dar o fetch, retorna response
        responseJson = response.json(); // transformando response em json para que possa ser manipulado
        return responseJson;
    }).then(function (pokemon) {
        let hp = pokemon.stats[0].base_stat;
        let attack = pokemon.stats[1].base_stat;
        let defense = pokemon.stats[2].base_stat;
        let speed = pokemon.stats[5].base_stat;
        return `
        <section class="${pokemon.types[0].type.name} sectionPokemon">
            <header>
                <a href="./"><i class="fa-solid fa-arrow-left"></i></a>
                <i class="fa-regular fa-heart"></i>
            </header>
            <div class="pokemon-info">
                <div class="top-side">
                    <h1 class="capitalize poke-name">${pokemon.name}</h1>
                    <div class="col">
                        <div class="left-side">
                            <div class="poke-types">
                                ${allTheTypes(pokemon.types).join('')}
                            </div>
                        </div>
                        <div class="right-side">
                            <p class="number">#${pokemon.order}</p>
                        </div>
                    </div>
                    <div class="poke-container">
                        <img src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}" class="poke-img">
                    </div>
                    <img class="pokeball-img" src="assets/img/poke_ball_icon.png" alt="">
                </div>
                <div class="bot-side">
                    <span class="about">Sobre</span>
                    <table class="first-table">
                        <tbody>
                        <tr>
                            <td class="info">Espécie(s):</td>
                            ${allTheTypesTd(pokemon.types).join('')}
                        </tr>
                        <tr>
                            <td class="info">Altura:</td>
                            <td>${pokemon.height}m</td>
                        </tr>
                        <tr>
                            <td class="info">Peso:</td>
                            <td>${pokemon.weight} kg</td>
                        </tr>
                        <tr>
                            <td class="info">Habilidades:</td>
                            <td class="capitalize">${allTheAbilities(pokemon.abilities).join(', ')}</td>
                        </tr>
                        </tbody>
                    </table>
                    <span class="breeding">Status Base</span>
                    <table class="second-table">
                        <tbody>
                            <tr>
                                <td class="info">Vida</td>
                                <td class="stat">${hp}</td>
                                <td><div class="bar"><div class="bar-stat red" style="width: ${hp*2}px"></div></div></td>
                            </tr>
                            <tr>
                                <td class="info">Ataque</td>
                                <td class="stat">${attack}</td>
                                <td><div class="bar"><div class="bar-stat green" style="width: ${attack*2}px"></div></div></td>
                            </tr>
                            <tr>
                                <td class="info">Defesa</td>
                                <td class="stat">${defense}</td>
                                <td><div class="bar"><div class="bar-stat green" style="width: ${defense*2}px"></div></div></td>
                            </tr>
                            <tr>
                                <td class="info">Velocidade</td>
                                <td class="stat">${speed}</td>
                                <td><div class="bar"><div class="bar-stat green" style="width: ${speed*2}px"></div></div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        `
    
    }).then(function (newHtml) {
        pokemonSpecified.innerHTML += newHtml;
    })