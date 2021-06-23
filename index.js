const PenclPlugin = require('pencl-core/src/Boot/PenclPlugin');
const RouterManager = require('./src/Manager/RouterManager');

class PenclRouter extends PenclPlugin {

  get name() {
    return 'router';
  }

  get config() {
    return {};
  }

  constructor() {
    super();
    this._manager = null;
  }

  get manager() {
    if (this._manager === null) {
      this._manager = new RouterManager(this);
    }
    return this._manager;
  }

}

module.exports = new PenclRouter();