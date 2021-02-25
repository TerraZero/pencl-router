module.exports = class Serve {

  /**
   * @param {import('http').ClientRequest} request 
   * @param {import('http').ServerResponse} response
   */
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.bag = {};

    this._meta = {
      status: 403,
      error: {
        code: 403,
        message: 'Service unavailable',
      },
    };
    this._data = {};
    this._body = null;
    this._json = null;
    this.sended = false;
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
    this.meta('status', code);
    this.meta('error', {code, message});
    return this;
  }

  errorNotFound() {
    return this.error(404, 'Not found');
  }

  send() {
    this.sended = true;
    return new Promise((resolve, reject) => {
      this.response.setHeader('Content-Type', 'application/json');
      this.response.end(JSON.stringify({content: this._data, meta: this._meta}), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
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

  /** @returns {Promise<object>} */
  async getJSON() {
    if (this._json === null) {
      this._json = JSON.parse(await this.getBody());
    } 
    return this._json;
  }

}