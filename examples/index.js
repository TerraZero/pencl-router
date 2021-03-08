const http = require('http');
const RouterManager = require('../src/Manager/RouterManager');
const Serve = require('../src/Request/Serve');
const TestController = require('./TestController');

const host = 'localhost';
const port = 8000;
const router = new RouterManager();

router.setDebugMode();
router.addController(new TestController());
router.addMiddleware('test/default', TestController.defaultMiddleware, true);
router.addMiddleware('test/router', TestController.routerMiddleware);

const requestListener = function (req, res) {
  router.serve(new Serve(req, res));
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});