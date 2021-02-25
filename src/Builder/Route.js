const RouteParser = require('route-parser');

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
   * @param {serveCallback[]} serve
   * @param {string} namespace
   */
  constructor(controller, name, url, serve, namespace = null) {
    this.controller = controller;
    this.name = name;
    this.namespace = namespace;
    this.url = url;
    this.serve = serve;

    this._checks = [];
    if (this.namespace === null) {
      this.pattern = new RouteParser(this.url);
    } else {
      this.pattern = new RouteParser(this.namespace + '/' + this.url);
    }
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
   * @param {import('../Request/Serve')} serve 
   * 
   * @returns {import('../Request/Serve')}
   */
  async serve(serve) {
    try {
      await this.controller.onPrepare(serve, this);
      return await this.serve.call(this.controller, serve);
    } catch (e) {
      return (await this.controller.onError(serve, e)).send();
    }
  }

}