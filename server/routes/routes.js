const express = require ('express');
const router = express.Router();

const pages = require('../handlers/01_pages.js');
const contact = require('../handlers/03_contact.js');
const snake = require('../handlers/04_snake.js');
const news = require('../handlers/05_news.js');
const fileuploader = require('../handlers/06_fileuploader.js');
const fileuploaderVue = require('../handlers/06_fileuploader-vue.js');
const react = require('../handlers/07_gallery-react.js');



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
router.post('/news/editor/article', news.insert);
router.put('/news/editor/article', news.update);
router.delete('/news/editor/article', news.delete);

router.get('/fileuploader/filelist', fileuploader.fileList);
router.get('/fileuploader/file', fileuploader.download);
router.post('/fileuploader/file', fileuploader.upload);
router.delete('/fileuploader/file', fileuploader.delete);

router.get('/reactapi/getfilelist/', react.fileList);
router.get('/reactapi/images/:album/:image', react.sendImage);

router.get('/vueapi/fetchtest', fileuploaderVue.fetchtest);
router.put('/vueapi/upload', fileuploaderVue.upload);
router.get('/vueapi/filelist', fileuploaderVue.filelist);
router.get('/vueapi/foldertree', fileuploaderVue.foldertree);
router.get('/vueapi/file', fileuploaderVue.download);
router.delete('/vueapi/file', fileuploaderVue.deletefile);

router.get('/vueapi/filelisttest', fileuploaderVue.filelisttest);
router.get('/vueapi/foldertreetest', fileuploaderVue.foldertreetest);



module.exports = router;