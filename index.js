/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const restify = require('restify');
const mongoose = require('mongoose');
const util = require('util');
const config = require('./config');
const routes = require('./routes/covdata');

const server = restify.createServer();

// create a write stream (in append mode)
const logFile = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const logStdout = process.stdout;

console.log = function (...args) {
  logFile.write(`${util.format.apply(null, args)}\n`);
  logStdout.write(`${util.format.apply(null, args)}\n`);
};

// Middleware
server.use(restify.plugins.bodyParser());


server.listen(config.PORT, () => {
  mongoose.set('useFindAndModify', false);
  mongoose.connect(
    config.MONGODB_URI,
    { useNewUrlParser: true }
  );
});

const db = mongoose.connection;

db.on('error', (err) => console.log(err));

db.once('open', () => {
  routes(server);
  // console.log(`Server started on port ${config.PORT}`);
});
