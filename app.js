require('dotenv').config(); 
const express = require('express');
const path = require('path');

const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(logger);
app.use(express.urlencoded({ extended: true }));


app.use('/', indexRoutes);


app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 