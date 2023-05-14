const MongoClient = require('mongodb').MongoClient;
const mongoUrl = process.env.MONGODB_URL;
// const fs = require('fs');


exports.home = (req, res) => {
  res.render('01_home.ejs', null);
};

exports.aboutme = (req, res) => {
  res.render('02_aboutme.ejs', null);
};

exports.contact = (req, res) => {
  res.render('03_contact.ejs', null);
};

exports.snake = (req, res) => {
  res.render('04_snake.ejs', null);
};

exports.fileuploader = (req, res) => {
  res.render('06_fileuploader.ejs', null);
};

exports.react = (req, res) => {
  res.render('07_react.ejs', null);
};