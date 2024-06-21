import 'dotenv/config';
import express from 'express';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import routes from './server/routes/routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine('ejs', ejs.__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'server', 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

app.use('/', routes);

app.use(function (req, res, next) {
  res.status(404).render('00c_404', null);
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}, Environment: ${process.env.NODE_ENV}`);
});

export default app;