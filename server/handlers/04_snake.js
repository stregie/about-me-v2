import pg from 'pg';
const { Client } = pg;
const pgConfig = process.env.POSTGRES_URL;

export const saveScore = (req, res) => {
  let data = req.body;
  let sqlQuery = {
    text: 'INSERT INTO snake_highscore (Player, Score, Speed) VALUES($1, $2, $3);',
    values: [data.player, data.score, data.speed]
  };

  const client = new Client(pgConfig);
  client.connect();

  client.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err.stack);
      res.send("not ok");
    } else {
      res.send("Score recorded to database");
    }

    client.end();
  });
};

export const getHighscore = (req, res) => {
  let sqlQuery = 'SELECT * FROM snake_highscore ORDER BY Score DESC, Speed DESC, ID DESC LIMIT 10;';

  const client = new Client(pgConfig);
  client.connect();

  client.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err)
      res.json({
        message: "Something is not ok."
      });
    } else {
      // console.log(result.rows);
      res.json(result.rows);
    }

    client.end();
  });
};