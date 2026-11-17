// Load variables from .env (PORT, DISNEY_API_URL) into process.env.
// This must be the very first line so the other files can use them.
require('dotenv').config(); 
const express = require('express');
const path = require('path');

// Custom middleware and route definitions (MVC: routes -> controllers -> services)
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const indexRoutes = require('./routes/index');

// Create the Express application
const app = express();
// Port comes from .env; 3000 is the fallback if it is missing
const PORT = process.env.PORT || 3000;

// Use EJS as the template engine and tell Express where the views are
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Built-in middleware: serve CSS and images from the /public folder
app.use(express.static(path.join(__dirname, 'public')));
// Custom middleware: log every request (method, URL, status, time)
app.use(logger);
// Built-in middleware: read data sent by HTML forms
app.use(express.urlencoded({ extended: true }));


// All application routes
app.use('/', indexRoutes);


// 404 handler: runs only if no route above matched (must come after the routes)
app.use(notFound);
// Centralized error handler: must be registered last
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 
