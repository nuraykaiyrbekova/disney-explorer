const disneyService = require('../services/disneyService');

// Categories that are compared (key = field name in the API data)
const CATEGORIES = [
  { key: 'films', label: 'Films' },
  { key: 'shortFilms', label: 'Short films' },
  { key: 'tvShows', label: 'TV shows' },
  { key: 'videoGames', label: 'Video games' },
  { key: 'parkAttractions', label: 'Park attractions' }
];

// Find a character by name: exact match first, otherwise the first result
async function findByName(name) {
  const { list } = await disneyService.searchCharacters(name, 1, 20);
  if (list.length === 0) return null;
  const exact = list.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return exact || list[0];
}

// Get a character by ID; return null if the API answers 404
async function findById(id) {
  try {
    return await disneyService.getCharacterById(id);
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    throw err;
  }
}

// Convert API data to a simple shape (empty lists instead of undefined) and count the total
function toView(c) {
  const view = {
    id: c._id,
    name: c.name,
    imageUrl: c.imageUrl || null
  };
  let total = 0;
  CATEGORIES.forEach((cat) => {
    view[cat.key] = c[cat.key] || [];
    total += view[cat.key].length;
  });
  view.total = total;
  return view;
}

// Items that appear in both lists (for example films with both characters)
function shared(listA, listB) {
  return listA.filter((item) => listB.includes(item));
}

async function showCompare(req, res, next) {
  try {
    const v = req.validated;

    // Mode 'form': just show the empty form
    if (v.mode === 'form') {
      return res.render('pages/compare', {
        title: 'Compare', message: null, a: '', b: '', result: null
      });
    }

    // Mode 'names': find both characters by name, then redirect to /compare?ids=...
    if (v.mode === 'names') {
      const [nameA, nameB] = v.names;
      const [charA, charB] = await Promise.all([findByName(nameA), findByName(nameB)]);

      const missing = !charA ? nameA : !charB ? nameB : null;
      if (missing) {
        return res.status(404).render('pages/compare', {
          title: 'Compare',
          message: `No character found for "${missing}".`,
          a: nameA, b: nameB, result: null
        });
      }
      if (charA._id === charB._id) {
        return res.status(400).render('pages/compare', {
          title: 'Compare',
          message: 'Both names point to the same character. Please choose two different ones.',
          a: nameA, b: nameB, result: null
        });
      }
      return res.redirect(`/compare?ids=${charA._id},${charB._id}`);
    }

    // Mode 'ids': load both characters in parallel and compare them
    const [rawA, rawB] = await Promise.all(v.ids.map(findById));
    if (!rawA || !rawB) {
      return res.status(404).render('pages/error', {
        title: 'Not found',
        heading: 'Character not found',
        message: 'One of the characters does not exist.'
      });
    }

    const left = toView(rawA);
    const right = toView(rawB);

    // Build one table row per category and decide who has more
    const rows = CATEGORIES.map((cat) => {
      const l = left[cat.key].length;
      const r = right[cat.key].length;
      return {
        label: cat.label,
        left: l,
        right: r,
        winner: l > r ? 'left' : r > l ? 'right' : 'tie'
      };
    });

    // Last row: total appearances
    rows.push({
      label: 'Total appearances',
      left: left.total,
      right: right.total,
      winner: left.total > right.total ? 'left' : right.total > left.total ? 'right' : 'tie'
    });

    // Everything the view needs: both characters, rows and shared items
    const result = {
      left,
      right,
      rows,
      sharedFilms: shared(left.films, right.films),
      sharedTvShows: shared(left.tvShows, right.tvShows),
      sharedGames: shared(left.videoGames, right.videoGames)
    };

    res.render('pages/compare', {
      title: `${left.name} vs ${right.name}`,
      message: null,
      a: left.name,
      b: right.name,
      result
    });
  } catch (err) {
    // Pass any error to the centralized error handler
    next(err);
  }
}

module.exports = { showCompare }; 
