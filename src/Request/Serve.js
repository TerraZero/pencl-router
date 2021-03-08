const Querystring = require('querystring');
const GETBag = require('./GETBag');
const FORMBag = require('./FORMBag');

module.exports = class Serve {

  /**
   * @param {import('http').ClientRequest} request 
   * @param {import('http').ServerResponse} response
   */
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.bag = {};

    this._meta = {};
    this._data = {};
    this._body = null;
    this._json = null;
    this._route = null;
    this._debug = {};
    this._values = {};
    this.sended = false;
    this._isDebug = false;
    this._GET = null;
    this._FORM = null;

    this.errorServiceUnavailable();
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

  debug() {
    this._isDebug = true;
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

  metaDebug(name, value, isArray = true) {
    if (this._isDebug) { console.debug('[DEBUG::SERVE] ' + name + ' = ' + JSON.stringify(value)) };
    if (isArray) {
      this._debug[name] = this._debug[name] || [];
      this._debug[name].push(value);
    } else {
      this._debug[name] = value;
    }
    return this;
  }

  metaMiddleware(middleware) {
    return this.metaDebug('middlewares', middleware, true);
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
    this.error(500, error.message);
    this._meta.error.full = error.stack;
    return this;
  }

  /**
   * @param {number} code 
   * @param {string} message 
   * 
   * @returns {this}
   */
  error(code, message) {
    this._meta = {};
    this.meta('status', code);
    this.meta('error', {code, message});
    return this;
  }

  errorForbidden() {
    return this.error(403, 'Forbidden');
  }

  errorNotFound() {
    return this.error(404, 'Not found');
  }

  errorServiceUnavailable() {
    return this.error(503, 'Service unavailable');
  }

  send() {
    this.sended = true;
    return new Promise((resolve, reject) => {
      this.response.setHeader('Content-Type', 'application/json');
      const sending = {content: this._data, meta: this._meta};

      if (this._isDebug) sending.debug = this._debug;
      this.response.end(JSON.stringify(sending), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(this);
        }
      });
    });
  }

  setBag(bag) {
    this.bag = bag;
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

  /**
   * @returns {Promise<object>}
   */
  async getFormData() {
    return Querystring.parse(await this.getBody());
  }

  /** @returns {Promise<object>} */
  async getJSON() {
    if (this._json === null) {
      this._json = JSON.parse(await this.getBody());
    } 
    return this._json;
  }

}