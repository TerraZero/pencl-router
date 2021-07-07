const ControllerBase = require('../src/Controller/ControllerBase');

module.exports = class TestController extends ControllerBase {

  /**
   * @param {import('../src/Builder/RouteBuilder')} builder
   */
  initRoutes(builder) {
    builder.namespace('schema');
    builder.create('create', 'create', this.controllerTest).checkPOST();
  }

  /**
   * @param {import('../src/Request/Serve')} serve 
   */
  async controllerTest(serve) {
    return serve.json({data: await serve.FORM.getField('fields')}).send();
  }

}