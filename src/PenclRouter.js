const PenclPlugin = require('pencl-core/src/Boot/PenclPlugin');
const RouterManager = require('./Manager/RouterManager');

module.exports = class PenclRouter extends PenclPlugin {

  get name() {
    return 'router';
  }

  get config() {
    return {
      debug: false,
      load: [],
    };
  }

  constructor() {
    super();
    this._manager = null;
  }

  /** @returns {RouterManager} */
  get manager() {
    if (this._manager === null) {
      this._manager = new RouterManager(this);
    }
    return this._manager;
  }

}