const MongoClient = require('mongodb').MongoClient;
const mongoUrl = process.env.MONGODB_URL;

exports.submit = (req, res) => {
  let mongodat = {
    name: req.body.contactname,
    mail: req.body.contactmail,
    date: req.body.contactdate,
    company: req.body.contactcompany,
    message: req.body.contactmessage
  };

  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    let dbo = db.db('introduction-site');

    dbo.collection('contact-mails').insertOne(mongodat, function(err, result) {
      if (err) throw err;
      res.send("Message sent successfully");
      db.close();
    });
  });
};