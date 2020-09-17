/**
 * 스텝단위 링크별 속도 데이터를 링크별 평균속도 배열로 변환
 *
 */

/**
 * {
 *  step1: {
 *    link1: 10, link2: 20,
 *  },
 *  step2: {
 *   link1: 12, link2: 22,
 *  }
 * }
 * {
 *  link1: [10, 20],
 *  link2: [12, 22],
 * }
 */
// const LINK_DEFAULT_SPEED = 30; // 30 km/h
// const { keys } = Object;

// function convert(data = {}) {
//   const result = {};
//   const numOfSteps = keys(data).length;
//   const defaultValues = () => new Array(numOfSteps).fill(LINK_DEFAULT_SPEED);
//   keys(data).forEach((key, i) => {
//     const target = data[key];
//     keys(target).forEach((k) => {
//       const speedValue = target[k];
//       const speeds = result[k] || defaultValues();
//       speeds[i] = Number((+speedValue).toFixed(2)); // convert to number
//       result[k] = speeds;
//     });
//   });
//   return result;
// }

// module.exports = convert;

/* eslint no-console: 0 */
// if (require.main === module) {
//   const data = {
//     step1: {
//       link1: 10,
//       link2: 20,
//     },
//     step2: {
//       link1: 11,
//       link2: 22,
//     },
//     step3: {
//       link3: 100,
//       link2: 33,
//     },
//     step4: {
//       link5: 1,
//       link6: 2,
//     },
//   };
//   console.log(convert(data));
// }
