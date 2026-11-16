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

  // Номер страницы: только целое положительное число
  if (!/^[1-9][0-9]*$/.test(rawPage)) {
    return renderError(res, 400, 'Page number must be a positive whole number.');
  }

  // Сортировка: только разрешённые значения
  if (!['name', 'appearances'].includes(sort)) {
    return renderError(res, 400, 'Sort option must be "name" or "appearances".');
  }

  // Сохраняем проверенные значения для контроллера
  req.validated = { page: Number(rawPage), sort };
  next();
}

module.exports = { validateCatalogQuery }; 