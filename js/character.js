// Función para regresar al buscador
function goBack() {
    window.history.back(); // Regresa a la página anterior
}

document.addEventListener('DOMContentLoaded', () => {
  // Obtener el ID del personaje desde localStorage
  const characterId = localStorage.getItem('selectedCharacterId');
  if (characterId) {
    fetchCharacterDetails(characterId);
  } else {
    console.error("No se encontró el ID del personaje en localStorage");
    displayError("No se pudo cargar el personaje. Por favor, vuelve a la página de búsqueda.");
  }

  // Evento para volver atrás
  document.querySelector('.back-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/page.html';
  });

  // Toggle del tema
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    const themeIcon = document.querySelector('.theme-icon');  // Obtener el ícono
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // Cambiar el tema
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
      themeIcon.textContent = '🌙'; // Ícono para Modo Claro
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeIcon.textContent = '☀️'; // Ícono para Modo Oscuro
      localStorage.setItem('theme', 'dark');
    }
  });

  // Restaurar el tema almacenado (si existe)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
});

function fetchCharacterDetails(characterId) {
  const publicKey = "0299ad036fa9655c5ed46ab66088e486";
  const privateKey = "25be40de079c0af41e2e861c79e98a026e1e789b";
  const ts = new Date().getTime();
  const hash = md5(ts + privateKey + publicKey);
  const apiUrl = `https://gateway.marvel.com/v1/public/characters/${characterId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.data && data.data.results && data.data.results.length > 0) {
        const character = data.data.results[0];
        displayCharacterDetails(character);
        initializeTabs(character);
      } else {
        throw new Error("No se encontraron datos para este personaje.");
      }
    })
    .catch(error => {
      console.error("Error al obtener los detalles del personaje:", error);
      displayError("Hubo un error al cargar los detalles del personaje. Por favor, intenta de nuevo más tarde.");
    });
}

function displayCharacterDetails(character) {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) {
    console.error("Elemento 'mainContent' no encontrado");
    return;
  }

  // Actualizar la imagen del personaje
  const characterImage = mainContent.querySelector('.character-image img');
  characterImage.src = `${character.thumbnail.path}.${character.thumbnail.extension}`;
  characterImage.alt = character.name;

  // Actualizar los detalles del personaje
  const characterDetails = mainContent.querySelector('.character-details');
  characterDetails.innerHTML = `
    <h1>${character.name}</h1>
    <p class="alias">${character.name}</p>
    <div class="tags">
      ${character.series.items.slice(0, 2).map(series => `<span class="tag">${series.name}</span>`).join('')}
    </div>
    <div class="character-stats">
      <div class="stat">
        <span class="stat-label">Comics</span>
        <span class="stat-value">${character.comics.available}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Series</span>
        <span class="stat-value">${character.series.available}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Eventos</span>
        <span class="stat-value">${character.events.available}</span>
      </div>
    </div>
    <p class="character-description">${character.description || 'No hay descripción disponible para este personaje.'}</p>
  `;
}

function initializeTabs(character) {
  // Actualizar el contenido de la primera pestaña (comics)
  updateTabContent(character, 'comics');

  // Agregar event listeners a las pestañas
  const tabsContainer = document.querySelector('.tabs-container');
  tabsContainer.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateTabContent(character, tab.dataset.content);
    });
  });
}

function updateTabContent(character, contentType) {
  let items;
  switch (contentType) {
    case 'comics':
      items = character.comics.items;
      break;
    case 'series':
      items = character.series.items;
      break;
    case 'events':
      items = character.events.items;
      break;
    default:
      items = [];
  }

  const comicsGrid = document.getElementById('comicsGrid');
  comicsGrid.innerHTML = '<p>Cargando...</p>';

  // Obtener los detalles de cada ítem para incluir las imágenes
  const promises = items.map(item => {
    return fetch(item.resourceURI + `?apikey=0299ad036fa9655c5ed46ab66088e486`)
      .then(response => response.json())
      .then(data => {
        let result = data.data.results[0]; // La API regresa un array, tomamos el primer resultado
        return result;
      })
      .catch(error => {
        console.error('Error al cargar los detalles:', error);
        return null;
      });
  });

  // Esperar a que todas las promesas se resuelvan
  Promise.all(promises)
    .then(results => {
      const validResults = results.filter(result => result !== null);
      if (validResults.length === 0) {
        comicsGrid.innerHTML = '<p>No se encontraron elementos para mostrar.</p>';
      } else {
        comicsGrid.innerHTML = validResults.map(result => `
          <div class="comic">
            <img src="${result.thumbnail.path}.${result.thumbnail.extension}" alt="${result.title || result.name}">
            <p>${result.title || result.name}</p>
          </div>
        `).join('');
      }
    })
    .catch(error => {
      console.error('Error al cargar los detalles:', error);
      comicsGrid.innerHTML = '<p>Error al cargar el contenido.</p>';
    });
}

function displayError(message) {
  const mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
      </div>
    `;
  }
}
