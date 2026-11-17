function logger(req, res, next) {
  const start = Date.now();

  // Когда ответ отправлен, пишем строку в консоль
  res.on('finish', () => {
    const ms = Date.now() - start;
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)`);
  });

  next();
}

module.exports = logger; 