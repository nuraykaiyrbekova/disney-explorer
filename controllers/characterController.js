const disneyService = require('../services/disneyService');

async function showCharacter(req, res, next) {
  try {
    const { id } = req.validated;

    let c;
    try {
      c = await disneyService.getCharacterById(id);
    } catch (err) {
      // Если API ответило "не найдено", показываем понятное сообщение
      if (err.response && err.response.status === 404) {
        c = null;
      } else {
        throw err; // остальные ошибки уходят в общий обработчик
      }
    }

    if (!c) {
      return res.status(404).render('pages/error', {
        title: 'Not found',
        heading: 'Character not found',
        message: `There is no character with ID ${id}.`
      });
    }

    const films = c.films || [];
    const shortFilms = c.shortFilms || [];
    const tvShows = c.tvShows || [];
    const videoGames = c.videoGames || [];
    const parkAttractions = c.parkAttractions || [];

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

    res.render('pages/character', { title: character.name, character });
  } catch (err) {
    next(err);
  }
}

module.exports = { showCharacter }; 