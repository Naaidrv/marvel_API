// /api/marvel.js
export default async function handler(req, res) {
    const publicKey = process.env.MARVEL_PUBLIC_KEY;
    const privateKey = process.env.MARVEL_PRIVATE_KEY;
    const ts = new Date().getTime();
    const hash = md5(ts + privateKey + publicKey);
    
    const apiUrl = `https://gateway.marvel.com/v1/public/characters/${req.query.characterId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!response.ok) {
        res.status(500).json({ error: "Error al cargar los datos del personaje" });
    } else {
        res.status(200).json(data);
    }
}