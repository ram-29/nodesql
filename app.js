const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const path = require('path');

// Environment variables
const PORT = 3000;
const HOST = 'localhost';
const DIALECT = 'mysql';
const DB = '<YOUR_DB>';
const USER = '<YOUR_USER>';
const PASS = '<YOUR_PASS>';

// Connect to DB
const db = new Sequelize(DB, USER, PASS, {
  host: HOST,
  dialect: DIALECT
});

// Check DB Connection
db.authenticate().then(() => {
  console.log('Database connection has been established.');
}).catch(err => {
  console.log('Unable to connect to the database:', err);
});

// Initialize application
const app = express();

// Get models & Sync
const Article = db.import(path.join(__dirname, 'models/article'));
db.sync();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Set Views & View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routes
app.get('/', (req, res) => {
  Article.findAll().then((result) => {
   Promise.all(result.map(obj => obj.dataValues))
      .then((articles) => {
        res.render('index', {
          articles: articles
        });
    });
  }).catch(err => {
    console.log(err);
  });
});

app.get('/stats', (req, res) => {
  res.render('stats', {
    
  });
});

// API's
  // Create
  app.post('/api/article/create', (req, res) => {
    Article.create({
      title: req.body.title,
      author: req.body.author,
      content: req.body.content,
    }).then(() => {
      res.send({
        type: 'SUCCESS',
        message: 'Data successfully inserted.'
      });
    }).catch(err => {
      res.send({
        type: 'ERROR',
        message: err
      });
    });
  });

// Server start
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});