const Reflection = require('pencl-kit/src/Util/Reflection');

const Route = require('./Route');

 /**
 * @callback checkFieldCallback
 * @param {*} field
 * @param {import('../Request/Serve')} serve
 * @param {object} bag
 * @param {string} field
 */

module.exports = class RouteBuilder {

  /**
   * @param {import('../Controller/ControllerBase')} controller 
   */
  constructor(controller) {
    this.controller = controller;

    this.routes = [];
    this._namespace = null;
    this._middlewares = [];
  }

  /**
   * @returns {Route}
   */
  get current() {
    return this.routes[this.routes.length - 1];
  }

  /**
   * @param {string} namespace 
   * @param {import('./Route').serveCallback[]} middlewares
   * 
   * @returns {this}
   */
  namespace(namespace, ...middlewares) {
    this._namespace = namespace;
    this._middlewares = middlewares;
    return this;
  }

  /**
   * @param {string} name 
   * @param {string} url 
   * @param {(import('./Route').serveCallback[]|string[]|[import('./Route').serveCallback, number])} serve 
   * 
   * @returns {this}
   */
  create(name, url, ...serve) {
    for (const middleware of this._middlewares) {
      serve.unshift(middleware);
    }
    this.routes.push(new Route(this.controller, name, url, serve, this._namespace));
    return this;
  }

  /**
   * @param {(import('./Route').serveCallback|string|[import('./Route').serveCallback, number])} middleware
   * @returns {this}
   */
  middleware(middleware) {
    this.current.addMiddleware(middleware);
    return this;
  }

  /**
   * @param {import('./Route').checkCallback} cb 
   * 
   * @returns {this}
   */
  check(cb) {
    this.current.check(cb);
    return this;
  }

  checkGET() {
    this.current.setInfo('type', 'get');
    return this.check((serve) => {
      return serve.isGET;
    });
  }

  checkPOST() {
    this.current.setInfo('type', 'post');
    return this.check((serve) => {
      return serve.isPOST;
    });
  }

  /**
   * @param {string[]} fields 
   * 
   * @returns {this}
   */
  checkRequired(fields) {
    this.current.setInfo('required', fields);
    return this.check((serve, bag) => {
      for (const field of fields) {
        if (!Reflection.hasDeep(bag, field)) return false;
      }
      return true;
    });
  }

  /**
   * @param {Object.<string, checkFieldCallback>} fields
   */
  checkField(fields) {
    const info = [];
    for (const field in fields) {
      info.push(field);
    }
    this.current.setInfo('condition_fields', info);
    return this.check(function(serve, bag) {
      for (const field in fields) {
        if (!fields[field].call(this, Reflection.getDeep(bag, field, undefined), serve, bag, field)) return false;
      }
      return true;
    });
  }

}