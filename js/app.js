const API_PUBLIC_KEY = "0299ad036fa9655c5ed46ab66088e486";
const API_PRIVATE_KEY = "25be40de079c0af41e2e861c79e98a026e1e789b"; // Asegúrate de que esta sea tu clave privada real
const API_BASE_URL = "https://gateway.marvel.com:443/v1/public/characters";

const searchInput = document.getElementById("searchInput");
const charactersContainer = document.getElementById("charactersContainer");
const resultsCount = document.createElement("div");
resultsCount.id = "resultsCount";

function md5(string) {
    return CryptoJS.MD5(string).toString();
}

// Función para buscar personajes
async function fetchCharacters(searchQuery = "") {
  const ts = Date.now();
  const hash = md5(ts + API_PRIVATE_KEY + API_PUBLIC_KEY);
  const url = `${API_BASE_URL}?nameStartsWith=${searchQuery}&ts=${ts}&apikey=${API_PUBLIC_KEY}&hash=${hash}&limit=100`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    renderCharacters(data.data.results);
  } catch (error) {
    console.error("Error fetching characters:", error);
    resultsCount.textContent = "Error al buscar personajes. Por favor, intenta de nuevo.";
  }
}

// Renderiza personajes en el DOM
function renderCharacters(characters) {
  // Actualizar el contador de resultados
  const totalResults = characters.length;
  resultsCount.textContent = totalResults === 0 
      ? "No se encontraron resultados." 
      : `Se encontraron ${totalResults} resultado${totalResults !== 1 ? "s" : ""}`;

  // Limpiar contenedor antes de renderizar
  charactersContainer.innerHTML = '';
  
  // Agregar el contador de resultados al principio del contenedor
  charactersContainer.appendChild(resultsCount);

  // Renderizar cada personaje
  characters.forEach(character => {
    const characterCard = document.createElement("div");
    characterCard.classList.add("character-card");
    characterCard.innerHTML = `
      <img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}">
      <h3>${character.name}</h3>`;

    // Agregar evento para capturar la ID
    characterCard.addEventListener("click", () => {
      localStorage.setItem("selectedCharacterId", character.id);
      window.location.href = "/character.html";
    });

    charactersContainer.appendChild(characterCard);
  });
}

// Función para manejar la búsqueda con debounce
let debounceTimer;
function handleSearch(e) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const searchQuery = e.target.value.trim();
    fetchCharacters(searchQuery);
  }, 300); // Espera 300ms después de que el usuario deje de escribir
}

// Escuchar eventos de búsqueda
searchInput.addEventListener("input", handleSearch);

// Cargar personajes iniciales
fetchCharacters();