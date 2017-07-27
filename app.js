const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const path = require('path');

const expressValidator = require('express-validator');
const expressMessages = require('express-messages');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');

// Environment variables
const PORT = 3000;
const HOST = 'localhost';
const DIALECT = 'mysql';
const DB = '<YOUR_DB>';
const USER = '<YOUR_USER>';
const PASS = '<YOUR_PASS>';
const SECRET = 'secret';

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

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
  // Bodyparser
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Cookie Parser & Express Session
  app.use(cookieParser(SECRET));
  app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // secure prop. removed
  }));

  // Flash & Express Messages
  app.use(flash());
  app.use(function (req, res, next) {
    res.locals.messages = expressMessages(req, res);
    next();
  });

  // Express Validator
  app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  }));

// Set Views & View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routes
app.get('/', (req, res) => {
  Article.findAll({ order: [['id', 'DESC']] }).then((result) => {
    Promise.all(result.map(obj => {
      obj.dataValues.createdAt = moment(obj.dataValues.createdAt).fromNow();
      return obj.dataValues;
    })).then((articles) => {
      res.render('index', {
        articles: articles
      });
    });
  }).catch(err => {
    res.send({
      type: 'error',
      message: `${err}`
    });
  });
});

app.get('/article/:id', (req, res) => {
  Article.findById(req.params.id).then((result) => {
    result.dataValues.createdAt = moment(result.dataValues.createdAt).fromNow();
    res.render('article', {
      article: result.dataValues
    });
  }).catch(err => {
    res.send({
      type: 'error',
      message: `${err}`
    });
  });
});

app.get('/stats', (req, res) => {
  res.render('stats', {
    
  });
});

// Article API
  // Create
  app.post('/api/article/create', (req, res) => {
    
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('content', 'Content is required').notEmpty();

    req.getValidationResult().then(result => {
      if (!result.isEmpty()) {
        // Temp
        req.flash('danger', 'Please fill all necessary fields!');
        res.redirect('/');
      } else {
        Article.create({
          title: req.body.title,
          author: req.body.author,
          content: req.body.content,
        }).then(() => {
          req.flash('success', 'Article added successfully!');
          res.redirect('/');
        });
      }
    }).catch(err => {
      res.send({
        type: 'error',
        message: `${err}`
      });
    });
  });

  // Update
  app.post('/api/article/update/:id', (req, res) => {
    Article.update({
      title: req.body.title,
      author: req.body.author,
      content: req.body.content
    },{
      where: { id: req.params.id }  
    }).then(() => {
      req.flash('success', 'Article updated successfully!');  
      res.redirect('/');
    }).catch(err => {
      res.send({
        type: 'error',
        message: `${err}`
      });
    });
  });

  // Delete
  app.post('/api/article/delete/:id', (req, res) => {
    Article.destroy({
      where: { id: req.params.id }
    }).then(() => {
      req.flash('success', 'Article deleted successfully!');
      res.redirect('/');
    }).catch(err => {
      res.send({
        type: 'error',
        message: `${err}`
      });
    });
  });

// Server start
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});
