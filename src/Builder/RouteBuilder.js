const Reflection = require('pencl-base/src/Util/Reflection');

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
    this._namespace = null;
    this.routes = [];
    this.controller = controller;
  }

  /**
   * @returns {Route}
   */
  get current() {
    return this.routes[this.routes.length - 1];
  }

  /**
   * @param {string} namespace 
   * 
   * @returns {this}
   */
  namespace(namespace) {
    this._namespace = namespace;
    return this;
  }

  /**
   * @param {string} name 
   * @param {string} url 
   * @param {import('./Route').serveCallback[]} serve 
   * 
   * @returns {this}
   */
  create(name, url, ...serve) {
    this.routes.push(new Route(this.controller, name, url, serve, this._namespace));
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
    return this.check((serve) => {
      return serve.isGET();
    });
  }

  checkPOST() {
    return this.check((serve) => {
      return serve.isPOST();
    });
  }

  /**
   * @param {string[]} fields 
   * 
   * @returns {this}
   */
  checkRequired(fields) {
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
    return this.check(function(serve, bag) {
      for (const field in fields) {
        if (!fields[field].call(this, Reflection.getDeep(bag, field, undefined), serve, bag, field)) return false;
      }
      return true;
    });
  }

}