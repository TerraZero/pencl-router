const RouteParser = require('route-parser');
const RouterError = require('../Error/RouterError');

/**
 * @callback checkCallback
 * @param {import('../Request/Serve')} serve
 */

/**
 * @callback serveCallback
 * @param {import('../Request/Serve')} serve
 */

module.exports = class Route {

  /**
   * @param {import('../Controller/ControllerBase')} controller 
   * @param {string} name 
   * @param {string} url 
   * @param {(serveCallback[]|string[]|[serveCallback, number][])} serve
   * @param {string} namespace
   */
  constructor(controller, name, url, serve, namespace = null) {
    this.controller = controller;
    this.name = name;
    this.namespace = namespace;
    this.url = url;
    this._prepared = false;
    this._serve = serve;

    this._checks = [];
    if (this.namespace === null) {
      this.pattern = new RouteParser('/' + this.url);
    } else {
      this.pattern = new RouteParser('/' + this.namespace + '/' + this.url);
    }
  }

  /**
   * @param {(serveCallback|string|[serveCallback, number])} middleware
   * @returns {this}
   */
  addMiddleware(middleware) {
    if (this._prepared) throw new RouterError('The route is already prepared it can not add a middleware.');
    this._serve.push(middleware);
    return this;
  }

  /**
   * @param {import('~/api/Serve').default} serve 
   * @param {object} bag 
   * 
   * @returns {boolean}
   */
  testCheck(serve, bag) {
    for (const check of this._checks) {
      if (check.call(this.controller, serve, bag) === false) return false;
    }
    return true;
  }

  /** 
   * @param {string} url 
   * 
   * @returns {(null|object)}
   */
  match(url) {
    return this.pattern.match(url);
  }

  /**
   * @param {checkCallback} cb 
   * 
   * @returns {this}
   */
  check(cb) {
    this._checks.push(cb);
    return this;
  }

  /**
   * @param {import('../Manager/RouterManager')} router
   * @param {import('../Request/Serve')} serve 
   * 
   * @returns {import('../Request/Serve')}
   */
  async serve(router, serve) {
    try {
      if (!this._prepared) {
        serve = await router.prepareMiddlewares(serve, this);
        this._prepared = true;
      }
      await this.controller.onPrepare(serve, this);
      for (const func of this._serve) {
        serve.metaMiddleware(func.name);
        serve = await func.call(this.controller, serve);
        if (serve.sended) break;
      }
      return serve;
    } catch (e) {
      try {
        console.log(e);
        return (await this.controller.onError(serve, e)).send();
      } catch (exception) {
        return serve.reject(exception);
      }
    }
  }

}