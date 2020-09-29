const util = require('util');
const path = require('path');
const multer = require('multer');
const extractZip = util.promisify(require('extract-zip'));
const { base } = require('../../config');
/**
 * 시뮬레이션에 사용될 데이터 업로드 처리
 * @param {} req
 * @param {*} res
 * @param {*} next
 */
function uploadData(req, res) {
  const { id } = req.query;
  // const targetPath = path.join(`/salt/simulations/${id}`);
  const targetPath = path.join(`${base}/data/${id}`);
  const storage = multer.diskStorage({
    destination: (request, file, callback) => callback(null, targetPath),
    filename: (request, file, callback) => callback(null, file.originalname),
  });
  const upload = multer({ storage }).single('file');
  upload(req, res, async (err) => {
    if (err) {
      res.statusMessage = 'Error uploading file';
      res.status(404).end();
      return;
    }

    const source = path.join(targetPath, req.file.originalname);

    extractZip(source, { dir: targetPath }, () => {
      // extraction is complete. make sure to handle the err
    });
    res.end('File is uploaded');
  });
}

module.exports = uploadData;
