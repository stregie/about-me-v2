const fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const { pathToArray, listUniquePaths, readNode, insertNode } = require('./fileuploader-utils.js');
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = process.env.MONGODB_URL;
const AWS = require('@aws-sdk/client-s3');
const s3 = new AWS.S3;


const fileListExample = require('../assets/json/filelist-example.json');
const folderTreeExample = require('../assets/json/foldertree-example.json');

const awsFolder = 'about-me/fileuploaderVue/';

exports.fetchtest = (req, res) => {
  setTimeout(() => {
    res.send("Stuff from the server");
  }, 2000);
};

exports.upload = (req, res) => {
  const form = formidable({ multiples: true });

  const extensionOf = (filename) => {
    let lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) {
      return "N/A";
    } else {
      return filename.slice(filename.lastIndexOf('.') + 1);
    }
  };

  const pathPromise = new Promise((resolve) => {
    form.on('field', (fieldName, fieldValue) => {
      if (fieldName === "path") {
        console.log("form.on field path", fieldValue);
        resolve(fieldValue);
      }
    });    
  });

  form.parse(req, (err, fields, files) => {
    if (err) console.log('form.parse err', err);
  });

  form.on('file', async (formname, file) => {
    const path = await pathPromise;
    const fileMetaData = {
      "fileid": uuidv4(),
      "filename": file.originalFilename,
      "extension": extensionOf(file.originalFilename),
      "size": file.size,
      "path": path,
      "status": "available",
      "uploaddate": new(Date)
    }
    
    let awsKey = awsFolder + fileMetaData.fileid;
    fs.readFile(file.filepath, (err, data) => {
      if (err) console.log('readFile err', err);
      // console.log('readFile data', data);

      let awsParams = {
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: awsKey,
        Body: data
      };

      s3.putObject(awsParams, (err, data) => {
        if(err) {
          console.log(err);
          res.status(err.statusCode).send("Upload was not successful: " + err.code);
        } else {
          console.log(`S3: ${awsKey} uploaded successfully`);
          MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
            if (err) {
              console.log(err);
              res.status(502).send(`502: Delivery failed: database error.`);
            } else {
              let dbo = db.db("introduction-site");

              dbo.collection("fileuploader-files").insertOne(fileMetaData, function(err, result) {
                if (err) {
                  console.log(err);
                  res.status(502).send(`502: Delivery failed: database error.`);
                } else {
                  db.close();
                }
              });
            }
          });

          fs.unlink(file.filepath, (err) => {
            if (err) console.log('File deleted:', file.filepath);
          });
        };
      });
    });
  });
    
  form.once('end', () => {
    console.log('form.once end');
    res.send(`Files uploaded successfully.`);
  });
};

exports.filelist = (req, res) => {
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection("fileuploader-files").find({}).toArray(function(err, result) {
        if (err) {
          console.log(err);
          res.status(502).send(`502: Delivery failed: database error.`);
        } else {
          res.json(result);
          db.close();
        }
      });
    }
  });
};

exports.foldertree = (req, res) => {
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection("fileuploader-files").find({}).toArray(function(err, result) {
        if (err) {
          console.log(err);
          res.status(502).send(`502: Delivery failed: database error.`);
        } else {
          let tree = [];
          let uniquePaths = listUniquePaths(result);
          let pathArrayList = uniquePaths.map(pathString => {
            return pathToArray(pathString);
          });

          pathArrayList.forEach(pathArray => {
            let parentPathArray = [];
            for (let i = 0; i < pathArray.length; i++){
              let currentPathArray = pathArray.slice(0, i + 1);
              if (readNode(tree, currentPathArray) === null){
                let nodeToInsert = {
                  "name": pathArray[i],
                  "expanded": false,
                  "children": []
                }

                let newTree = insertNode(tree, parentPathArray, nodeToInsert);
                tree = newTree;
              }
              parentPathArray = pathArray.slice(0, i + 1);
            }
          });
          res.json(tree);
          db.close();
        }
      });
    }
  });
};

exports.download = (req, res) => {
  const fileid = req.query.id;
  const awsKey = awsFolder + fileid;
  const awsParams = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Key: awsKey
  };

  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection("fileuploader-files").findOne({'fileid': fileid}, function(err, fileMetaData) {
        if (err) {
          console.log(err);
          res.status(502).send(`502: Delivery failed: database error.`);
        } else {
          console.log("fileMetaData", fileMetaData);
          db.close();

          s3.getObject(awsParams, (err, data) => {
            console.log("GetObject");
            if (err) {
              console.log(err);
              res.status(err.statusCode).send("Download unsuccessful: " + err.code);
            } else {
              const tmpPath = `/tmp/${fileMetaData.filename}`;
              fs.writeFileSync(tmpPath, data.Body.toString());
              console.log("file written");
              
              res.download(tmpPath, (err) => {
                if (err) {
                  console.log(err);
                } else {
                  fs.unlink(tmpPath, (err) => {
                    if (err) {
                      console.log(err);
                    } else {
                    // console.log('temporary file deleted');
                    }
                  });
                }
              });
            }
          });

        };
      });
    }
  });
};

exports.deletefile = (req, res) => {
  const fileid = req.query.id;
  console.log("Delete", fileid);

  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection("fileuploader-files").updateOne({'fileid': fileid}, { $set: { status: 'trash' } }, function(err, fileMetaData) {
        if (err) {
          console.log(err);
          res.status(502).send(`502: Delivery failed: database error.`);
        } else {
          console.log("fileMetaData", fileMetaData);
          db.close();
          res.send("Fileid. " + fileid);
        }
      });
    }
  });
};

// Test stuff
exports.filelisttest = (req, res) => {
  res.json(fileListExample);
};

exports.foldertreetest = (req, res) => {
  let tree = [];
  let uniquePaths = listUniquePaths(fileListExample);
  let pathArrayList = uniquePaths.map(pathString => {
    return pathToArray(pathString);
  });

  pathArrayList.forEach(pathArray => {
    let parentPathArray = [];
    for (let i = 0; i < pathArray.length; i++){
      let currentPathArray = pathArray.slice(0, i + 1);
      if (readNode(tree, currentPathArray) === null){
        let nodeToInsert = {
          "name": pathArray[i],
          "expanded": false,
          "children": []
        }

        let newTree = insertNode(tree, parentPathArray, nodeToInsert);
        tree = newTree;
      }
      parentPathArray = pathArray.slice(0, i + 1);
    }
  });

  
  res.json(tree);
};



// 
// exports.fileList = (req, res) => {
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
// };
// 
// exports.upload = (req, res) => {
//   const form = formidable({ multiples: true });
// 
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
// };
// 
// exports.download = (req, res) => {
//   const fileName = req.query.name;
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
// };
// 
// exports.delete = (req, res) => {
//   const fileName = req.query.name;
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
// };