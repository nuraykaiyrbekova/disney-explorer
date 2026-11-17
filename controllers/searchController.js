const disneyService = require('../services/disneyService');

async function showSearch(req, res, next) {
  try {
    // Search text and page number, already validated
    const { q, page } = req.validated;

    // API request: search characters by name
    const { list, totalPages } = await disneyService.searchCharacters(q, page, 12);

    // Keep needed fields and sort results alphabetically
    const characters = list
      .map((c) => ({
        id: c._id,
        name: c.name,
        imageUrl: c.imageUrl || null,
        filmsCount: (c.films || []).length,
        tvShowsCount: (c.tvShows || []).length,
        videoGamesCount: (c.videoGames || []).length
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Render views/pages/search.ejs (it shows a 'no results' message for an empty list)
    res.render('pages/search', {
      title: `Search: ${q}`,
      q,
      characters,
      page,
      totalPages
    });
  } catch (err) {
    // Pass any error to the centralized error handler
    next(err);
  }
}

module.exports = { showSearch }; 

