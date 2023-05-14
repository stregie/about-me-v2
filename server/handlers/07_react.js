const path = require('path');
const fs = require('fs');

exports.fileList = (req, res) => {
  let album = req.query.album;
  let dirpath = path.join(__dirname, '..', '..', '/public/images/', album);
  

  let filelist = [];
  fs.readdir(dirpath, (err, files) => {
    const images = files.filter(file => {
      let ext = path.extname(file).toLowerCase()
      return ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp';
    });
    images.forEach((imgfile, index) => {
      let stats = fs.statSync(dirpath + "/" + imgfile);
      filelist[index] = {
        fileindex: index,
        filename: imgfile,
        filesize: stats.size
      };
      // filelist[index].filesize = stats.size;
      // filelist[index] = {filename: imgfile};
      // let stats = fs.statSync(dirpath + "/" + imgfile);
      // filelist[index].filesize = stats.size;
    });
    res.json(filelist);
  });
};

exports.sendImage = (req, res) => {
  let album = req.params.album;
  let imgname = req.params.image;

  let sendFileOptions = {
    root: path.join(__dirname, '..', '/public/images/', album)
  };
  
  let imgpath = path.join(sendFileOptions.root, imgname);
  let imgExist = fs.existsSync(imgpath);
  if (imgExist) {
      res.sendFile(imgname, sendFileOptions, (err) => {
        if (err) {
          res.status(418)
          console.log("sendImage failed", err);
          res.end();
        } else {
          // console.log("Image sent successfully");
          res.end();
        }
      });
  } else {
    res.status(404)
    res.end(imgname, " not found.");
  }
};