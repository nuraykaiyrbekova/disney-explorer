// Helper: show the error page with a status code and a message
function renderError(res, status, message) {
  return res.status(status).render('pages/error', {
    title: 'Error',
    heading: 'Invalid request',
    message
  });
}

// Validates ?page and ?sort for the catalog. Missing values get defaults.
function validateCatalogQuery(req, res, next) {
  const rawPage = req.query.page === undefined ? '1' : String(req.query.page);
  const sort = req.query.sort === undefined ? 'name' : String(req.query.sort);

  // Regular expression: positive whole number only (no zero, letters or minus sign)
  if (!/^[1-9][0-9]*$/.test(rawPage)) {
    return renderError(res, 400, 'Page number must be a positive whole number.');
  }

  if (!['name', 'appearances'].includes(sort)) {
    return renderError(res, 400, 'Sort option must be "name" or "appearances".');
  }

  // Save cleaned values (numbers, not strings) for the controller
  req.validated = { page: Number(rawPage), sort };
  next();
}

// Validates the :id part of /character/:id
function validateCharacterId(req, res, next) {
  const id = String(req.params.id);

  if (!/^[1-9][0-9]*$/.test(id)) {
    return renderError(res, 400, 'Character ID must be a positive whole number.');
  }

  req.validated = { id: Number(id) };
  next();
}

// Validates the search text (?q) and page number
function validateSearch(req, res, next) {
  const q = req.query.q === undefined ? '' : String(req.query.q).trim();
  const rawPage = req.query.page === undefined ? '1' : String(req.query.page);

  if (q.length === 0) {
    return renderError(res, 400, 'Please enter a character name.');
  }

  if (q.length < 2 || q.length > 50) {
    return renderError(res, 400, 'Search text must be between 2 and 50 characters.');
  }

  // Allowed characters: letters of any language, spaces, hyphens, apostrophes and periods
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

// Validates /compare. Three modes: two IDs, two names, or just show the form
function validateCompare(req, res, next) {
  const { ids, a, b } = req.query;

  // Mode 1: two IDs, for example ?ids=308,317
  if (ids !== undefined) {
    const parts = String(ids).split(',').map((s) => s.trim());

    if (parts.length !== 2 || !parts.every((p) => /^[1-9][0-9]*$/.test(p))) {
      return renderError(res, 400, 'Compare needs exactly two character IDs, for example ids=308,317.');
    }
    if (parts[0] === parts[1]) {
      return renderError(res, 400, 'Please choose two different characters.');
    }

    req.validated = { mode: 'ids', ids: parts.map(Number) };
    return next();
  }

  // Mode 2: two names from the form, ?a=name&b=name
  if (a !== undefined || b !== undefined) {
    const names = [a, b].map((v) => (v === undefined ? '' : String(v).trim()));

    for (const name of names) {
      if (name.length < 2 || name.length > 50) {
        return renderError(res, 400, 'Each name must be between 2 and 50 characters.');
      }
      if (!/^[\p{L}\s'.\-]+$/u.test(name)) {
        return renderError(
          res,
          400,
          'Names can contain only letters, spaces, hyphens, apostrophes and periods.'
        );
      }
    }
    if (names[0].toLowerCase() === names[1].toLowerCase()) {
      return renderError(res, 400, 'Please choose two different characters.');
    }

    req.validated = { mode: 'names', names };
    return next();
  }

  // Mode 3: no parameters, just show the empty form
  req.validated = { mode: 'form' };
  next();
}

module.exports = {
  validateCatalogQuery,
  validateCharacterId,
  validateSearch,
  validateCompare
}; 
