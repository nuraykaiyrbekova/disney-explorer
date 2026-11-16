const disneyService = require('../services/disneyService');

const FEATURED_NAMES = [
  'Mickey Mouse', 'Elsa', 'Simba', 'Stitch',
  'Mulan', 'Ariel', 'Olaf', 'Moana',
  'Vanellope von Schweetz', 'Aladdin', 'Nick Wild', 'Silvermist'
];

async function showHome(req, res, next) {
  try {

    const results = await Promise.allSettled(
      FEATURED_NAMES.map((name) => disneyService.getCharacterByName(name))
    );

    const characters = results
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value)
      .map((c) => ({
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