const zero = function zero(n, max) {
  let n2 = n.toString(16).toUpperCase();
  while (n2.length < max) {
    n2 = `0${n2}`;
  }
  return n2;
};

module.exports = (buffer) => {
  const rows = Math.ceil(buffer.length / 16);
  const last = buffer.length % 16 || 16;
  let offsetLength = buffer.length.toString(16).length;
  if (offsetLength < 6) offsetLength = 6;

  let str = 'Offset';
  while (str.length < offsetLength) {
    str += ' ';
  }

  // str = `\u001b[36m${str}  `;
  str = `${str}  `;

  for (let i = 0; i < 16; i += 1) {
    str = `${str} ${zero(i, 2)}`;
  }

  // str = `${str}\u001b[0m`;
  str = `${str}`;
  if (buffer.length) str += '\n';

  let b = 0;
  let lastBytes;
  let lastSpaces;
  let v;

  for (let i = 0; i < rows; i += 1) {
    // str = `${str}\u001b[36m${zero(b, offsetLength)}\u001b[0m  `;
    str = `${str}${zero(b, offsetLength)}  `;
    lastBytes = i === rows - 1 ? last : 16;
    lastSpaces = 16 - lastBytes;

    for (let j = 0; j < lastBytes; j += 1) {
      str += ` ${zero(buffer[b], 2)}`;
      b += 1;
    }

    for (let j = 0; j < lastSpaces; j += 1) {
      str += '   ';
    }

    b -= lastBytes;
    str += '   ';

    for (let j = 0; j < lastBytes; j += 1) {
      v = buffer[b];
      str += (v > 31 && v < 127) || v > 159 ? String.fromCharCode(v) : '.';
      b += 1;
    }

    str += '\n';
  }
  return str;
};
