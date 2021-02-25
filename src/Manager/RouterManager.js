const RouteBuilder = require('../Builder/RouteBuilder');

module.exports = class RouterManager {

  constructor() {
    this.controllers = [];
    this._routes = null;
  }

  /**
   * @returns {import('../Builder/Route')[]}
   */
  get routes() {
    return this._routes;
  }

  /**
   * @param {import('../Controller/ControllerBase')} controller 
   */
  addController(controller) {
    this.controllers.push(controller);
    if (this._routes === null) this._routes = [];
    const builder = new RouteBuilder(controller);

    controller.initRoutes(builder);
    for (const route of builder.routes) {
      this._routes.push(route);
    }
    return this;
  }

  /**
   * @param {import('../Request/Serve')} serve 
   */
  serve(serve) {
    const url = serve.url();

    for (const route of this.routes) {
      const bag = route.match(url);

      if (bag && route.testCheck(serve, bag)) {
        serve.setBag(bag);
        serve.meta('request', {url, bag});
        try {
          const response = await route.serve(serve);
          if (!response.sended) return response.send();
          return response;
        } catch (e) {
          return serve.reject(e).send();
        }
      }
    }
    return serve.errorNotFound().send();
  }

}