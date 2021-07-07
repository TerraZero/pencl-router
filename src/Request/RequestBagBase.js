const PenclMethodDefinitionError = require('pencl-kit/src/Error/Definition/PenclMethodDefinitionError');
const PenclBadParameterError = require('pencl-kit/src/Error/Runtime/PenclBadParameterError');

module.exports = class RequestBagBase {

  /**
   * @param {import('http').ClientRequest} request
   */
  constructor(request) {
    this.request = request;
    this._merged_fields = {};
    this._formatted_values = {};
  }

  /**
   * @returns {string[]}
   */
  getFields() {
    throw new PenclMethodDefinitionError(this, 'getFields');
  }

  /**
   * @param {string} field 
   * @param {*} fallback
   * @returns {*}
   */
  getRaw(field, fallback = null) {
    throw new PenclMethodDefinitionError(this, 'getRaw');
  }

  /**
   * @param {string} field 
   * @param {*} fallback 
   * @returns {*}
   */
  getValue(field, fallback = null) {
    if (this._formatted_values[field] !== undefined) return this._formatted_values[field];
    this._formatted_values[field] = Reflection.parseValue(this.getRaw(field, fallback));
    return this._formatted_values[field];
  }

  /**
   * @param {string} field 
   * @param {*} fallback
   * @returns {*}
   */
  getField(field, fallback = null) {
    if (field.indexOf('.') !== -1) throw new PenclBadParameterError(this, 'getField', 'field', 'Invalid parameter <parameter>, please use only root fields: ');
    if (Reflection.hasDeep(this._merged_fields, field)) return Reflection.getDeep(this._merged_fields, field, fallback);
    const value = {};
    const fields = this.getFields().filter(v => v.startsWith(field));
    fields.sort((a, b) => {
      return a.length - b.length;
    });
    for (const name of fields) {
      Reflection.setDeep(value, name, this.getValue(name));
    }
    this._merged_fields[field] = value[field];
    return Reflection.getDeep(this._merged_fields, field, fallback);
  }

}