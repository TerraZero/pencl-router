const GETBag = require('./GETBag');
const FORMBag = require('./FORMBag');
const ResponseCollection = require('./ResponseCollection');
const RouterCodeError = require('../Error/RouterCodeError');
const PenclError = require('pencl-kit/src/Error/PenclError');

module.exports = class Serve {

  /**
   * @param {import('http').ClientRequest} request 
   * @param {import('http').ServerResponse} response
   */
  constructor(request, response) {
    this.request = request;
    this.response = response;

    this._meta = {};
    this._data = {};
    this._body = null;
    this._json = null;
    this._route = null;
    this._debug = null;
    this._values = {};
    this.sended = false;
    this._GET = null;
    this._FORM = null;
    this._BAG = null;
    this._responses = null;
  }

  get responses() {
    if (this._responses === null) {
      this._responses = new ResponseCollection(this);
    }
    return this._responses;
  }

  /** @returns {import('../Builder/Route')} */
  get route() {
    return this._route;
  }

  /** @returns {GETBag} */
  get GET() {
    if (this._GET === null) {
      this._GET = new GETBag(this.request);
    }
    return this._GET;
  }

  /** @returns {FORMBag} */
  get FORM() {
    if (this._FORM === null) {
      this._FORM = new FORMBag(this.request);
    }
    return this._FORM;
  }

  /** @returns {Object<string, (string|int)>} */
  get BAG() {
    return this._BAG;
  }

  /** @returns {boolean} */
  get isDebug() {
    return this._debug !== null;
  }

  /**
   * @param {boolean} state 
   * @returns {this}
   */
  setDebug(state = true) {
    if (state) {
      this._debug = this._debug || {};
    } else {
      this._debug = null;
    }
    return this;
  }

  /**
   * @param {string} key 
   * @param {*} value 
   * @returns {this}
   */
  set(key, value) {
    this._values[key] = value;
    return this;
  }

  /**
   * @param {string} key 
   * @returns {*}
   */
  get(key) {
    return this._values[key];
  }

  url() {
    if (this.request.url.endsWith('/')) {
      return this.request.url.substring(0, this.request.url.length - 1);
    }
    return this.request.url;
  }

  meta(key, value) {
    this._meta[key] = value;
    if (key === 'status') {
      delete this._meta.error;
    }
    return this;
  }

  /**
   * @param {string} name 
   * @param {any} value 
   * @param {boolean} isArray 
   * @returns {this}
   */
  debug(name, value, isArray = true) {
    if (!this.isDebug) return this;
    if (isArray) {
      this._debug[name] = this._debug[name] || [];
      this._debug[name].push(value);
    } else {
      this._debug[name] = value;
    }
    return this;
  }

  metaMiddleware(middleware) {
    return this.debug('middlewares', middleware, true);
  }

  json(data) {
    this.meta('status', 200);
    this._data = data;
    return this;
  }

  /**
   * @param {Error} error 
   * 
   * @returns {this}
   */
  reject(error) {
    if (error instanceof RouterCodeError) {
      error.prepare(this);
    } else {
      if (!this.isDebug) {
        this._meta = {};
        this._data = {};
      }
      if (error instanceof PenclError) {
        this.responses.errorInternalServerError(error.message);
      } else {
        this.responses.errorInternalServerError();
      }
    }

    if (this.isDebug) this._meta.error.full = error.stack;
    return this;
  }

  /**
   * @param {number} code 
   * @param {string} message 
   * 
   * @returns {this}
   */
  error(code, message) {
    this.meta('status', code);
    this.meta('error', {code, message});
    return this;
  }

  send() {
    this.sended = true;
    return new Promise((resolve, reject) => {
      this.response.setHeader('Content-Type', 'application/json');
      const sending = {content: this._data, meta: this._meta};

      if (this.isDebug) sending.debug = this._debug;
      this.response.end(JSON.stringify(sending), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(this);
        }
      });
    });
  }

  setBag(bag = {}) {
    this._BAG = bag;
    return this;
  }

  /** @returns {boolean} */
  isPOST() {
    return this.request.method === 'POST';
  }

  /** @returns {boolean} */
  isGET() {
    return this.request.method === 'GET';
  }

  /** @returns {Promise<string>} */
  async getBody() {
    if (this._body === null) {
      return new Promise((resolve, reject) => {
        this._body = '';
        
        this.request.on('data', (chunk) => {
          this._body += chunk;
        });
  
        this.request.on('end', () => {
          resolve(this._body);
        });
      });
    } else {
      return Promise.resolve(this._body);
    }
  }

  /** @returns {Promise<object>} */
  async getJSON() {
    if (this._json === null) {
      this._json = JSON.parse(await this.getBody());
    } 
    return this._json;
  }

}