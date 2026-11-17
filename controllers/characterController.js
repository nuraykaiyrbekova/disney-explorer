const disneyService = require('../services/disneyService');

async function showCharacter(req, res, next) {
  try {
    // ID already validated by validateCharacterId
    const { id } = req.validated;

    let c;
    try {
      c = await disneyService.getCharacterById(id);
    } catch (err) {
      // If the API says "not found", show a clear message to the user
      if (err.response && err.response.status === 404) {
        c = null;
      } else {
        throw err; // all other errors go to the centralized error handler
      }
    }

    if (!c) {
      return res.status(404).render('pages/error', {
        title: 'Not found',
        heading: 'Character not found',
        message: `There is no character with ID ${id}.`
      });
    }

    // Use empty lists if the API does not return a field
    const films = c.films || [];
    const shortFilms = c.shortFilms || [];
    const tvShows = c.tvShows || [];
    const videoGames = c.videoGames || [];
    const parkAttractions = c.parkAttractions || [];

    // Data for the view, including the total number of appearances
    const character = {
      id: c._id,
      name: c.name,
      imageUrl: c.imageUrl || null,
      films,
      shortFilms,
      tvShows,
      videoGames,
      parkAttractions,
      allies: c.allies || [],
      enemies: c.enemies || [],
      totalAppearances:
        films.length +
        shortFilms.length +
        tvShows.length +
        videoGames.length +
        parkAttractions.length
    };

    // Render views/pages/character.ejs
    res.render('pages/character', { title: character.name, character });
  } catch (err) {
    next(err);
  }
}

module.exports = { showCharacter }; 
