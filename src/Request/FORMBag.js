const Formidable = require('formidable');
const FS = require('fs');

module.exports = class FORMBag {

  /**
   * @param {import('http').ClientRequest} request 
   */
  constructor(request) {
    this.request = request;
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

}