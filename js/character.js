// Función para regresar al buscador
function goBack() {
    window.location.href = '/page.html';
}

document.addEventListener('DOMContentLoaded', () => {
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
    goBack();
  });

  // Toggle del tema
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.querySelector('.theme-icon');

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
  });

  // Restaurar el tema almacenado
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
});

// Constantes para las claves de la API de Marvel
const MARVEL_PUBLIC_KEY = "0299ad036fa9655c5ed46ab66088e486";
const MARVEL_PRIVATE_KEY = "25be40de079c0af41e2e861c79e98a026e1e789b";

function fetchCharacterDetails(characterId) {
  const ts = new Date().getTime();
  const hash = md5(ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY);
  
  const apiUrl = `https://gateway.marvel.com/v1/public/characters/${characterId}?ts=${ts}&apikey=${MARVEL_PUBLIC_KEY}&hash=${hash}`;
  
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
  characterImage.src = `${character.thumbnail.path}.${character.thumbnail.extension}`.replace('http:', 'https:');
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

  // Actualizar las pestañas y el contenido
  updateTabs(character);
}

function updateTabs(character) {
  const tabsContainer = document.querySelector('.tabs');
  const comicsGrid = document.querySelector('.comics-grid');

  // Actualizar las pestañas
  tabsContainer.innerHTML = `
    <button class="tab active" data-content="comics">Comics (${character.comics.available})</button>
    <button class="tab" data-content="series">Series (${character.series.available})</button>
    <button class="tab" data-content="events">Eventos (${character.events.available})</button>
  `;

  // Función para actualizar el contenido de la pestaña
  function updateTabContent(contentType) {
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

    // Limpiar el contenido actual
    comicsGrid.innerHTML = '<p>Cargando...</p>';

    // Obtener los detalles de cada ítem para incluir las imágenes
    const promises = items.map(item => {
      const resourceUrl = `${item.resourceURI}?ts=${ts}&apikey=${MARVEL_PUBLIC_KEY}&hash=${hash}`;
      return fetch(resourceUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then(data => data.data.results[0])
        .catch(error => {
          console.error(`Error al cargar el recurso ${item.resourceURI}:`, error);
          return null;
        });
    });

    // Esperar a que todas las promesas se resuelvan
    Promise.all(promises)
      .then(results => {
        comicsGrid.innerHTML = results
          .filter(result => result)
          .map(result => `
            <div class="comic">
              <img src="${result.thumbnail.path.replace('http:', 'https:')}.${result.thumbnail.extension}" 
                   alt="${result.title || result.name || 'Sin título'}">
              <p>${result.title || result.name || 'Sin título'}</p>
            </div>
          `).join('');

        if (!results.some(result => result)) {
          comicsGrid.innerHTML = '<p>No se encontraron elementos para mostrar.</p>';
        }
      })
      .catch(error => {
        console.error('Error al cargar los detalles:', error);
        comicsGrid.innerHTML = '<p>Error al cargar el contenido.</p>';
      });
  }

  // Inicializar con comics
  updateTabContent('comics');

  // Agregar event listeners a las pestañas
  tabsContainer.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateTabContent(tab.dataset.content);
    });
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