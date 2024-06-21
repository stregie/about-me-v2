import fs from 'fs';
import formidable from 'formidable';
import path from 'path';
// const AWS = require('@aws-sdk/client-s3');
// const s3 = new AWS.S3;

// const awsFolder = 'about-me/fileuploader/';

export const fileList = (req, res) => {
  const fileList = [
    {
      Key: "sdvnlksdkfjlkweer",
      Name: "dummy-file-01.txt",
      Size: 0,
    },
    {
      Key: "ksdjkjvckljsdflkj",
      Name: "dummy-file-02.txt",
      Size: 0,
    },
    {
      Key: "mrjuvkembewpcewrl",
      Name: "dummy-file-03.txt",
      Size: 0,
    },
  ];

  res.json(fileList);
    
//   const awsParams = {
//     Bucket: process.env.CYCLIC_BUCKET_NAME
//   };
// 
//   s3.listObjects(awsParams, (err, data) => {
//     if(err) {
//       console.log(err);
//       res.status(err.statusCode).send(`Getting file list was unsuccessful: ${err.code}`);
//     } else {
//       const fileList = [];
//       data.Contents.filter((file) => {
//         return file.Key.match(awsFolder) !== null
//       }).forEach((file) => {
//         let lastChar = file.Key.charAt(file.Key.length - 1);
//         let notFolder = Boolean(lastChar != "/");
//         if (notFolder){
//           fileList.push({
//             Key: file.Key,
//             Name: file.Key.slice(awsFolder.length),
//             Size: file.Size
//           });
//         }
//       });
//       res.json(fileList);
//     }
//   });
};

export const uploadFile = (req, res) => {
  const form = formidable({ multiples: true });
  res.send("File upload API invoked");

//   form.parse(req, (err, fields, files) => {
//     if (err) console.log('form.parse err', err);
//     // console.log('form.parse files', files);
//     // console.log('form.parse files fired');
//   });
// 
//   form.on('file', (formname, file) => {
//     // console.log('form.on file.filepath', file.filepath);
//     // console.log('form.on file.originalFilename', file.originalFilename);
// 
//     let awsKey = awsFolder + file.originalFilename;
// 
//     fs.readFile(file.filepath, (err, data) => {
//       if (err) console.log('readFile err', err);
//       // console.log('readFile data', data);
// 
//       let awsParams = {
//         Bucket: process.env.CYCLIC_BUCKET_NAME,
//         Key: awsKey,
//         Body: data
//       };
// 
//       s3.putObject(awsParams, (err, data) => {
//         if(err) {
//           console.log(err);
//           res.status(err.statusCode).send("Upload was not successful: " + err.code);
//         } else {
//           console.log(`S3: ${awsKey} uploaded successfully`);
//         }
//       });
//     });
//   });
// 
//   form.once('end', () => {
//     // console.log('form.once end');
//     res.send(`Files uploaded successfully.`);
//   });
};

export const downloadFile = (req, res) => {
  const fileName = req.query.name;

  res.send("Download initiated");
//   const awsKey = awsFolder + fileName;
//   const tmpPath = `/tmp/${fileName}`;
// 
//   const params = {
//     Bucket: process.env.CYCLIC_BUCKET_NAME,
//     Key: awsKey
//   };
// 
//   s3.getObject(params, (err, data) => {
//     if (err) {
//       res.status(err.statusCode).send("Download unsuccessful: " + err.code);
//     } else {
//       fs.writeFileSync(tmpPath, data.Body.toString());
//       
//       res.download(tmpPath, (err) => {
//         if (err) {
//           console.log(err);
//         } else {
//           fs.unlink(tmpPath, (err) => {
//             if (err) console.log(err);
//           });
//           // console.log('temporary file deleted');
//         }
//       });
//     }
//   });
};

export const deleteFile = (req, res) => {
  const fileName = req.query.name;
  res.send("Delete initiated");
//   const awsKey = awsFolder + fileName;
// 
//   const awsParams = {
//     Bucket: process.env.CYCLIC_BUCKET_NAME,
//     Key: awsKey
//   };
// 
//   return s3.deleteObject(awsParams, (err, data) => {
//     if (err) {
//       console.log(err);
//       res.status(err.statusCode).send("Delete unsuccessful: " + err.code);
//     } else {
//       res.send(`${fileName} deleted.`);
//     }
//   });
};