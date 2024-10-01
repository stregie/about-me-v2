export const home = (req, res) => {
  res.render('01_home.ejs', null);
};

export const aboutme = (req, res) => {
  res.render('02_aboutme.ejs', null);
};

export const contact = (req, res) => {
  res.render('03_contact.ejs', null);
};

export const snake = (req, res) => {
  res.render('04_snake.ejs', null);
};

// news and news editor at 05_news.js

export const react = (req, res) => {
  res.render('06_react.ejs', null);
};

export const filemanagerVue = (req, res) => {
  res.render('07_filemanager-vue.ejs', null);
};