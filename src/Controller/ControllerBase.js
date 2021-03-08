module.exports = class ControllerBase {

  constructor() {
    this._serve = null;
  }

  /**
   * @returns {import('../Request/Serve')}
   */
  get serve() {
    return this._serve;
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
   * @param {import('../Builder/RouteBuilder')} builder
   */
  initRoutes(builder) {}

}