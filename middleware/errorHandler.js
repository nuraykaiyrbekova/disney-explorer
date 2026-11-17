// 404 handler: used when no route matches the URL
function notFound(req, res) {
  res.status(404).render('pages/error', {
    title: 'Page not found',
    heading: 'Page not found',
    message: `The page "${req.originalUrl}" does not exist.`
  });
}


// Centralized error handler (4 arguments: err, req, res, next).
// Any error passed with next(err) ends up here. It logs technical details to the
// console and shows the user a friendly page instead of a stack trace.
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);


  // If a response was already started, let Express close the connection
  if (res.headersSent) {
    return next(err);
  }

  // Default values for an unknown error
  let status = 500;
  let heading = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again later.';

  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    // Axios timeout: the Disney API did not answer in time
    
    status = 504;
    heading = 'Request timed out';
    message = 'The Disney API took too long to respond. Please try again.';
  } else if (err.response) {
    // The API answered with an error status (4xx or 5xx)
    
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
    // The request was sent but no answer came back (network problem)
    
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
