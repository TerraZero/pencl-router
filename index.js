const PenclPlugin = require('pencl-base/src/Boot/PenclPlugin');
const RouterManager = require('./src/Manager/RouterManager');

class PenclRouter extends PenclPlugin {

  get name() {
    return 'router';
  }

  get config() {
    return {
      hallo: 'ok',
    };
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