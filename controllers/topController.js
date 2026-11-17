// Controller for the Top page: loads popular characters, calculates the total number
// of appearances for each one and shows the 10 with the most.
const disneyService = require('../services/disneyService');


const CANDIDATES = [
  'Mickey Mouse', 'Minnie Mouse', 'Donald Duck', 'Goofy', 'Pluto',
  'Winnie the Pooh', 'Simba', 'Elsa', 'Anna', 'Olaf',
  'Stitch', 'Ariel', 'Belle', 'Mulan', 'Moana',
  'Aladdin', 'Jasmine', 'Rapunzel', 'Cinderella', 'Snow White',
  'Buzz Lightyear', 'Woody', 'Genie', 'Baloo', 'Peter Pan',
  'Tinker Bell', 'Maleficent', 'Hercules', 'Tarzan', 'Pocahontas'
];

// How many characters are shown in the ranking
const TOP_SIZE = 10;
const CACHE_MS = 10 * 60 * 1000; // 10 minutes


// Simple in-memory cache: the ranking needs 30 API requests, so the result is
// reused for 10 minutes to keep the page fast and avoid API rate limits
let cache = { time: 0, data: null };

// Build the ranking (or return the cached one)
async function loadRanking() {
  if (cache.data && Date.now() - cache.time < CACHE_MS) {
    return cache.data;
  }


  const results = await Promise.allSettled(
    CANDIDATES.map((name) => disneyService.getCharacterByName(name))
  );


  // If every request failed, the API is down: pass the error on to the error handler
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length === results.length) {
    throw failed[0].reason;
  }

  // Remove duplicates, calculate totals, sort from most to least, take the top 10
  const seen = new Set();
  const ranking = results
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value)
    .filter((c) => {
      
      if (seen.has(c._id)) return false;
      seen.add(c._id);
      return true;
    })
    .map((c) => {
      const films = (c.films || []).length + (c.shortFilms || []).length;
      const tvShows = (c.tvShows || []).length;
      const videoGames = (c.videoGames || []).length;
      const attractions = (c.parkAttractions || []).length;
      return {
        id: c._id,
        name: c.name,
        imageUrl: c.imageUrl || null,
        films,
        tvShows,
        videoGames,
        attractions,
        total: films + tvShows + videoGames + attractions
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    .slice(0, TOP_SIZE);

  cache = { time: Date.now(), data: ranking };
  return ranking;
}

// Handler for GET /top
async function showTop(req, res, next) {
  try {
    const ranking = await loadRanking();
    // The biggest total is used to draw the progress bars in the view
    const maxTotal = ranking.length ? ranking[0].total : 0;

    res.render('pages/top', {
      title: 'Top characters',
      ranking,
      maxTotal,
      candidatesCount: CANDIDATES.length
    });
  } catch (err) {
    // Pass any error to the centralized error handler
    next(err);
  }
}

module.exports = { showTop }; 
