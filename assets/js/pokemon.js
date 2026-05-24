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

function getGenderDisplay(genderRate) {
  if (genderRate === -1) return 'Assexuado';
  const femalePercent = (genderRate / 8) * 100;
  const malePercent = 100 - femalePercent;
  if (femalePercent === 0) return '<span class="gender-male">♂ 100%</span>';
  if (malePercent === 0) return '<span class="gender-female">♀ 100%</span>';
  return `<span class="gender-male">♂ ${malePercent}%</span> <span class="gender-female">♀ ${femalePercent}%</span>`;
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

  // fetch chain + type data in parallel
  const [chainData, ...typeDataArr] = await Promise.all([
    fetch(species.evolution_chain.url).then((r) => r.json()),
    ...pokemon.types.map((t) =>
      fetch(`https://pokeapi.co/api/v2/type/${t.type.name}`).then((r) => r.json())
    ),
  ]);

  // weakness calculation
  const multipliers = {};
  typeDataArr.forEach((data) => {
    data.damage_relations.double_damage_from.forEach((t) => {
      multipliers[t.name] = (multipliers[t.name] || 1) * 2;
    });
    data.damage_relations.half_damage_from.forEach((t) => {
      multipliers[t.name] = (multipliers[t.name] || 1) * 0.5;
    });
    data.damage_relations.no_damage_from.forEach((t) => {
      multipliers[t.name] = (multipliers[t.name] || 1) * 0;
    });
  });
  const weaknesses = Object.entries(multipliers)
    .filter(([, m]) => m >= 2)
    .sort((a, b) => b[1] - a[1]);
  const weaknessHtml = weaknesses.length === 0
    ? '<p class="no-weakness">Sem fraquezas</p>'
    : weaknesses.map(([type, mult]) =>
        `<div class="weakness-item">
          <span class="type ${type} weakness-badge">${type}</span>
          <span class="weakness-mult">${mult}x</span>
        </div>`
      ).join('');

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

  const genus = species.genera.find((g) => g.language.name === 'en')?.genus || '';
  const heightM = (pokemon.height / 10).toFixed(2);
  const heightTotalInches = pokemon.height * 3.93701;
  const heightFeet = Math.floor(heightTotalInches / 12);
  const heightInches = (heightTotalInches % 12).toFixed(1);
  const heightDisplay = `${heightFeet}'${heightInches}" (${heightM} m)`;
  const weightKg = (pokemon.weight / 10).toFixed(1);
  const weightLbs = (pokemon.weight * 0.220462).toFixed(1);
  const weightDisplay = `${weightLbs} lbs (${weightKg} kg)`;
  const hatchSteps = (species.hatch_counter + 1) * 255;

  const movesHtml = pokemon.moves
    .map((m) => `<span class="move-badge" data-move-name="${m.move.name}" onclick="showMoveDetail('${m.move.name}')">${m.move.name.replace(/-/g, ' ')}</span>`)
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
                    <div class="tabs">
                        <button class="tab active" data-tab="tab-sobre">Sobre</button>
                        <button class="tab" data-tab="tab-status">Status</button>
                        <button class="tab" data-tab="tab-evolucoes">Evoluções</button>
                        <button class="tab" data-tab="tab-movimentos">Movimentos</button>
                    </div>

                    <div class="tab-content active" id="tab-sobre">
                        <div class="about-section">
                            <div class="about-row">
                                <span class="about-label">Espécie(s)</span>
                                <span class="about-value">${pokemon.types.map((t) => `<span class="type ${t.type.name} type-badge">${t.type.name}</span>`).join("")}</span>
                            </div>
                            <div class="about-row">
                                <span class="about-label">Altura</span>
                                <span class="about-value">${heightDisplay}</span>
                            </div>
                            <div class="about-row">
                                <span class="about-label">Peso</span>
                                <span class="about-value">${weightDisplay}</span>
                            </div>
                            <div class="about-row">
                                <span class="about-label">Habilidades</span>
                                <span class="about-value capitalize">${allTheAbilities(pokemon.abilities).join(", ")}</span>
                            </div>
                            <h4 class="about-subtitle">Reprodução</h4>
                            <div class="about-row">
                                <span class="about-label">Gênero</span>
                                <span class="about-value">${getGenderDisplay(species.gender_rate)}</span>
                            </div>
                            <div class="about-row">
                                <span class="about-label">Grupo de Ovos</span>
                                <span class="about-value capitalize">${species.egg_groups.map((g) => g.name).join(", ")}</span>
                            </div>
                            <div class="about-row">
                                <span class="about-label">Ciclo de Eclosão</span>
                                <span class="about-value">${hatchSteps} passos</span>
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="tab-status">
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
                        <div class="weakness-section">
                            <h4 class="weakness-title">Fraquezas</h4>
                            <div class="weakness-grid">
                                ${weaknessHtml}
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="tab-evolucoes">
                        <div class="evo-chain">
                            ${evolutionHtml}
                        </div>
                    </div>

                    <div class="tab-content" id="tab-movimentos">
                        <div class="moves-list">
                            ${movesHtml}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

  const typeColor = getComputedStyle(document.querySelector(".sectionPokemon")).backgroundColor;
  document.documentElement.style.setProperty("--poke-type-color", typeColor);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      document.getElementById(this.dataset.tab).classList.add("active");
      if (this.dataset.tab === 'tab-movimentos') localizeMoveBadges();
    });
  });
}

