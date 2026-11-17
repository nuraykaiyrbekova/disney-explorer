const disneyService = require('../services/disneyService');

// How many characters are shown per page
const PAGE_SIZE = 12;

async function showCatalog(req, res, next) {
  try {
    // Values already checked and cleaned by validateCatalogQuery
    const { page, sort } = req.validated;

    // API request: one page of characters
    const result = await disneyService.getCharacters(page, PAGE_SIZE);
    const totalPages = result.info.totalPages;

    // A page number beyond the last page is a user mistake: show a clear message
    if (page > totalPages) {
      return res.status(400).render('pages/error', {
        title: 'Error',
        heading: 'Page not found',
        message: `Page ${page} does not exist. The last page is ${totalPages}.`
      });
    }

    // Process the data: keep only needed fields and count appearances
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


    // Sort on the server according to the user's choice
    if (sort === 'name') {
      characters.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      characters.sort((a, b) => b.totalAppearances - a.totalAppearances);
    }

    // Statistics for the summary row above the catalog (based on characters of the current page)
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

    // Render views/pages/characters.ejs
    res.render('pages/characters', {
      title: 'Characters',
      characters,
      page,
      totalPages,
      sort,
      stats
    });
  } catch (err) {
    // Pass any error to the centralized error handler
    next(err);
  }
}

module.exports = { showCatalog }; 

