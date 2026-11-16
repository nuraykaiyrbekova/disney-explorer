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

// ID персонажа: только положительное целое число
function validateCharacterId(req, res, next) {
  const id = String(req.params.id);

  if (!/^[1-9][0-9]*$/.test(id)) {
    return renderError(res, 400, 'Character ID must be a positive whole number.');
  }

  req.validated = { id: Number(id) };
  next();
}

module.exports = { validateCatalogQuery, validateCharacterId }; 