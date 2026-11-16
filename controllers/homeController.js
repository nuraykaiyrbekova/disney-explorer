const disneyService = require('../services/disneyService');

async function showHome(req, res, next) {
  try {
    const result = await disneyService.getCharacters(1, 12);

    const characters = result.data.map((c) => ({
      id: c._id,
      name: c.name,
      imageUrl: c.imageUrl || null,
      filmsCount: c.films.length,
      tvShowsCount: c.tvShows.length
    }));

      res.render('pages/home', { title: 'Home', characters });
  } catch (err) {
    next(err);
  }
}

module.exports = { showHome };  