const pokemonSpecified = document.getElementById("pokemonSpecified");
const urlParams = new URLSearchParams(window.location.search);
const url = urlParams.get("url");

function allTheTypes(pokemonTypes) {
  return pokemonTypes.map(function (type) {
    return `<span class="type ${type.type.name}">${type.type.name}</span>`;
  });
}

function allTheTypesTd(pokemonTypes) {
    const badges = pokemonTypes.map(type =>
        `<span class="type ${type.type.name} type-badge">${type.type.name}</span>`
    ).join('');
    return [`<td>${badges}</td>`];
}

function allTheAbilities(pokemonAbilities) {
  return pokemonAbilities.map(function (ability) {
    return ability.ability.name;
  });
}

function parseEvolutionChain(chain) {
  const stages = [];
  let current = chain;
  while (current) {
    stages.push(current.species.name);
    current = current.evolves_to[0];
  }
  return stages;
}

function getPokemonSprite(p) {
  return (
    p.sprites.other["official-artwork"]?.front_default ||
    p.sprites.other.dream_world?.front_default ||
    p.sprites.front_default
  );
}

async function loadPokemon() {
  const response = await fetch(url);
  const pokemon = await response.json();

  const hp = pokemon.stats[0].base_stat;
  const attack = pokemon.stats[1].base_stat;
  const defense = pokemon.stats[2].base_stat;
  const speed = pokemon.stats[5].base_stat;

  const speciesResponse = await fetch(pokemon.species.url);
  const species = await speciesResponse.json();

  const chainResponse = await fetch(species.evolution_chain.url);
  const chainData = await chainResponse.json();

  const evolutionNames = parseEvolutionChain(chainData.chain);

  const evolutions = await Promise.all(
    evolutionNames.map(async (name) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const p = await res.json();
      return { name: p.name, id: p.id, fallback: getPokemonSprite(p) };
    }),
  );

  const evolutionHtml =
    evolutions.length === 1
      ? `<p class="no-evo">Não possui evolução</p>`
      : evolutions
          .map((evo, index) => {
            const arrow =
              index < evolutions.length - 1
                ? `<div class="evo-arrow"><i class="fa-solid fa-arrow-right"></i></div>`
                : "";
            return `
                <div class="evo-stage">
                    <img src="assets/img/pokemons/poke_${evo.id}.gif" alt="${evo.name}" class="evo-img" onerror="this.src='${evo.fallback}'">
                    <span class="capitalize evo-name">${evo.name}</span>
                </div>
                ${arrow}
            `;
          })
          .join("");

  pokemonSpecified.innerHTML = `
        <section class="${pokemon.types[0].type.name} sectionPokemon">
            <header>
                <a href="./"><i class="fa-solid fa-arrow-left"></i></a>
                <i class="fa-regular fa-heart"></i>
            </header>
            <div class="pokemon-info">
                <div class="top-side">
                    <h1 class="capitalize poke-name">${pokemon.name}</h1>
                    <div class="col">
                        <div class="right-side">
                            <p class="number">#${pokemon.id}</p>
                        </div>
                    </div>
                    <div class="poke-container">
                        <img src="assets/img/pokemons/poke_${pokemon.id}.gif" alt="${pokemon.name}" class="poke-img" onerror="this.src='${getPokemonSprite(pokemon)}'">
                    </div>
                    <img class="pokeball-img" src="assets/img/poke_ball_icon.png" alt="">
                </div>
                <div class="bot-side">
                    <span class="about">Sobre</span>
                    <table class="first-table">
                        <tbody>
                            <tr>
                                <td class="info">Espécie(s):</td>
                                ${allTheTypesTd(pokemon.types).join("")}
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
                                <td class="capitalize">${allTheAbilities(pokemon.abilities).join(", ")}</td>
                            </tr>
                        </tbody>
                    </table>
                    <span class="breeding">Status Base</span>
                    <table class="second-table">
                        <tbody>
                            <tr>
                                <td class="info">Vida</td>
                                <td class="stat">${hp}</td>
                                <td><div class="bar"><div class="bar-stat red" style="width: ${hp * 2}px"></div></div></td>
                            </tr>
                            <tr>
                                <td class="info">Ataque</td>
                                <td class="stat">${attack}</td>
                                <td><div class="bar"><div class="bar-stat green" style="width: ${attack * 2}px"></div></div></td>
                            </tr>
                            <tr>
                                <td class="info">Defesa</td>
                                <td class="stat">${defense}</td>
                                <td><div class="bar"><div class="bar-stat green" style="width: ${defense * 2}px"></div></div></td>
                            </tr>
                            <tr>
                                <td class="info">Velocidade</td>
                                <td class="stat">${speed}</td>
                                <td><div class="bar"><div class="bar-stat green" style="width: ${speed * 2}px"></div></div></td>
                            </tr>
                        </tbody>
                    </table>
                    <span class="breeding">Evoluções</span>
                    <div class="evo-chain">
                        ${evolutionHtml}
                    </div>
                </div>
            </div>
        </section>
    `;
}

loadPokemon();
