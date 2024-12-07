const API_PUBLIC_KEY = "0299ad036fa9655c5ed46ab66088e486";
const API_BASE_URL = "https://gateway.marvel.com:443/v1/public/characters";

const searchInput = document.getElementById("searchInput");
const charactersContainer = document.getElementById("charactersContainer");

function md5(string) {
    return CryptoJS.MD5(string).toString();
}

// Función para buscar personajes
async function fetchCharacters(searchQuery = "") {
  const ts = Date.now();
  const hash = md5(ts + "25be40de079c0af41e2e861c79e98a026e1e789b" + API_PUBLIC_KEY); // Requiere una librería de hash MD5
  const url = `${API_BASE_URL}?nameStartsWith=${searchQuery}&ts=${ts}&apikey=${API_PUBLIC_KEY}&hash=${hash}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    renderCharacters(data.data.results);
  } catch (error) {
    console.error("Error fetching characters:", error);
  }
}

// Renderiza personajes en el DOM
function renderCharacters(characters) {
  charactersContainer.innerHTML = ""; // Limpiar contenedor
  characters.forEach(character => {
    const characterCard = document.createElement("div");
    characterCard.classList.add("character-card");

    characterCard.innerHTML = `
      <img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}">
      <h3>${character.name}</h3>
    `;
    charactersContainer.appendChild(characterCard);
  });
}

// Escuchar eventos de búsqueda
searchInput.addEventListener("input", (e) => {
  const searchQuery = e.target.value.trim();
  fetchCharacters(searchQuery);
});

// Cargar personajes iniciales
fetchCharacters();

// Supongamos que ya tienes un array con los personajes (por ejemplo, "charactersData")
function renderCharacters(charactersData) {
  const charactersContainer = document.getElementById('charactersContainer');

  // Limpiar contenedor antes de renderizar
  charactersContainer.innerHTML = '';

  charactersData.forEach(character => {
    // Crear tarjeta
    const card = document.createElement('div');
    card.classList.add('character-card');
    card.innerHTML = `
      <img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}">
      <h3>${character.name}</h3>
    `;

    // Agregar evento para capturar la ID
    card.addEventListener('click', () => {
      // Almacenar la ID en localStorage (puede usarse para pasar datos entre páginas)
      localStorage.setItem('selectedCharacterId', character.id);
      
      // Redirigir a la página de biografía
      window.location.href = '/character.html';
    });

    charactersContainer.appendChild(card);
  });
}