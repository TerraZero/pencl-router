const Querystring = require('querystring');

module.exports = class GETBag {

  /**
   * @param {(import('http').ClientRequest|string)} request 
   */
  constructor(request) {
    if (typeof request === 'string') {
      this.query = request;
    } else {
      this.query = request.url.split('?')[1] || null;
    }
    this.params = Querystring.parse(this.query);
  }

}