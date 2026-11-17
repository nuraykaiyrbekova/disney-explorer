const disneyService = require('../services/disneyService');

const CATEGORIES = [
  { key: 'films', label: 'Films' },
  { key: 'shortFilms', label: 'Short films' },
  { key: 'tvShows', label: 'TV shows' },
  { key: 'videoGames', label: 'Video games' },
  { key: 'parkAttractions', label: 'Park attractions' }
];

// Найти персонажа по имени: сначала точное совпадение, иначе первый результат
async function findByName(name) {
  const { list } = await disneyService.searchCharacters(name, 1, 20);
  if (list.length === 0) return null;
  const exact = list.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return exact || list[0];
}

// Получить персонажа по ID; если API ответило 404, вернуть null
async function findById(id) {
  try {
    return await disneyService.getCharacterById(id);
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    throw err;
  }
}

// Привести данные API к удобному виду (пустые списки вместо undefined)
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

function shared(listA, listB) {
  return listA.filter((item) => listB.includes(item));
}

async function showCompare(req, res, next) {
  try {
    const v = req.validated;

    // Только форма
    if (v.mode === 'form') {
      return res.render('pages/compare', {
        title: 'Compare', message: null, a: '', b: '', result: null
      });
    }

    // Имена из формы: находим персонажей и перенаправляем на ?ids=
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

    // Два ID: сравниваем
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

    rows.push({
      label: 'Total appearances',
      left: left.total,
      right: right.total,
      winner: left.total > right.total ? 'left' : right.total > left.total ? 'right' : 'tie'
    });

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
    next(err);
  }
}

module.exports = { showCompare }; 