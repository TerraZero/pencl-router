const ControllerBase = require('../src/Controller/ControllerBase');

module.exports = class TestController extends ControllerBase {

  /**
   * @param {import('../src/Request/Serve')} serve 
   */
  static defaultMiddleware(serve) {
    serve.meta('defaultMiddleware', true);
    return serve;
  }

  /**
   * @param {import('../src/Request/Serve')} serve 
   */
  static routerMiddleware(serve) {
    serve.meta('routerMiddleware', true);
    return serve;
  }

  /**
   * @param {import('../src/Builder/RouteBuilder')} builder
   */
  initRoutes(builder) {
    builder.namespace('hallo');
    builder.create('test', 'test/:cool', this.controllerTest);
    builder.create('formtest', 'form', this.testForm);
  }

  /**
   * @param {import('../src/Request/Serve')} serve 
   */
  middlewareTest(serve) {
    if (serve.bag.cool === 'ok') {
      return serve.set('user', 1);
    } else {
      return serve.errorForbidden().send();
    }
  }

  /**
   * @param {import('../src/Request/Serve')} serve 
   */
  controllerTest(serve) {
    return serve.json({'hallo': 'cool', item: serve.bag.cool, user: serve.get('user')}).send();
  }

  /**
   * @param {import('../src/Request/Serve')} serve 
   */
  async testForm(serve) {
    const fields = await serve.FORM.fields();
    const files = await serve.FORM.files();
    const error = await serve.FORM.error();
    const contents = {};

    for (const file in files) {
      contents[file] = await serve.FORM.getFileContent(file);
    }

    return serve.json({form: true, fields, files, error, contents}).send();
  }

}