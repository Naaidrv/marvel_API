// api/marvel.js

export default async function handler(req, res) {
    // Usamos las variables de entorno en el backend (servidor)
    const publicKey = process.env.MARVEL_PUBLIC_KEY;
    const privateKey = process.env.MARVEL_PRIVATE_KEY;
  
    try {
      // Hacemos la llamada a la API de Marvel
      const response = await fetch(`https://gateway.marvel.com/v1/public/characters?apikey=${publicKey}`);
      
      // Si la respuesta es exitosa, procesamos la data
      if (!response.ok) {
        return res.status(500).json({ error: 'Error al obtener los datos de Marvel' });
      }
  
      const data = await response.json();
      
      // Respondemos con los datos al frontend
      res.status(200).json(data);
    } catch (error) {
      console.error('Error en la llamada a la API:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  