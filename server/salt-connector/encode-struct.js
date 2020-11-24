
/**
 *
 * @param {Struct} Struct
 * @param {*} obj
 * @param {number} bufferSize
 */
module.exports = (Struct, obj, bufferSize = 1024) => Struct.encode(
  Object.assign(
    Struct(Buffer.alloc(bufferSize)),
    obj,
  ),
);
