const disneyService = require('../services/disneyService');

async function showSearch(req, res, next) {
  try {
    const { q, page } = req.validated;

    const { list, totalPages } = await disneyService.searchCharacters(q, page, 12);

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

    res.render('pages/search', {
      title: `Search: ${q}`,
      q,
      characters,
      page,
      totalPages
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { showSearch }; 
