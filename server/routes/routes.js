import express from 'express';

import * as pages from '../handlers/01_pages.js';
import * as contact from '../handlers/03_contact.js';
import * as snake from '../handlers/04_snake.js';
import * as news from '../handlers/05_news.js';
import * as react from '../handlers/06_gallery-react.js';
import * as filemanager from '../handlers/07_filemanager-vue.js';

const router = express.Router();



// Pages
router.get('/', pages.home);
router.get('/aboutme/', pages.aboutme);
router.get('/snake/', pages.snake);
router.get('/news/', news.news);
router.get('/news/article/:articleid', news.newsArticle);
router.get('/news/editor/', news.articleListEdit);
router.get('/news/editor/edit/', news.articleEdit);
router.get('/filemanager/', pages.filemanagerVue);
router.get('/react/*', pages.react);



// APIs
router.post('/contact/submit/', contact.submit);

router.post('/snake/score/', snake.saveScore);
router.get('/snake/highscore/', snake.getHighscore);

router.get('/news/editor/checkid/', news.checkID);
router.post('/news/editor/article', news.insertArticle);
router.put('/news/editor/article', news.updateArticle);
router.delete('/news/editor/article', news.deleteArticle);


router.get('/reactapi/getfilelist/', react.fileList);
router.get('/reactapi/images/:album/:image', react.sendImage);

router.get('/vueapi/fetchtest', filemanager.fetchtest);
router.put('/vueapi/upload', filemanager.upload);
router.get('/vueapi/filelist', filemanager.filelist);
router.get('/vueapi/foldertree', filemanager.foldertree);
router.get('/vueapi/file', filemanager.download);
router.delete('/vueapi/file', filemanager.deleteFile);
router.post('/vueapi/move-to-trash', filemanager.moveToTrash);
router.post('/vueapi/restore-from-trash', filemanager.restoreFromTrash);
router.post('/vueapi/check-if-exists', filemanager.checkIfFilesExist);
router.post('/vueapi/rename-file', filemanager.renameFile);

router.get('/vueapi/filelisttest', filemanager.filelisttest);
router.get('/vueapi/foldertreetest', filemanager.foldertreetest);



export default router;

// import * as fileuploader from '../handlers/06_fileuploader.js';
// router.get('/fileuploader/', pages.fileuploader);
// router.get('/fileuploader/filelist', fileuploader.fileList);
// router.get('/fileuploader/file', fileuploader.downloadFile);
// router.post('/fileuploader/file', fileuploader.uploadFile);
// router.delete('/fileuploader/file', fileuploader.deleteFile);