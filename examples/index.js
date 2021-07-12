const Core = require('pencl-core');

Core().booting(__dirname);

const http = require('http');
const Router = require('../index')();
const Serve = require('../src/Request/Serve');

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
  Router.manager.serve(new Serve(req, res));
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(Router.config);
  console.log(`Server is running on http://${host}:${port}`);
});