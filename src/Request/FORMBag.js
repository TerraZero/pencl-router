const Formidable = require('formidable');
const FS = require('fs');
const RequestBagBase = require('./RequestBagBase');
const Reflection = require('pencl-kit/src/Util/Reflection');
const PenclBadParameterError = require('pencl-kit/src/Error/Runtime/PenclBadParameterError');

module.exports = class FORMBag extends RequestBagBase {

  /**
   * @param {import('http').ClientRequest} request 
   */
  constructor(request) {
    super(request);
    this._fields = undefined;
    this._files = undefined;
    this._error = undefined;
  }

  async parse() {
    const form = Formidable({multiples: true});

    await (new Promise((resolve) => {
      form.parse(this.request, (err, fields, files) => {
        this._error = err || null;
        if (err) return resolve();

        this._fields = fields || null;
        this._files = files || null;
        resolve();
      });
    }));
    return this;
  } 

  async fields() {
    if (this._fields === undefined) {
      await this.parse();
    }
    return this._fields;
  }

  async files() {
    if (this._files === undefined) {
      await this.parse();
    }
    return this._files;
  }

  async error() {
    if (this._error === undefined) {
      await this.parse();
    }
    return this._error;
  }

  /**
   * @param {string} field 
   * @returns {Promise<string>}
   */
  async getFileContent(field) {
    const files = await this.files();
    let content = '';

    return new Promise((resolve) => {
      const stream = FS.createReadStream(files[field].path);

      stream.on('data', (data) => {
        content += data.toString();
      });
      stream.on('end', () => {
        resolve(content);
      });
    });
  }

  /**
   * @param {string} field 
   * @param {string} target 
   */
  async saveFile(field, target) {
    const files = await this.files();

    return new Promise((resolve) => {
      FS.rename(files[field].path, target, () => {
        resolve();
      });
    });
  }

  /**
   * @returns {string[]}
   */
  async getFields() {
    const fields = [];
    for (const field in await this.fields()) {
      fields.push(field);
    }
    return fields;
  }

  /**
   * @param {string} field 
   * @param {*} fallback
   * @returns {*}
   */
  async getRaw(field, fallback = null) {
    const fields = await this.fields();

    return fields[field] === undefined ? fallback : fields[field];
  }

  /**
   * @param {string} field 
   * @param {*} fallback 
   * @returns {*}
   */
  async getValue(field, fallback = null) {
    if (this._formatted_values[field] !== undefined) return this._formatted_values[field];
    this._formatted_values[field] = Reflection.parseValue(await this.getRaw(field, fallback));
    return this._formatted_values[field];
  }

  /**
   * @param {string} field 
   * @param {*} fallback
   * @returns {*}
   */
  async getField(field, fallback = null) {
    if (field.indexOf('.') !== -1) throw new PenclBadParameterError(this, 'getField', 'field', 'Invalid parameter <parameter>, please use only root fields: ');
    if (Reflection.hasDeep(this._merged_fields, field)) return Reflection.getDeep(this._merged_fields, field, fallback);
    const value = {};
    const fields = (await this.getFields()).filter(v => v.startsWith(field));
    fields.sort((a, b) => {
      return a.length - b.length;
    });
    for (const name of fields) {
      Reflection.setDeep(value, name, await this.getValue(name));
    }
    this._merged_fields[field] = value[field];
    return Reflection.getDeep(this._merged_fields, field, fallback);
  }

}