import { MongoClient } from 'mongodb';
const mongoUrl = process.env.MONGODB_URL;

export const submit = (req, res) => {
  let mongodat = {
    name: req.body.contactname,
    mail: req.body.contactmail,
    date: req.body.contactdate,
    company: req.body.contactcompany,
    message: req.body.contactmessage
  };

  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    if (err){
      console.log(err);
      res.status(502).send(`Delivery failed: database error.`);
    } else {
      let dbo = db.db('introduction-site');

      dbo.collection('contact-mails').insertOne(mongodat, function(err, result) {
        if (err) {
          console.log(err);
          res.status(502).send(`Delivery failed: database error.`);
        } else {
          res.send("Message was sent successfully.");
          db.close();
        }
      });
    }
  });
};