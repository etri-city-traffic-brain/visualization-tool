// const { objDeepCopy } = require("../module/library");
const objDeepCopy = obj => JSON.parse(JSON.stringify(obj))

const getTm = ({ tm }) => tm.split(":").map(value => Number(value));
const getTms = ({ signalPhaseDefault }) => ({
  yellowTm: getTm(signalPhaseDefault.find(({ type }) => type === "7")),
  redTm: getTm(signalPhaseDefault.find(({ type }) => type === "8"))
});

const convert = json =>
  new Promise((resolve, reject) => {
    try {
      const { signalPhase } = json;
      const originalJson = objDeepCopy(json);

      const { yellowTm, redTm } = getTms(json);
      const modifiedPhases = signalPhase
        .reduce((bucket, currPhase, index) => {
          const nextPhase = signalPhase[(index + 1) % signalPhase.length];
          bucket.push(currPhase);
          if (yellowTm[index]) {
            bucket.push({
              ...currPhase,
              state: [...currPhase.state]
                .map((signal, sIndex) => {
                  const signals = `${signal}${
                    nextPhase.state[sIndex]
                  }`.toUpperCase();
                  return signals === "GR" ? "y" : signal;
                })
                .join("")
            });
          }
          if (redTm[index]) {
            bucket.push({
              ...currPhase,
              state: [...currPhase.state]
                .map((signal, sIndex) => {
                  const signals = `${signal}${
                    nextPhase.state[sIndex]
                  }`.toUpperCase();
                  return signals === "GR" ? "r" : signal;
                })
                .join("")
            });
          }
          return bucket;
        }, [])
        .map((obj, index) => ({
          ...obj,
          index: String(index + 1)
        }));

      resolve({
        ...originalJson,
        signalPhase: modifiedPhases
      });
    } catch (err) {
      reject(err);
    }
  });

module.exports = json => {
  if (typeof json === "string") {
    return convert(JSON.parse(json));
  }
  return convert(json);
};
