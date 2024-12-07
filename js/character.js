// Función para regresar al buscador
function goBack() {
    window.history.back(); // Regresa a la página anterior
}

document.addEventListener('DOMContentLoaded', () => {
    const characterId = localStorage.getItem('selectedCharacterId');
  
    if (characterId) {
      fetchCharacterDetails(characterId);
    } else {
      // Si no hay ID, redirige de vuelta al buscador
      window.location.href = '/index.html';
    }
  });
  
  function fetchCharacterDetails(characterId) {
    const publicKey = "0299ad036fa9655c5ed46ab66088e486"; // Tu clave pública
    const privateKey = "25be40de079c0af41e2e861c79e98a026e1e789b"; // Tu clave privada
    const ts = new Date().getTime(); // Marca de tiempo actual
    
    // Generar hash MD5
    const hash = md5(ts + privateKey + publicKey);
    
    // URL con todos los parámetros necesarios
    const apiUrl = `https://gateway.marvel.com/v1/public/characters/${characterId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
    console.log("URL llamada:", apiUrl);
    
    // Realizar solicitud
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.data && data.data.results && data.data.results.length > 0) {
        const character = data.data.results[0];
        // Actualiza el contenido de la página aquí
        console.log('Datos obtenidos:', character);
displayCharacterDetails(character);
      } else {
        console.error("No se encontraron datos para este personaje.");
        bioContainer.innerHTML = "<p>No se encontraron datos para este personaje.</p>";
      }
    })
    .catch(error => console.error("Error al obtener los detalles del personaje:", error));
  }
  
  function displayCharacterDetails(character) {
    const mainContent = document.getElementById('mainContent');
  
    // Obtener detalles del personaje
    const img = character.thumbnail ? `<img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}" />` : '';
    const bio = character.description ? `<p>${character.description}</p>` : '<p>No hay biografía disponible para este personaje.</p>';
    const group = character.series ? `<p><strong>Grupo(s):</strong> ${character.series.items.map(series => series.name).join(', ')}</p>` : '';
    
    // Generar contenido dinámico
    mainContent.innerHTML = `
      <h2>${character.name}</h2>
      ${img}
      ${bio}
      ${group}
      <h3>Comics relacionados:</h3>
      <ul>
        ${character.comics.items.map(comic => `<li>${comic.name}</li>`).join('')}
      </ul>
      <h3>Eventos relacionados:</h3>
      <ul>
        ${character.events.items.map(event => `<li>${event.name}</li>`).join('')}
      </ul>
      <h3>Series relacionadas:</h3>
      <ul>
        ${character.series.items.map(series => `<li>${series.name}</li>`).join('')}
      </ul>
      <h3>Historias relacionadas:</h3>
      <ul>
        ${character.stories.items.map(story => `<li>${story.name}</li>`).join('')}
      </ul>
      <button id="goBack">Volver al Buscador</button>
    `;
  
    // Evento para volver al buscador
    document.getElementById('goBack').addEventListener('click', () => {
      window.location.href = '/index.html';  // O la URL del buscador
    });
  }
  
  
