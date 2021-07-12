const RouterError = require('./RouterError');

module.exports = class RouterCodeError extends RouterError {

  /**
   * @param {int} code
   * @param  {...any} args
   */
  constructor(code, ...args) {
    super('[' + code + ']');
    this._code = code;
    this._args = args;
  }

  /**
   * @param {import('../Request/Serve')} serve 
   */
  prepare(serve) {
    serve.responses.setCode(this._code, ...this._args);
  }

}