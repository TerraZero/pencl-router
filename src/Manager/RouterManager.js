const RouteBuilder = require('../Builder/RouteBuilder');
const Core = require('pencl-core');
const Glob = require('glob');

module.exports = class RouterManager {

  /**
   * @param {import('../../index')} plugin 
   */
  constructor(plugin) {
    this.plugin = plugin;
    this.controllers = [];

    this._routes = null;
    this._middleware = {};
  }

  /**
   * @returns {import('../Builder/Route')[]}
   */
  get routes() {
    return this._routes;
  }

  /**
   * @param {string} pattern 
   * @param {string} cwd 
   * @param {object} options
   */
  load(pattern, cwd, options = {}) {
    options.cwd = Core().boot.getPath(cwd);
    options.absolute = true;

    for (const file of Glob.sync(pattern, options)) {
      const controller = new (require(file))();

      controller.onLoad(this);
      this.addController(controller);
    }
  }

  /**
   * @param {import('../Controller/ControllerBase')} controller 
   */
  addController(controller) {
    controller.setPlugin(this.plugin);
    this.controllers.push(controller);
    if (this._routes === null) this._routes = [];
    const builder = new RouteBuilder(controller);

    controller.initRoutes(builder);
    for (const route of builder.routes) {
      this._routes.push(route);
    }
    return this;
  }

  addMiddleware(name, func, isDefault = false, sort = -100) {
    this._middleware[name] = {func, isDefault, name, sort};
    return this;
  }

  /**
   * @param {string} namespace 
   * @param {string} name 
   * @returns {import('../Builder/Route')}
   */
  getRoute(namespace, name) {
    for (const route of this.routes) {
      if (route.namespace === namespace && route.name === name) {
        return route;
      }
    }
    return null;
  }

  /**
   * @param {string} namespace 
   * @returns {import('../Builder/Route')[]}
   */
  getRoutes(namespace) {
    const routes = [];

    for (const route of this.routes) {
      if (route.namespace === namespace) {
        routes.push(route);
      }
    }
    return routes;
  }

  /**
   * @param {import('../Request/Serve')} serve
   * @returns {import('../Request/Serve')}
   */
  async serve(serve) {
    const url = serve.url();

    for (const route of this.routes) {
      const bag = route.match(url);

      if (bag && route.testCheck(serve, bag)) {
        serve.setBag(bag);
        serve.meta('request', {url, bag});
        serve._route = route;
        try {
          serve = await route.serve(this, serve);
          if (!serve.sended) return serve.send();
          return serve;
        } catch (e) {
          return serve.reject(e).send();
        }
      }
    }
    return serve.errorNotFound().send();
  }

  /**
   * Add middleware in order and remove ignored middlewares
   * 
   * @param {import('../Request/Serve')} serve 
   * @param {import('../Builder/Route')} route 
   * @returns {import('../Request/Serve')}
   */
  async prepareMiddlewares(serve, route) {
    const ignored = [];
    let callbacks = route._serve;
    let counter = 0;

    callbacks = callbacks.map((value) => {
      if (typeof value === 'string') {
        if (value.startsWith('-')) {
          ignored.push(value.substring(1));
          return null;
        } else {
          ignored.push(value);
          return [this._middleware[value].func, this._middleware[value].sort];
        }
      }
      if (typeof value === 'function') {
        return [value, counter++];
      }
      if (typeof value[0] === 'string') {
        return [this._middleware[value[0]].func, value[1]];
      } else {
        return value;
      }
    }).filter((v) => v !== null);

    for (const name in this._middleware) {
      if (!this._middleware[name].isDefault || ignored.includes(name)) continue;
      callbacks.push([this._middleware[name].func, this._middleware[name].sort]);
    }

    route._serve = callbacks.sort((a, b) => a[1] - b[1]).map((v) => v[0]);
    return serve;
  }

}