// Controller: prepares data for the home page. Data comes from the service,
// the controller shapes it, and the EJS view displays it.
const disneyService = require('../services/disneyService');

// Characters shown on the home page
const FEATURED_NAMES = [
  'Mickey Mouse', 'Elsa', 'Simba', 'Stitch',
  'Mulan', 'Ariel', 'Olaf', 'Moana',
  'Vanellope von Schweetz', 'Aladdin', 'Nick Wild', 'Silvermist'
];

async function showHome(req, res, next) {
  try {

    // Request all characters in parallel. allSettled does not fail if one request fails,
    // so the page still works when a single character cannot be loaded.
    const results = await Promise.allSettled(
      FEATURED_NAMES.map((name) => disneyService.getCharacterByName(name))
    );

    // Keep only successful results and pick the fields the view needs
    const characters = results
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value)
      .map((c) => ({
        id: c._id,
        name: c.name,
        imageUrl: c.imageUrl || null,
        filmsCount: c.films.length,
        tvShowsCount: c.tvShows.length,
        videoGamesCount: c.videoGames.length
      }));

    // Render views/pages/home.ejs with the data
    res.render('pages/home', { title: 'Home', characters });
  } catch (err) {
    // Pass any error to the centralized error handler
    next(err);
  }
}

module.exports = { showHome }; 

