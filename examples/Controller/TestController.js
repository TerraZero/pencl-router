const ControllerBase = require('../../src/Controller/ControllerBase');

module.exports = class TestController extends ControllerBase {

  /**
   * @param {import('../../src/Manager/RouterManager')} manager 
   */
  onLoad(manager) {
    manager.addMiddleware('all', this.all, true);
    manager.addMiddleware('mid', this.mid);
    manager.addMiddleware('pre', this.pre);
  }

  /**
   * @param {import('../../src/Request/Serve')} serve 
   */
  all(serve) {
    serve.bag.all = true;
    return serve;
  }

  /**
   * @param {import('../../src/Request/Serve')} serve 
   */
  mid(serve) {
    serve.bag.mid = true;
    return serve;
  }

  /**
   * @param {import('../../src/Request/Serve')} serve 
   */
  async pre(serve) {
    const data = await serve.FORM.getField('pre');
    if (data === 1) {
      return serve.json({pre: true}).send();
    }
    serve.bag.pre = data;
    return serve;
  }

  /**
   * @param {import('../../src/Builder/RouteBuilder')} builder
   */
  initRoutes(builder) {
    builder.namespace('schema');
    builder.create('create', 'create', this.controllerTest).middleware('mid').middleware('pre').checkPOST();
    builder.create('view', 'view/:entity/:bundle(/:field)', this.view).checkGET();
  }

  /**
   * @param {import('../../src/Request/Serve')} serve 
   */
  async controllerTest(serve) {
    return serve.json({
      test: await serve.FORM.getField('fields'),
      trim: await serve.FORM.getField('fields.text.trim'),
      bag: serve.bag,
    }).send();
  }

  /**
   * @param {import('../../src/Request/Serve')} serve 
   */
  async view(serve) {
    return serve.json({
      bag: serve.bag,
    }).send();
  }

}