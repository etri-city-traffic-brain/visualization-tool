
import * as R from 'ramda';

const codeMap = {
  g: 'green',
  G: 'lightgreen',
  r: 'red',
  y: 'yellow',
};

const colorMap = R.fromPairs(R.map(pair => [pair[1], pair[0]], R.toPairs(codeMap)));

const signalCodeToColor = code => codeMap[code] || 'gray';
const signalColorToCode = color => colorMap[color] || 'g';

const changeColor = (color) => {
  if (color === 'green') return 'red';
  if (color === 'red') return 'green';
  if (color === 'yellow') return 'green';
  return 'green';
};

export default {
  signalCodeToColor,
  signalColorToCode,
  changeColor,
};
