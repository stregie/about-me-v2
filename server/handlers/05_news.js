const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const mongoUrl = process.env.MONGODB_URL;

exports.news = (req, res) => {
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection("news-articles").find({}).toArray(function(err, result) {
        if (err) {
          console.log(err);
          res.status(502).send(`Delivery failed: database error.`);
        } else {
          let data = {newsList: result.reverse()}
          res.render('05a_news-main.ejs', data);
          db.close();
        }
      });
    }      
  });
};

exports.newsArticle = (req, res) => {
  let id = req.params.articleid;

  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection("news-articles").findOne({'metadata.id': id}, function(err, result) {
        if (err) {
          console.log(err);
          res.status(502).send(`502: Delivery failed: database error.`);
        } else {
          res.render('05b_news-article-display.ejs', result);
          db.close();
        }
      });
    }
  });
};

exports.articleListEdit = (req, res) => {
  var data = {};
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      const readDatabase = Promise.all([
        new Promise((resolve, reject) => {
          dbo.collection("news-drafts").find({}).toArray(function(err, result) {
            data.drafts = result.reverse();
            resolve("Drafts articles read from database");
          });
        }),

        new Promise((resolve, reject) => {
          dbo.collection("news-articles").find({}).toArray(function(err, result) {
            data.published = result.reverse();
            resolve("Published articles read from database");
          });
        })    
      ]).catch(err => console.log("Promise was rejected!", err));

      readDatabase.then(results => {
        data.responses = results;
        res.render('05c_newseditor-main.ejs', data);
        db.close();
      });
    }
  });
};

exports.articleEdit = (req, res) => {
  let id = req.query.id;
  let coll = req.query.db;
  if (!id){
    let data = {articleData: null}
    res.render('05d_newseditor-article-editor.ejs', data);
  } else {    
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
      if (err) {
        console.log(err);
        res.status(502).send(`502: Delivery failed: database error.`);
      } else {
        let dbo = db.db("introduction-site");

        dbo.collection(coll).findOne({'metadata.id': id}, function(err, result) {
          let data = {
            articleData: result,
            db: coll
          }
          // console.log(data);
          res.render('05d_newseditor-article-editor.ejs', data);
        });
      }
    });
  }
};

exports.checkID = (req, res) => {
  let id = req.query.id;
  let coll = req.query.db;

  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection(coll).findOne({'metadata.id': id}, function(err, result) {
        if(result){
          res.json(true);
        } else {
          res.json(false);
        }
      });
    }
  });
};

exports.insert = (req, res) => {
  let coll = req.query.db;
  let data = req.body;
  
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection(coll).insertOne(data, function(err, result) {
        if (err) {
          console.log(err);
          res.status(502).send(`502: Delivery failed: database error.`);
        } else {
          res.send("Article inserted to " + coll);
          db.close();
        }
      });
    }
  });
};

exports.update = (req, res) => {
  let coll = req.query.db;
  let data = req.body;
  let id = data.metadata.id;
  let newvalues = {
    $set: {
      metadata: data.metadata,
      article: data.article      
    }
  }
  
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection(coll).updateOne({'metadata.id': id}, newvalues, function(err, result) {
        if (err) {
          console.log(err);
          res.status(502).send(`502: Delivery failed: database error.`);
        } else {
          res.send("Article updated in " + coll);
          db.close();
        }
      });
    }
  });
};

exports.delete = (req, res) => {
  let id = req.body.id;
  let coll = req.query.db;

  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) {
      console.log(err);
      res.status(502).send(`502: Delivery failed: database error.`);
    } else {
      let dbo = db.db("introduction-site");

      dbo.collection(coll).deleteOne({'metadata.id': id}, function(err, result) {
        if (err) {
          console.log(err);
          res.status(502).send(`502: Delivery failed: database error.`);
        } else {
          res.send('Document ID "' + id + '" deleted successfully!');
          db.close();
        }
      });
    }
  });
};