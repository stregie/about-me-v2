const path = require('path');
const envVars = require('./server/config/env-vars.js');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();

app.engine('ejs', ejs.__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'server', 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))

const routes = require('./server/routes/routes');
app.use('/', routes);

app.use(function (req, res, next) {
  res.status(404).render('00c_404', null);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}, Environment: ${process.env.NODE_ENV}`);
});