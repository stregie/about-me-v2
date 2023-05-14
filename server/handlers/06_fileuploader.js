const fs = require('fs');
const formidable = require('formidable');
const path = require('path');

const AWS = require('aws-sdk');
const s3 = new AWS.S3;

const awsFolder = 'about-me/fileuploader/';

exports.fileList = (req, res) => {
  const awsParams = {
    Bucket: process.env.AWS_BUCKET
  };

  s3.listObjects(awsParams, (err, data) => {
    if(err) {
      console.log(err);
      res.status(err.statusCode).send(`Getting file list was unsuccessful: ${err.code}`);
    } else {
      const fileList = [];
      data.Contents.filter((file) => {
        return file.Key.match(awsFolder) !== null
      }).forEach((file) => {
        let lastChar = file.Key.charAt(file.Key.length - 1);
        let notFolder = Boolean(lastChar != "/");
        if (notFolder){
          fileList.push({
            Key: file.Key,
            Name: file.Key.slice(awsFolder.length),
            Size: file.Size
          });
        }
      });
      res.json(fileList);
    }
  });
};

exports.upload = (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) console.log('form.parse err', err);
    console.log('form.parse files', files);
    console.log('form.parse files fired');
  });

  form.on('file', (formname, file) => {
    console.log('form.on file.filepath', file.filepath);
    console.log('form.on file.originalFilename', file.originalFilename);

    let awsKey = awsFolder + file.originalFilename;

    fs.readFile(file.filepath, (err, data) => {
      console.log('readFile err', err);
      console.log('readFile data', data);

      let awsParams = {
        Bucket: process.env.AWS_BUCKET,
        Key: awsKey,
        Body: data
      };

      s3.upload(awsParams, (err, data) => {
        if(err) {
          console.log(err);
          res.status(err.statusCode).send("Upload was not successful: " + err.code);
        } else {
          console.log(`S3: ${awsKey} uploaded successfully`);
        }
      });
    });
  })

  form.once('end', () => {
    console.log('form.once end');
    res.send(`Files uploaded successfully.`);
  });
};

exports.download = (req, res) => {
  const fileName = req.query.name;
  const awsKey = awsFolder + fileName;
  const tmpPath = `/tmp/${fileName}`;

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: awsKey
  };

  s3.getObject(params, (err, data) => {
    if (err) {
      console.log(err);
      res.status(err.statusCode).send("Download unsuccessful: " + err.code);
    } else {
      fs.writeFileSync(tmpPath, data.Body);
      
      res.download(tmpPath, (err) => {
        if (err) {
          console.log(err);
        } else {
          fs.unlink(tmpPath, (err) => {
            if (err) console.log(err);
          });
          console.log('temporary file deleted');
        }
      });
    }
  });
};

exports.delete = (req, res) => {
  const fileName = req.query.name;
  const awsKey = awsFolder + fileName;

  const awsParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: awsKey
  };

  return s3.deleteObject(awsParams, (err, data) => {
    if (err) {
      console.log(err);
      res.status(err.statusCode).send("Delete unsuccessful: " + err.code);
    } else {
      res.send(`${fileName} deleted.`);
    }
  });
};