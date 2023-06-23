const fs = require('node:fs')
const path = require('node:path')
const readline = require('node:readline')

function FileService () {
  function mkdir (dirpath) {
    return new Promise((resolve, reject) => {
      fs.mkdir(dirpath, { recursive: true }, (err, path) => {
        err ? reject(err) : resolve(path)
      })
    })
  }

  function rmdir (dirpath) {
    return new Promise((resolve, reject) => {
      fs.rm(dirpath, { recursive: true, force: true }, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  function join (...paths) {
    return path.join(...paths)
  }

  function readByLine (filepath, onLine) {
    return new Promise((resolve, reject) => {
      let err = null
      const readableStreamFile = fs.createReadStream(filepath)
      const rl = readline.createInterface({
        input: readableStreamFile
      }).on('close', () => {
        console.log('- finished to read', filepath)
        err ? reject(err) : resolve()
      }).on('line', async function callback (line) {
        try {
          (onLine || console.log)(line)
        } catch (error) {
          err = error
          console.error('- LineReader callback has something wrong')
          console.error(error)
          rl.close()
        }
      })
    })
  }

  function Writter (filepath) {
    const writableStream = fs.createWriteStream(filepath, { encoding: 'utf-8' })

    function write (data) {
      writableStream.write(data)
    }
    function close () {
      writableStream.close()
    }

    return Object.freeze({ write, close })
  }

  return Object.freeze({
    mkdir,
    rmdir,
    join,
    readByLine,
    Writter
  })
}
module.exports = FileService
