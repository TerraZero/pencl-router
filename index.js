const PenclRouter = require('./src/PenclRouter');

/**
 * @returns {PenclRouter}
 */
module.exports = function() {
  if (this._pencl_router === undefined) {
    this._pencl_router = new PenclRouter();
  }
  return this._pencl_router;
}