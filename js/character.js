// Función para regresar al buscador
function goBack() {
    window.history.back(); // Regresa a la página anterior
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
    window.location.href = '/page.html';
  });

// Toggle del tema
document.querySelector('.theme-toggle').addEventListener('click', () => {
  const themeIcon = document.querySelector('.theme-icon');  // Obtener el ícono

  // Obtener el tema actual
  const currentTheme = document.documentElement.getAttribute('data-theme');
  
  // Cambiar el tema
  if (currentTheme === 'dark') {
      // Cambiar el tema a claro
      document.documentElement.setAttribute('data-theme', 'light');
      // Cambiar el ícono a luna (🌙) para modo claro
      themeIcon.textContent = '🌙'; // Ícono para Modo Claro
  } else {
      // Cambiar el tema a oscuro
      document.documentElement.setAttribute('data-theme', 'dark');
      // Cambiar el ícono a sol (☀️) para modo oscuro
      themeIcon.textContent = '☀️'; // Ícono para Modo Oscuro
  }
});

// Al cargar la página, restaurar el tema almacenado (si existe)
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
  }
});
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
        <h1> ${character.name}</h1>
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
      <button class="tab active" data-content="comics">Comics</button>
      <button class="tab" data-content="series">Series</button>
      <button class="tab" data-content="events">Eventos</button>
  `;

  // Función para actualizar el contenido de la pestaña
  // Función para actualizar el contenido de la pestaña
  function updateTabContent(contentType) {
    let items;
    switch(contentType) {
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
        return fetch(item.resourceURI + `?apikey=0299ad036fa9655c5ed46ab66088e486`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                let result = data.data.results[0]; // La API regresa un array, tomamos el primer resultado
  
                // Reemplazar HTTP por HTTPS en la URL de la imagen
                if (result.thumbnail && result.thumbnail.path.startsWith('http://')) {
                    result.thumbnail.path = result.thumbnail.path.replace('http://', 'https://');
                } else if (result.thumbnail && !result.thumbnail.path.startsWith('https://')) {
                    result.thumbnail.path = 'https://' + result.thumbnail.path;
                }
                return result;
            })
            .catch(error => {
                console.error('Error al cargar los detalles:', error);
                return null; // En caso de error, retornar null para no romper la ejecución
            });
    });
  
    // Esperar a que todas las promesas se resuelvan
    Promise.all(promises)
        .then(results => {
            // Filtrar los resultados nulos (en caso de error en alguno de los ítems)
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