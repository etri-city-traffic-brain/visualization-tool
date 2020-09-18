// Management fileSystem and stream
const fs = require('fs');
const { Duplex } = require('stream');
// const console = require('../module/prettyConsole');

const writeStream = path => fs.createWriteStream(path, { flags: 'w' });
const readStream = path => fs.createReadStream(path, { flags: 'r' });
const makeDuplex = data => new Duplex({
  read() {
    this.push(JSON.stringify(data));
    this.push(null);
  },
});

/**
 * This function is called when read file and convert to string
 * @param {string} filePath
 * @return {Promise<String>}
 */
function fileToString(filePath) {
  if (filePath === '') return Promise.resolve();
  return new Promise((resolve, reject) => {
    const chunkArray = [];
    readStream(filePath)
      .on('error', reject)
      .on('data', chunk => chunkArray.push(chunk))
      .on('close', () => resolve(chunkArray.join('')));
  });
}
/**
 * This function is called when write new file with origin and refer object data
 * @param {string} fileNew
 * @param {object} fileData Object data
 * @return {Promise<string>}
 */
function objectToFile(fileNew, fileData) {
  return new Promise((resolve, reject) => {
    const fileNewWriter = writeStream(fileNew)
      .on('close', () => resolve(`${fileNew} is written`))
      .on('error', reject);
    const duplex = makeDuplex(fileData);
    duplex.pipe(fileNewWriter);
  });
}

module.exports = {
  write: writeStream,
  read: readStream,
  fileToString,
  objectToFile,
  makeDuplex,
};
