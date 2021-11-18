const mongoose = require('mongoose');

const connectionURL = process.env.MONGODB_URL;
// const connectionURL = 'mongodb://mongo:27017/warehouse-docker';

mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
