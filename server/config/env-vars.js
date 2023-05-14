const path = require('path');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === "development") {
  dotenv.config({
    path: path.resolve(__dirname, '../../development.env')
  });
};