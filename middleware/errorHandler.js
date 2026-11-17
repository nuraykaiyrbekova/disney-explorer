function notFound(req, res) {
  res.status(404).render('pages/error', {
    title: 'Page not found',
    heading: 'Page not found',
    message: `The page "${req.originalUrl}" does not exist.`
  });
}


function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);


  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let heading = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again later.';

  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    
    status = 504;
    heading = 'Request timed out';
    message = 'The Disney API took too long to respond. Please try again.';
  } else if (err.response) {
    
    const apiStatus = err.response.status;

    if (apiStatus === 429) {
      status = 429;
      heading = 'Too many requests';
      message = 'The Disney API rate limit was reached. Please wait a moment and try again.';
    } else if (apiStatus === 404) {
      status = 404;
      heading = 'Not found';
      message = 'The requested data was not found.';
    } else {
      status = 502;
      heading = 'Disney API problem';
      message = 'The Disney API is having problems right now. Please try again later.';
    }
  } else if (err.request) {
    
    status = 503;
    heading = 'Connection problem';
    message = 'Could not connect to the Disney API. Check your internet connection.';
  }

  res.status(status).render('pages/error', {
    title: heading,
    heading,
    message
  });
}

module.exports = { notFound, errorHandler }; 