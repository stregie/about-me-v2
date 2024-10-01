import pg from 'pg';
const { Client } = pg;
const pgConfig = process.env.POSTGRES_URL;
const client = new Client(pgConfig);

export const saveScore = async (req, res) => {
  let data = req.body;
  let sqlQuery = {
    text: 'INSERT INTO snake_highscore (Player, Score, Speed) VALUES($1, $2, $3);',
    values: [data.player, data.score, data.speed]
  };

  try {
    await client.connect();
    const result = await client.query(sqlQuery);
    res.send("Score recorded to database");
  } catch (error) {
    console.error(error);
    res.status(502).send("Database error");;
  } finally {
    await client.end();
  }
};

export const getHighscore = async (req, res) => {
  let sqlQuery = 'SELECT * FROM snake_highscore ORDER BY Score DESC, Speed DESC, ID DESC LIMIT 10;';

  try {
    await client.connect();
    const result = await client.query(sqlQuery);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(502).json({ message: 'Database error' });
  } finally {
    await client.end();
  }
};