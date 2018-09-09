const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const keys = require('./keys');

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  password: keys.pgPassword,
  database: keys.pgDatabase,
  port: keys.pgPort
});

pgClient.on('error', () => {
  console.log('lost PG connection');
});

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(( err ) => {
    console.log(err);
  });


const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', ( req, res ) => {
  res.send('Hi');
});

app.get('/values/all', async ( req, res ) => {
  try {
    const values = await pgClient.query('SELECT * from values');
    res.json(values.rows);
  } catch ( err ) {
    console.log(err);
    throw err;
  }
});

app.get('/values/current', async ( req, res ) => {
  redisClient.hgetall('values', ( err, values ) => {
    if ( err ) {
      console.log(err);
      throw err;
    }
    res.json(values);
  });
});
app.post('/values', async ( req, res ) => {
  const { index } = req.body;
  if ( parseInt(index) > 40 ) {
    return res.status(422).send('Index too high');
  }
  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [ index ]);
  res.json({
    working: true
  });
});

const server = http.createServer(app);
server.listen(3000, ( err ) => {
  if ( err ) {
    throw err;
  }
  console.log('server started');
});
