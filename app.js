const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Временный маршрут для проверки
app.get('/', (req, res) => {
  res.send('Disney Explorer works!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 