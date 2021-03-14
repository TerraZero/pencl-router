/**
 * @param {import('pencl-base')} pencl 
 */
 module.exports = (pencl) => {
  pencl.on('init:database', (database) => {
    console.log(database);
  });
}