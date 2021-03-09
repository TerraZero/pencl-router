const Boot = require('pencl-base');

Boot(__dirname);

const http = require('http');
const router = require('../index');
const Serve = require('../src/Request/Serve');
const TestController = require('./TestController');

const host = 'localhost';
const port = 8000;

router.manager.addController(new TestController());
router.manager.addMiddleware('test/default', TestController.defaultMiddleware, true);
router.manager.addMiddleware('test/router', TestController.routerMiddleware);

const requestListener = function (req, res) {
  router.manager.serve(new Serve(req, res));
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});