import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';
import { open, readFile, unlink } from 'node:fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import formidable from 'formidable';
import { del, head, list, put } from '@vercel/blob';
import { v4 as uuid } from 'uuid';
import { pathToArray, listUniquePaths, readNode, insertNode } from '../utils/filemanager-utils.js';


const mongoUrl = process.env.MONGODB_URL;
const dbName = 'introduction-site';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import fileListExample from '../assets/json/filelist-example.json' with { type: 'json' };
// import folderTreeExample from '../assets/json/foldertree-example.json' with { type: 'json' };


export const fetchtest = (req, res) => {
  setTimeout(() => {
    res.send("Stuff from the server");
  }, 2000);
};

export const extensionOf = (filename) => {
  let lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) {
    return "N/A";
  } else {
    return filename.slice(filename.lastIndexOf('.') + 1);
  }
};

// Instead sending multiple files in one request and separating them on server,
// Maybe each file should be sent in separate requests
export const checkIfFilesExist = async (req, res) => {
  const path = req.body.path;
  const filenames = req.body.filenames;
  
  let existingFiles = [];
  let nonExistingFiles = [];
  
  const client = new MongoClient(mongoUrl);
  

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("filemanager-files");

    for (let i = 0; i < filenames.length; i++){
      const fileExists = Boolean(await collection.findOne({path: path, filename: filenames[i]}));
      if(fileExists) {
        existingFiles.push(filenames[i]);
      } else {
        nonExistingFiles.push(filenames[i]);
      }
    };

    res.json({
      existingFiles: existingFiles,
      nonExistingFiles: nonExistingFiles
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Some error has happened"
    })

  }

};
// Uploads multiple files
export const upload = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const form = formidable( { multiples: true } );

  try {
    // Connect to database
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("filemanager-files");

    // Parse the incoming request
    const [fields, files] = await form.parse(req);
    const path = fields.path[0];
    let uploadedFiles = [];
    let existingFiles = [];
    
    for (let i = 0; i < files.file.length; i++){
      const fileid = uuid();
      const filename = files.file[i].originalFilename;
      const tempPath = files.file[i].filepath;
      const pathOnVercelStorage  = `about-me/filemanager-vue/${fileid}`;

      // Check if file exists already at this path
      // const fileExists = Boolean(await collection.findOne({path: path, filename: filename}));
      // if (fileExists) {
      //   existingFiles.push(filename);
      //   continue;
      // }
      
      // Upload files to Vercel Blob Storage
      const fileBlob = await readFile(tempPath);
      const vercelMetaData = await put(pathOnVercelStorage, fileBlob, { 
        access: 'public',
        addRandomSuffix: false,
        cacheControlMaxAge: 157680000,
        multipart: true
      });
      // console.log("Vercel response: ", vercelMetaData);

      // Create metadata entry in MongoDB
      const fileMetaData = {
        fileid: fileid,
        filename: filename,
        extension: extensionOf(filename),
        size: files.file[i].size,
        path: path,
        status: "available",
        uploaddate: new(Date),
        url: vercelMetaData.url,
        downloadUrl: vercelMetaData.downloadUrl
      }
      const mongoResponse = await collection.insertOne(fileMetaData);
      uploadedFiles.push(fileMetaData.filename);
      // console.log("mongoResponse: ", mongoResponse);

      // Remove the temporary file from server
      unlink(tempPath);
    }

    console.log({
      uploadedFiles: uploadedFiles,
      existingFiles: existingFiles
    });
    res.json({
      uploadedFiles: uploadedFiles,
      existingFiles: existingFiles
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.close();
  }
  
};

export const filelist = async (req, res) => {
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('filemanager-files');
    const result = await collection.find({}).toArray();
    res.json(result);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const foldertree = async (req, res) => {
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('filemanager-files');
    const result = await collection.find({}).toArray();
    console.log(result);

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
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const download = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const fileid = req.query.id;
  
  try {
    // Get file metadata from database
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('filemanager-files');
    const fileMetaData = await collection.findOne({fileid: fileid});
    if (!fileMetaData) {
      throw new Error(`File metadata not found in the database (id: ${fileid})`);
    };
    
    
    // Download from Vercel Blob storage
    const vercelResponse = await fetch(fileMetaData.url);
    if (vercelResponse.status === 404) {
      throw new Error(`${fileid} not found in the storage`);
    }
    
    // Send file as filestream as response with the proper filename
    res.setHeader('Content-Disposition', `attachment; filename="${fileMetaData.filename}"`);
    vercelResponse.body.pipe(res);
  } catch (error) {
    console.error('Error downloading file: ', error.message);
    res.status(500).send('Error downloading file');
  }
};

export const moveToTrash = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const fileid = req.query.id;
  const newvalues = {
    $set: {
      status: "trash",
      datetrashed: new Date()
    }
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('filemanager-files');
    const result = await collection.updateOne({'fileid': fileid}, newvalues);
    console.log(result);
    
    res.send(`${fileid} moved to Trash`);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const restoreFromTrash = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const fileid = req.query.id;
  const newvalues = {
    $set: {
      status: "available"
    },
    $unset: {
      datetrashed: ""
    }
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('filemanager-files');
    const result = await collection.updateOne({'fileid': fileid}, newvalues);
    console.log(result);
    
    res.send(`${fileid} moved to Trash`);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};


export const deleteFile = async (req, res) => {
  // res.send("Empty delete API works");
  const client = new MongoClient(mongoUrl);
  const fileid = req.query.id;
  console.log(fileid);
  
  try {
    // Get file metadata from database
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('filemanager-files');
    const fileMetaData = await collection.findOne({fileid: fileid});
    if (!fileMetaData) {
      throw new Error("File metadata not found in the database");
    };
    const blobUrl = fileMetaData.url;
    console.log(blobUrl);
    // console.log(fileMetaData);

    // Check if file exists then delete from Vercel Blob storage
    const blobDetails = await head(blobUrl);
    await del(blobUrl);
    // console.log(mongoResponse);

    // Delete entry from MongoDB
    const mongoResponse = await collection.deleteOne({fileid: fileid});

    // Send Response
    console.log(`${fileid} deleted`);
    res.send(`${fileid} deleted`);
  } catch (error) {
    console.log(error.message, blobUrl);
    if (error.message.includes("The requested blob does not exist")){
      res.status(404).send("This file does not exist.");
    } else {
      res.status(500).send("Unexpected error has occured.");
    }
  } finally {
    client.close();
  }
};

export const renameFile = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  
  const fileid = req.query.id;
  const newFileName = req.body.newFileName;
  const newExtension = req.body.newExtension;
  const newvalues = {
    $set: {
      filename: `${newFileName}.${newExtension}`,
      extension: newExtension
    }
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('filemanager-files');
    const result = await collection.updateOne({'fileid': fileid}, newvalues);
    console.log(result);
    
    res.send(`${fileid} renamed to ${newFileName}.${newExtension}`);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

// export const previewFile = async (req, res) => {
//   const client = new MongoClient(mongoUrl);
//   const fileid = req.query.id;
//   
//   try {
//     // Get file metadata from database
//     await client.connect();
//     const db = client.db(dbName);
//     const collection = db.collection('filemanager-files');
//     const fileMetaData = await collection.findOne({fileid: fileid});
//     if (!fileMetaData) {
//       throw new Error(`File metadata not found in the database (id: ${fileid})`);
//     };
//     
//     
//     // Download from Vercel Blob storage
//     const vercelResponse = await fetch(fileMetaData.url);
//     if (vercelResponse.status === 404) {
//       throw new Error(`${fileid} not found in the storage`);
//     }
//     
//     // Send file as filestream as response with the proper filename
//     res.setHeader('Content-Disposition', `attachment; filename="${fileMetaData.filename}"`);
//     vercelResponse.body.pipe(res);
//   } catch (error) {
//     console.error('Error downloading file: ', error.message);
//     res.status(500).send('Error downloading file');
//   }
// };


// APIs for helping development
export const filelisttest = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'assets', 'json', 'filelist-example.json');
    const fileListExample = readFile(filePath, 'utf8');
    res.json(fileListExample);
  } catch (error) {
    console.error(error);
    res.status(500).send(`An error has occured`);
  }
};

export const foldertreetest = async (req, res) => {
  try {

    const filePath = path.join(__dirname, '..', 'assets', 'json', 'filelist-example.json');
    const fileListExample = await readFile(filePath, 'utf8');
    let tree = [];
    let uniquePaths = listUniquePaths(JSON.parse(fileListExample));
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
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "An error has occured"})
  }
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