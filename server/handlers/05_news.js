import { MongoClient } from 'mongodb';

const mongoUrl = process.env.MONGODB_URL;
const dbName = 'introduction-site';



export const news = async (req, res) => {
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('news-articles');
    const result = await collection.find({}).toArray();

    const articleList = {newsList: result.reverse()}

    res.render('05a_news-main.ejs', articleList);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const newsArticle = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const id = req.params.articleid;

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('news-articles');
    const article = await collection.findOne({'metadata.id': id});
    
    res.render('05b_news-article-display.ejs', article);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const articleListEdit = async (req, res) => {
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db(dbName);
    const drafts = await db.collection('news-drafts').find({}).toArray();
    const published = await db.collection('news-articles').find({}).toArray();
    
    const data = {
      drafts: drafts.reverse(),
      published: published.reverse()
    };
    
    res.render('05c_newseditor-main.ejs', data);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const articleEdit = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const id = req.query.id;
  const collectionName = req.query.coll;
  // console.log(`articleEdit, id: ${id}; coll: ${collectionName}`);
  
  if (!id) {
    let data = {articleData: null}
    res.render('05d_newseditor-article-editor.ejs', data);
    return;
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.findOne({'metadata.id': id});
    const data = {
      articleData: result,
      db: collectionName
    }
    res.render('05d_newseditor-article-editor.ejs', data);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const checkID = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const id = req.query.id;
  const collectionName = req.query.coll;
  // console.log(`checkID, id: ${id}; coll: ${collectionName}`);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.findOne({'metadata.id': id});
    // console.log(result);

    if (result) {
      console.log("true");
      res.json(true);
    } else {
      console.log("false");
      res.json(false);
    }
  } catch(error) {
    console.error("catch error", error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const insertArticle = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const collectionName = req.query.coll;
  const article = req.body;
  // console.log("insertArticle");

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(article);
    // console.log(result);
    res.send("Article inserted to " + collectionName);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const updateArticle = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const collectionName = req.query.coll;
  const data = req.body;
  const id = data.metadata.id;
  const newvalues = {
    $set: {
      metadata: data.metadata,
      article: data.article      
    }
  }
  // console.log("updateArticle");

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.updateOne({'metadata.id': id}, newvalues);
    // console.log(result);
    res.send("Article updated in " + collectionName);
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};

export const deleteArticle = async (req, res) => {
  const client = new MongoClient(mongoUrl);
  const id = req.body.id;
  const collectionName = req.query.coll;
  // console.log("deleteArticle");

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.deleteOne({'metadata.id': id});
    // console.log(result);
    res.send('Document ID "' + id + '" deleted successfully!');
  } catch(error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    client.close();
  }
};