loadPokemon();

const moveCache = {};
let movesLocalized = false;

async function localizeMoveBadges() {
  if (movesLocalized) return;
  movesLocalized = true;
  const badges = document.querySelectorAll('.move-badge[data-move-name]');
  await Promise.all([...badges].map(async (badge) => {
    const name = badge.dataset.moveName;
    if (!moveCache[name]) {
      const res = await fetch(`https://pokeapi.co/api/v2/move/${name}`);
      moveCache[name] = await res.json();
    }
    const ptName = moveCache[name].names.find((n) => n.language.name === 'pt-BR')?.name;
    if (ptName) badge.textContent = ptName;
  }));
}

const damageClassPt = { physical: 'Físico', special: 'Especial', status: 'Status' };

async function showMoveDetail(name) {
  const overlay = document.getElementById('moveModalOverlay');
  const loading = document.getElementById('moveModalLoading');
  const effectEl = document.getElementById('moveModalEffect');
  const stats = document.getElementById('moveModalStats');

  overlay.classList.add('open');
  loading.style.display = 'block';
  effectEl.textContent = '';
  stats.style.visibility = 'hidden';
  document.getElementById('moveModalName').textContent = name.replace(/-/g, ' ');
  document.getElementById('moveModalType').innerHTML = '';

  if (!moveCache[name]) {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${name}`);
    moveCache[name] = await res.json();
  }
  const move = moveCache[name];

  const ptName = move.names.find((n) => n.language.name === 'pt-BR')?.name;
  document.getElementById('moveModalName').textContent = ptName || move.name.replace(/-/g, ' ');

  const effectText = (
    move.effect_entries.find((e) => e.language.name === 'pt-BR')?.short_effect ||
    move.effect_entries.find((e) => e.language.name === 'en')?.short_effect ||
    move.flavor_text_entries.find((e) => e.language.name === 'pt-BR')?.flavor_text ||
    move.flavor_text_entries.find((e) => e.language.name === 'en')?.flavor_text ||
    'Sem descrição disponível.'
  ).replace(/\$effect_chance/g, move.effect_chance ?? '');

  document.getElementById('moveModalType').innerHTML = `<span class="type ${move.type.name} type-badge">${move.type.name}</span>`;
  document.getElementById('moveModalPower').textContent = move.power ?? '—';
  document.getElementById('moveModalAccuracy').textContent = move.accuracy ? move.accuracy + '%' : '—';
  document.getElementById('moveModalPP').textContent = move.pp ?? '—';
  document.getElementById('moveModalClass').textContent = damageClassPt[move.damage_class.name] || move.damage_class.name;

  loading.style.display = 'none';
  stats.style.visibility = 'visible';
  effectEl.textContent = effectText;
}

function closeMoveModal() {
  document.getElementById('moveModalOverlay').classList.remove('open');
}
