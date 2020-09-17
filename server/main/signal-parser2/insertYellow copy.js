const {
  objDeepCopy,
} = require('../module/library');

const makeBetweenSignal = (frontPhaseState, tailPhaseState) =>
  Array.from(frontPhaseState).reduce((bucket, frontSignal, index) => {
    if (frontSignal.toUpperCase() === 'R' || tailPhaseState[index] === 'G') {
      bucket.push(frontSignal);
      return bucket;
    }
    bucket.push('y');
    return bucket;
  }, []).join('');

const signalPhaseFormat = (index, state) => ({ index, state });
const modifySignalPhase = (
  signalPhase,
  length,
  modifiedSignalPhase = [],
  index = 0,
) => {
  if (index === length) return modifiedSignalPhase;
  const originalIndex = index * 2 + 1;
  const originalState = signalPhase[index].state;
  modifiedSignalPhase.push(
    signalPhaseFormat(originalIndex, originalState),
  );
  const nextPhase = (index + 1) % length;
  const newIndex = index * 2 + 2;
  const newState = makeBetweenSignal(
    signalPhase[index].state,
    signalPhase[nextPhase].state,
  );
  modifiedSignalPhase.push(
    signalPhaseFormat(newIndex, newState),
  );
  return modifySignalPhase(signalPhase, length, modifiedSignalPhase, index + 1);
};
const convert = json => new Promise((resolve, reject) => {
  try {
    const { signalPhase } = json;
    const convertedJson = objDeepCopy(json);
    const convertedSignalPhase = modifySignalPhase(
      signalPhase,
      signalPhase.length,
    );
    resolve({
      ...convertedJson,
      signalPhase: convertedSignalPhase,
    });
  } catch (err) {
    reject(err);
  }
});

module.exports = json => convert(JSON.parse(json));
