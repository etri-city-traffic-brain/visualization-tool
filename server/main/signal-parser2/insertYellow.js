const objDeepCopy = obj => JSON.parse(JSON.stringify(obj));

const makeBetweenSignal = (frontPhaseState, nextPhaseState) =>
  Array.from(frontPhaseState).reduce((bucket, frontSignal, index) => {
    if (frontSignal.toUpperCase() === 'R' || nextPhaseState[index] === 'G') {
      bucket.push(frontSignal);
      return bucket;
    }
    bucket.push('y');
    return bucket;
  }, []).join('');

const signalPhaseFormat = (index, state) => ({ index, state });
const modifyPhase = (
  phase,
  length,
) => {
  const modifiedPhase = [];
  for (let currIndex = 0; currIndex < length; currIndex += 1) {
    const originalIndex = currIndex * 2 + 1;
    const originalState = phase[currIndex].state;
    modifiedPhase.push(
      signalPhaseFormat(originalIndex, originalState),
    );
    const nextIndex = (currIndex + 1) % length;
    const newIndex = currIndex * 2 + 2;
    const newState = makeBetweenSignal(
      phase[currIndex].state,
      phase[nextIndex].state,
    );
    modifiedPhase.push(
      signalPhaseFormat(newIndex, newState),
    );
  }
  return modifiedPhase;
};

const convert = json => new Promise((resolve, reject) => {
  try {
    const { signalPhase: signalPhases } = json;
    const convertedJson = objDeepCopy(json);
    const convertedSignalPhase = signalPhases
      .map(signalPhase => ({
        ...signalPhase,
        phase: modifyPhase(
          signalPhase.phase,
          signalPhase.phase.length,
        ),
      }));
    resolve({
      ...convertedJson,
      signalPhase: convertedSignalPhase,
    });
  } catch (err) {
    reject(err);
  }
});

module.exports = json => convert(json);
