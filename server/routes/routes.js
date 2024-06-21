import express from 'express';

import * as pages from '../handlers/01_pages.js';
import * as contact from '../handlers/03_contact.js';
import * as snake from '../handlers/04_snake.js';
import * as news from '../handlers/05_news.js';
import * as fileuploader from '../handlers/06_fileuploader.js';
// import * as fileuploaderVue from '../handlers/06_fileuploader-vue.js';
import * as react from '../handlers/07_gallery-react.js';

const router = express.Router();



// Pages
router.get('/', pages.home);
router.get('/aboutme/', pages.aboutme);
router.get('/snake/', pages.snake);
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
router.post('/news/editor/article', news.insertArticle);
router.put('/news/editor/article', news.updateArticle);
router.delete('/news/editor/article', news.deleteArticle);

router.get('/fileuploader/filelist', fileuploader.fileList);
router.get('/fileuploader/file', fileuploader.downloadFile);
router.post('/fileuploader/file', fileuploader.uploadFile);
router.delete('/fileuploader/file', fileuploader.deleteFile);

router.get('/reactapi/getfilelist/', react.fileList);
router.get('/reactapi/images/:album/:image', react.sendImage);
// 
// router.get('/vueapi/fetchtest', fileuploaderVue.fetchtest);
// router.put('/vueapi/upload', fileuploaderVue.upload);
// router.get('/vueapi/filelist', fileuploaderVue.filelist);
// router.get('/vueapi/foldertree', fileuploaderVue.foldertree);
// router.get('/vueapi/file', fileuploaderVue.download);
// router.delete('/vueapi/file', fileuploaderVue.deletefile);
// 
// router.get('/vueapi/filelisttest', fileuploaderVue.filelisttest);
// router.get('/vueapi/foldertreetest', fileuploaderVue.foldertreetest);



export default router;