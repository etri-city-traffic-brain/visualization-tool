const fs = require('fs')
const multer = require('multer')
const path = require('path')
const util = require('util')
const unzip = util.promisify(require('extract-zip'))

const { config } = require('../../globals')

const {
  saltPath: { data }
} = config

// 업로드 신호 최적화 모델
// zip 파일 형태로 업로드
// target path: /home/ubuntu/uniq-sim/data/{optimizationId}/model/sappo

module.exports = function upload (req, res, next) {
  const { id } = req.query
  const targetPath = path.join(data, id, 'model', 'sappo')

  // prepareDir(targetPath)

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, targetPath),
    filename: (req, file, cb) => cb(null, file.originalname)
  })

  const fileFilter = (req, file, cb) => {
    if (file.originalname.endsWith('.zip')) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  }

  const upload = multer({ storage, fileFilter }).single('file')
  upload(req, res, async err => {
    if (err) {
      res.statusMessage = 'Error uploading file'
      res.status(404).end()
      return
    }

    await unzip(path.join(targetPath, req.file.originalname), {
      dir: targetPath
    })

    fs.unlink(path.join(targetPath, req.file.originalname), () => {})

    res.end('File is uploaded')
  })
}
