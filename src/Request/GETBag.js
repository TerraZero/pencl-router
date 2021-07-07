const Querystring = require('querystring');
const RequestBagBase = require('./RequestBagBase');

module.exports = class GETBag extends RequestBagBase {

  /**
   * @param {import('http').ClientRequest} request 
   */
  constructor(request) {
    super(request);
    this.query = request.url.split('?')[1] || null;
    this.params = Querystring.parse(this.query);
  }

  /**
   * @returns {string[]}
   */
  getFields() {
    const fields = [];
    for (const param in this.params) {
      fields.push(param);
    }
    return fields;
  }

  /**
   * @param {string} field 
   * @param {*} fallback
   * @returns {*}
   */
  getRaw(field, fallback = null) {
    return this.params[field] === undefined ? fallback : this.params[field];
  }

}