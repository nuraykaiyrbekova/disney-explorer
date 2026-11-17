// Custom middleware: logs method, URL, status code and response time for every request
function logger(req, res, next) {
  const start = Date.now();

  // Runs when the response has been sent, then prints one line to the console
  res.on('finish', () => {
    const ms = Date.now() - start;
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)`);
  });

  next();
}

module.exports = logger; 
