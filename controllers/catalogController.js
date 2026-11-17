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
      videoGamesCount: c.videoGames.length,
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

    // Статистика для ряда карточек над каталогом (по персонажам текущей страницы)
    let stats = null;
    if (characters.length > 0) {
      const top = characters.reduce((best, c) => (c.totalAppearances > best.totalAppearances ? c : best));
      const sum = characters.reduce((acc, c) => acc + c.totalAppearances, 0);
      stats = {
        shown: characters.length,
        topName: top.name,
        topCount: top.totalAppearances,
        average: (sum / characters.length).toFixed(1)
      };
    }

    res.render('pages/characters', {
      title: 'Characters',
      characters,
      page,
      totalPages,
      sort,
      stats
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { showCatalog }; 
