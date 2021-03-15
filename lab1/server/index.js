var express = require('express');
var fs = require('fs');
var app = express();
app.use(express.json());

// получение GET запроса на главную страницу
app.get('/', function (req, res) {
  fs.readFile('data.json', 'utf8', function (err, data) {
    if (err) {
      console.log('Could not find or open file for reading\n');
    } else {
      res.status(200).json(JSON.parse(data));
      console.log(data);
    }
  });
});

// получение POST запроса на главную страницу
app.post('/', function (req, res) {
  fs.writeFile(
    'data.json',
    JSON.stringify({ ...req.body }),
    function (err, data) {
      if (err) {
        console.log('Could not find or open file for writing\n');
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

// получение PUT запроса
app.put('/', function (req, res) {
  fs.writeFile(
    'data.json',
    JSON.stringify({
      ...JSON.parse(fs.readFileSync('data.json', 'utf-8')),
      ...req.body,
    }),
    function (err, data) {
      if (err) {
        console.log('Could not find or open file for writing\n');
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

// получение DELETE запроса
app.delete('/', function (req, res) {
  fs.writeFile('data.json', '', function (err, data) {
    if (err) {
      console.log('Could not find or open file for writing\n');
    } else {
      res.status(200).json({ success: true });
    }
  });
});

// получение OPTIONS запроса
app.options('/', function (req, res) {
  res.status(405).json({ success: false });
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
