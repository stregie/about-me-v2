const express = require ('express');
const router = express.Router();


const pages = require('../handlers/01_pages.js');
const contact = require('../handlers/03_contact.js');
const snake = require('../handlers/04_snake.js');
const news = require('../handlers/05_news.js');
const fileuploader = require('../handlers/06_fileuploader.js');
const react = require('../handlers/07_react.js');
const redesign = require('../handlers/41_redesign.js');


// Pages
router.get('/', pages.home);
router.get('/aboutme/', pages.aboutme);
router.get('/snake/', pages.snake);
router.get('/contact/', pages.contact);
router.get('/news/', news.news);
router.get('/news/article/:articleid', news.newsArticle);
router.get('/news/editor/', news.articleListEdit);
router.get('/news/editor/edit/', news.articleEdit);
router.get('/fileuploader/', pages.fileuploader);
router.get('/react/*', pages.react);



// APIs
router.post('/contact/submit/', contact.submit);

router.post('/snake/score/', snake.saveScore);
router.get('/snake/highscore/', snake.getHighscore);

router.get('/news/editor/checkid/', news.checkID);
router.post('/news/editor/insert', news.insert);
router.post('/news/editor/update', news.update);
router.post('/news/editor/delete', news.delete);
router.get('/news/editor/images/', news.images);

router.get('/fileuploader/filelist', fileuploader.fileList);
router.put('/fileuploader/file', fileuploader.upload);
router.get('/fileuploader/file', fileuploader.download);
router.delete('/fileuploader/file', fileuploader.delete);

router.get('/reactapi/getfilelist/', react.fileList);
router.get('/reactapi/images/:album/:image', react.sendImage);


// Redesign
router.get('/redesign/', redesign.home);
router.get('/redesign/snake/', redesign.snake);
// router.get('/redesign/contact/', redesign.contact);
// router.get('/redesign/news/', news.news);
// router.get('/redesign/news/article/:articleid', news.newsArticle);
// router.get('/redesign/news/editor/', news.articleListEdit);
// router.get('/redesign/news/editor/edit/', news.articleEdit);
// router.get('/redesign/fileuploader/', redesign.fileuploader);
// router.get('/redesign/react/*', redesign.react);

router.get('/redesign/design01/', redesign.design01);
router.get('/redesign/design02/', redesign.design02);
router.get('/redesign/design03/', redesign.design03);

module.exports = router;