/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
require('./db/mongodb');
const app = require('./app.js');

// set port to listen
const PORT = process.env.PORT;

// start server
app.listen(PORT, () => {
  console.log(`serser start on port ${PORT}`);
});
