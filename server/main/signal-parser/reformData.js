const insertYellow = require("./insertYellow");

const MAX_SECOND = 86400;

const getAttributes = ({ _attributes }) => _attributes;

const formatter = {
  trafficSignal: (json, children) => {
    const { id: nodeID, version, crossNo, crossName, date, signalGroup } = json;
    return {
      _attributes: {
        nodeID,
        version,
        crossNo,
        crossName,
        date,
        signalGroup
      },
      ...children
    };
  },
  tod: (id, tod) => {
    const { todSeq, patternId: scheduleID, fromTime, toTime } = tod;
    return {
      _attributes: {
        id,
        todSeq,
        scheduleID,
        fromTime,
        toTime
      }
    };
  },
  schedule: (offset, id, phase) => ({
    _attributes: {
      offset,
      id
    },
    phase
  }),
  phase: (signalPhaseDefault, signalPhase, phase) => {
    const tmParser = tms => tms.split(":").map(tm => Number(tm));
    const tms = tmParser(phase);
    const tmsYellow = tmParser(
      signalPhaseDefault.find(({ type }) => type === "7").tm
    );
    const tmsRed = tmParser(
      signalPhaseDefault.find(({ type }) => type === "8").tm
    );

    const durations = tms.reduce((bucket, currDuration, index) => {
      const yellowDuration = tmsYellow[index] || 0;
      const redDuration = tmsRed[index] || 0;
      bucket.push(currDuration - yellowDuration - redDuration);
      if (yellowDuration > 0) bucket.push(yellowDuration);
      if (redDuration > 0) bucket.push(redDuration);
      return bucket;
    }, []);

    return signalPhase.map(({ state }, signalIndex) => ({
      _attributes: { state, duration: durations[signalIndex] }
    }));
  },
  plan: plan =>
    plan.map(({ offset, scheduleID: schedule, startTime }) => ({
      _attributes: {
        offset,
        schedule,
        startTime
      }
    })),
  todPlan: (defaultPlanOffset, defaultPlan, formattedPlan) => ({
    _attributes: {
      offset: defaultPlanOffset,
      defaultPlan: defaultPlan.scheduleID
    },
    plan: formattedPlan
  })
};

const getTod = (todIds, json) => {
  const { todPlan } = json;
  const filteredIds = Array.from(new Set(todIds)).sort();
  return filteredIds.reduce((bucket, id) => {
    const { tods } = todPlan.find(({ id: todId }) => Number(todId) === id);
    tods.forEach(tod => bucket.push(formatter.tod(id, tod)));
    return bucket;
  }, []);
};

const getSchedule = (
  { signalPhaseDefault, signalPhase, signalScenario },
  tods
) =>
  tods.reduce((bucket, tod) => {
    const id = getAttributes(tod).scheduleID;
    const scenario = signalScenario.find(
      ({ id: scenarioId }) => Number(scenarioId) === id
    );
    // const offset = scenario.persistalsis;
    const { offset } = scenario;
    const phase = formatter.phase(
      signalPhaseDefault,
      signalPhase,
      scenario.phase
    );
    bucket.push(formatter.schedule(offset, id, phase));
    return bucket;
  }, []);

const getSecond = ({ hour, min, sec }) => hour * 3600 + min * 60 + sec;

const getTodPlan = (todIds, tods, schedules, dates) => {
  const addSchduleInfo = (tod, index) => {
    const currentSchedule = schedules[index];
    return {
      ...getAttributes(tod),
      offset: getAttributes(currentSchedule).offset,
      duration: currentSchedule.phase.reduce(
        (duration, phase) => duration + getAttributes(phase).duration,
        0
      )
    };
  };

  const todSeqASC = ({ todSeq: prev }, { todSeq: next }) => prev - next;

  const getTime = value =>
    value
      .split(":")
      .reverse()
      .reduce((acc, time, index) => acc + Number(time) * 60 ** index, 0);

  const scheduledTods = tods.map(addSchduleInfo);
  const mappedTods = todIds
    .map(todId => scheduledTods.filter(({ id }) => id === todId))
    .sort(todSeqASC);

  const terms = dates.length;
  const startedTime = getSecond(dates[0].from);
  const finishedTime =
    getSecond(dates[terms - 1].to) + MAX_SECOND * (terms - 1) - startedTime;

  let defaultPlan;
  const plans = mappedTods.reduce((bucket, currTods, elapsedDates) => {
    const dateStartTime = MAX_SECOND * elapsedDates - startedTime;
    currTods.forEach(tod => {
      const startTime = getTime(tod.fromTime) + dateStartTime;
      if (startTime <= 0) {
        defaultPlan = {
          ...tod,
          startTime
        };
        return;
      }
      if (startTime >= finishedTime) return;
      bucket.push({
        ...tod,
        startTime
      });
    });
    return bucket;
  }, []);

  let defaultPlanOffset = Number(defaultPlan.offset) + defaultPlan.startTime;
  while (defaultPlanOffset < 0) {
    defaultPlanOffset += defaultPlan.duration;
  }
  defaultPlanOffset %= defaultPlan.duration;

  return formatter.todPlan(
    defaultPlanOffset,
    defaultPlan,
    formatter.plan(plans)
  );
};

const timePadder = value => String(value).padStart(2, "0");
const makeDateFormat = ({ year, month, date }) =>
  `${year}-${timePadder(month)}-${timePadder(date)}`;
const makeDate = strDate => new Date(strDate);

const days = ["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT"];
const holidays = [
  "2019-01-01", // 설날
  "2019-01-02", // 설날후
  "2019-03-01", // 삼일절
  "2019-05-05", // 어린이날
  "2019-04-08", // 석탄일
  "2019-06-06", // 현충일
  "2019-08-15", // 광복절
  "2019-09-12", // 추석전
  "2019-09-13", // 추석
  "2019-09-14", // 추석후
  "2019-10-03", // 개천절
  "2019-10-09", // 한글날
  "2019-12-25" // 성탄
];

// 공휴일인지 판단할 수 있게 된다면 해당 코드 수정으로 공휴일 판단
const isHoliday = strDate => holidays.some(holiday => holiday === strDate);

const getTodId = ({ from }, json) => {
  const { todPlan } = json;
  const todIds = [...new Set(todPlan.map(({ id }) => id))];
  const strDate = makeDateFormat(from);
  const fromDate = makeDate(strDate);
  const day = days[fromDate.getDay()];
  if (todIds.includes("4") && isHoliday(strDate)) return 4;
  if (todIds.includes("5") && day === "FRI") return 5;
  if (todIds.includes("3") && day === "SUN") return 3;
  if (todIds.includes("2") && day === "SAT") return 2;
  return 1;
};

const getChildren = (json, dates) => {
  const todIds = dates.map(date => getTodId(date, json));
  const tod = getTod(todIds, json);
  const schedule = getSchedule(json, tod);
  const TODPlan = getTodPlan(todIds, tod, schedule, dates);
  return {
    tod,
    schedule,
    TODPlan
  };
};

const getTrafficSignal = (json, dates) => {
  const children = getChildren(json, dates);
  return formatter.trafficSignal(json, children);
};

const parse = (json, dates) =>
  new Promise((resolve, reject) => {
    try {
      const reformedData = getTrafficSignal(json, dates);
      resolve(reformedData);
    } catch (err) {
      reject(err);
    }
  });

module.exports = (json, dates) =>
  new Promise((resolve, reject) =>
    insertYellow(json)
      .then(hasYellowSignal => parse(hasYellowSignal, dates))
      .then(reformedData => resolve(reformedData))
      .catch(err => reject(err))
  );
