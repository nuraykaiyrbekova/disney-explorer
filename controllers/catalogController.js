const disneyService = require('../services/disneyService');

const PAGE_SIZE = 12;

async function showCatalog(req, res, next) {
  try {
    const { page, sort } = req.validated;

    const result = await disneyService.getCharacters(page, PAGE_SIZE);
    const totalPages = result.info.totalPages;

    if (page > totalPages) {
      return res.status(400).render('pages/error', {
        title: 'Error',
        heading: 'Page not found',
        message: `Page ${page} does not exist. The last page is ${totalPages}.`
      });
    }

    let characters = result.data.map((c) => ({
      id: c._id,
      name: c.name,
      imageUrl: c.imageUrl || null,
      filmsCount: c.films.length,
      tvShowsCount: c.tvShows.length,
      totalAppearances:
        c.films.length +
        c.shortFilms.length +
        c.tvShows.length +
        c.videoGames.length +
        c.parkAttractions.length
    }));


    if (sort === 'name') {
      characters.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      characters.sort((a, b) => b.totalAppearances - a.totalAppearances);
    }

    res.render('pages/characters', {
      title: 'Characters',
      characters,
      page,
      totalPages,
      sort
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { showCatalog }; 