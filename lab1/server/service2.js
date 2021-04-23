var express = require('express');
var app = express();
const expressLogging = require('express-logging');
const logger = require('logops');
const path = require('path');

app.use(express.json());
app.use(expressLogging(logger));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/html/index2.html'));
});
app.get('/temp', function (req, res) {
  res.sendFile(path.join(__dirname + '/html/temp.html'));
});

const portArg = process.argv.find((arg) => arg.includes('--port='));
const port = portArg ? parseInt(portArg.replace(/\D/g, '')) : 8081;

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
