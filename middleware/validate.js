function renderError(res, status, message) {
  return res.status(status).render('pages/error', {
    title: 'Error',
    heading: 'Invalid request',
    message
  });
}

function validateCatalogQuery(req, res, next) {
  const rawPage = req.query.page === undefined ? '1' : String(req.query.page);
  const sort = req.query.sort === undefined ? 'name' : String(req.query.sort);

  if (!/^[1-9][0-9]*$/.test(rawPage)) {
    return renderError(res, 400, 'Page number must be a positive whole number.');
  }

  if (!['name', 'appearances'].includes(sort)) {
    return renderError(res, 400, 'Sort option must be "name" or "appearances".');
  }

  req.validated = { page: Number(rawPage), sort };
  next();
}

function validateCharacterId(req, res, next) {
  const id = String(req.params.id);

  if (!/^[1-9][0-9]*$/.test(id)) {
    return renderError(res, 400, 'Character ID must be a positive whole number.');
  }

  req.validated = { id: Number(id) };
  next();
}

// Поисковый запрос: обязателен, 2-50 символов, буквы, пробелы, дефис, апостроф, точка
function validateSearch(req, res, next) {
  const q = req.query.q === undefined ? '' : String(req.query.q).trim();
  const rawPage = req.query.page === undefined ? '1' : String(req.query.page);

  if (q.length === 0) {
    return renderError(res, 400, 'Please enter a character name.');
  }

  if (q.length < 2 || q.length > 50) {
    return renderError(res, 400, 'Search text must be between 2 and 50 characters.');
  }

  if (!/^[\p{L}\s'.\-]+$/u.test(q)) {
    return renderError(
      res,
      400,
      'Search text can contain only letters, spaces, hyphens, apostrophes and periods.'
    );
  }

  if (!/^[1-9][0-9]*$/.test(rawPage)) {
    return renderError(res, 400, 'Page number must be a positive whole number.');
  }

  req.validated = { q, page: Number(rawPage) };
  next();
}

module.exports = {
  validateCatalogQuery,
  validateCharacterId,
  validateSearch
}; 