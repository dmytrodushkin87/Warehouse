/* eslint-disable no-console */
const express = require('express');

const app = express();
const boom = require('express-boom');
const passport = require('passport');
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const userRouter = require('./routers/user');

// returning HTTP errors
app.use(boom());

// returns JSON
app.use(express.json());
// passport config
require('./middleware/passport')(passport);

// passport middleware
app.use(passport.initialize());

// set static view engine as pug
app.set('view engine', 'pug');
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
  });
});

// connection routers of /products
app.use(productsRouter);
// connection routers of /categories
app.use(categoriesRouter);
// connection routers of /user
app.use(userRouter);

// Caughting unhandled Rejection
process.on('unhandledRejection', (err) => {
  console.log('Caught exception: ', err);
});

module.exports = app;
