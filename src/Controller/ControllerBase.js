const RouteBuilder = require('../Builder/RouteBuilder');

module.exports = class ControllerBase {

  constructor() {
    this.plugin = null;
    this._serve = null;
    this._routes = null;
  }

  /**
   * @returns {import('../Request/Serve')}
   */
  get serve() {
    return this._serve;
  }

  /** @returns {import('../Builder/Route')[]} */
  get routes() {
    if (this._routes === null) {
      const builder = new RouteBuilder(this);

      this.initRoutes(builder);
      this._routes = builder.routes;
    }
    return this._routes;
  }

  /**
   * @param {import('../PenclRouter')} plugin 
   * @returns {this}
   */
  setPlugin(plugin) {
    this.plugin = plugin;
    return this;
  }

  /**
   * @param {import('../Request/Serve')} serve 
   * @param {import('../Builder/Route')} route 
   */
  async onPrepare(serve, route) {
    this._serve = serve;
    this._route = route;
  }

  /**
   * @param {import('../Request/Serve')} serve 
   * @param {Error} error 
   * 
   * @returns {import('../Request/Serve')}
   */
  async onError(serve, error) {
    return serve.reject(error);
  }

  /**
   * @param {import('../Manager/RouterManager')} manager 
   */
  onLoad(manager) {}

  /**
   * @param {import('../Builder/RouteBuilder')} builder
   */
  initRoutes(builder) {}

}