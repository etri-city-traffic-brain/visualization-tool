
const charCodes2Str = codes => codes.map(d => String.fromCharCode(d)).join('')

const str2CharCodes = str => str.split('').map(d => d.charCodeAt())

module.exports = {
  charCodes2Str,
  str2CharCodes,
}
