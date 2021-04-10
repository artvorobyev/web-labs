var express = require('express');
var fs = require('fs');
var app = express();
const expressSwagger = require('express-swagger-generator')(app);
const expressLogging = require('express-logging');
const logger = require('logops');
let options = {
  swaggerDefinition: {
    info: {
      description: 'This is a sample server',
      title: 'Web Lab 1',
      version: '1.0.0',
    },
    host: 'localhost:8080',
    basePath: '/',
    produces: ['application/json'],
    schemes: ['http'],
  },
  basedir: __dirname, //app absolute path
  files: ['./*.js'], //Path to the API handle folder
};
expressSwagger(options);
app.use(express.json());
app.use(expressLogging(logger));

/**
 * @typedef Error
 * @property {string} error.required - Error description
 */

/**
 * @typedef Response
 * @property {boolean} success.required - Error description
 */

/**
 * @typedef User
 * @property {number} ID.required - User id
 * @property {string} user_login.required - username
 * @property {string} user_email.required - user email
 * @property {string} user_registered.required - user registration date
 * @property {Array<string>} roles.required - user roles, e.g. subscriber, administrator
 */

/**
 * Получение списка пользователей
 * @route GET /users
 * @group users - Operations about user
 * @returns {Array<User>} 200 - An array of user info
 * @returns {Error.model}  500 - Unexpected error
 */
app.get('/users', function (req, res) {
  fs.readFile('data.json', 'utf8', function (err, data) {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(JSON.parse(data));
    }
  });
});

/**
 * Получение данных конкретного пользователя
 * @route GET /users/{userId}
 * @group users - Operations about user
 * @returns {User.model} 200 - User info
 * @returns {Error.model} 404 - User not found
 * @returns {Error.model} 500 - Unexpected error
 */
app.get('/users/:userId', function (req, res) {
  fs.readFile('data.json', 'utf8', function (err, data) {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      const users = JSON.parse(data);
      const user = (users || []).find(
        (user) => user.ID === parseInt(req.params.userId)
      );

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});

/**
 * Обновление данных пользователя
 * @route PUT /users/{userId}
 * @group users - Operations about user
 * @param {string} user_login - username
 * @param {string} user_email - user email
 * @param {string[]} roles - user roles, e.g. subscriber, administrator
 * @returns {Response.model} 200 - Success
 * @returns {Error.model} 404 - User not found
 * @returns {Error.model} 500 - Unexpected error
 */
app.put('/users/:userId', function (req, res) {
  const users = JSON.parse(fs.readFileSync('data.json', 'utf-8')) || [];
  const user = (users || []).find(
    (user) => user.ID === parseInt(req.params.userId)
  );

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  fs.writeFile(
    'data.json',
    JSON.stringify(
      users.map((item) => {
        return item.ID === user.ID ? { ...item, ...req.body } : item;
      }),
      null,
      2
    ),
    function (err, data) {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

/**
 * Добавление пользователя
 * @route POST /users
 * @group users - Operations about user
 * @param {string} user_login.required - username
 * @param {string} user_email.required - user email
 * @param {string[]} roles.required - user roles, e.g. subscriber, administrator
 * @returns {Response.model} 200 - Success
 * @returns {Error.model} 400 - Bad request
 * @returns {Error.model}  500 - Unexpected error
 */
app.post('/users', function (req, res) {
  if (
    !Object.keys(req.body).includes('user_login') ||
    !Object.keys(req.body).includes('user_email') ||
    !Object.keys(req.body).includes('roles')
  ) {
    res.status(400).json({ error: 'No required data provided' });
    return;
  }

  const users = JSON.parse(fs.readFileSync('data.json', 'utf-8')) || [];
  const newUserId =
    Math.max.apply(
      null,
      users.map((item) => parseInt(item.ID))
    ) + 1;
  const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const newUser = {
    ...req.body,
    ID: newUserId,
    user_registered: date,
  };

  fs.writeFile(
    'data.json',
    JSON.stringify([...users, newUser], null, 2),
    function (err, data) {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

/**
 * Удаление пользователя
 * @route DELETE /users/{userId}
 * @group users - Operations about user
 * @returns {Response.model} 200 - Success
 * @returns {Error.model} 404 - User not found
 * @returns {Error.model} 500 - Unexpected error
 */
app.delete('/users/:userId', function (req, res) {
  const users = JSON.parse(fs.readFileSync('data.json', 'utf-8')) || [];
  const user = (users || []).find(
    (user) => user.ID === parseInt(req.params.userId)
  );

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  fs.writeFile(
    'data.json',
    JSON.stringify(
      users.filter((item) => item.ID !== user.ID),
      null,
      2
    ),
    function (err, data) {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

/**
 * Возможные методы
 * @route OPTIONS /users
 * @group users - Operations about user
 * @returns {object} 200 - Success
 */
app.options('/users', function (req, res) {
  res.status(200).header('Allow', 'OPTIONS, GET, POST, PUT, DELETE').json({});
});

const portArg = process.argv.find((arg) => arg.includes('--port='));
const port = portArg ? parseInt(portArg.replace(/\D/g, '')) : 8081;

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
