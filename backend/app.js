const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./src/routes');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api', routes);

app.get(/^\/(?!api).*/, (req, res) => {
  const requestedPage = path.join(__dirname, '..', 'frontend', req.path);
  if (req.path.includes('.')) {
    return res.sendFile(requestedPage, (err) => {
      if (err) res.status(404).send('Arquivo não encontrado');
    });
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use(errorMiddleware);

module.exports = app;
