const insertYellow = require('./insertYellow');

const getAttributes = ({ _attributes }) => _attributes;

const formatter = {
  trafficSignal: (json, children) => {
    const {
      id: nodeID,
      version,
      crossNo,
      crossName,
      date,
      signalGroup,
    } = json;
    return {
      _attributes: {
        nodeID, version, crossNo, crossName, date, signalGroup,
      },
      ...children,
    };
  },
  tod: (id, tod) => {
    const {
      todSeq,
      patternId: scheduleID,
      fromTime,
      toTime,
    } = tod;
    return {
      _attributes: {
        id,
        todSeq,
        scheduleID,
        fromTime,
        toTime,
      },
    };
  },
  schedule: (offset, id, phase) => ({
    _attributes: {
      offset,
      id,
    },
    phase,
  }),
  phase: (signalPhaseDefault, signalPhase, phase) => {
    const tmParser = tms => tms.split(':').map(tm => Number(tm));
    const tms = tmParser(phase);
    const tmsYellow = tmParser(signalPhaseDefault[6].tm);
    const tmsRed = tmParser(signalPhaseDefault[7].tm);
    const tmsBetween = tmsYellow.map((tmYellow, index) =>
      tmYellow + tmsRed[index]);

    return signalPhase.map(({ state }, signalIndex) => {
      const index = Math.floor(signalIndex / 2);
      return {
        _attributes: signalIndex % 2
          ? { state, duration: tmsBetween[index] }
          : { state, duration: tms[index] - tmsBetween[index] },
      };
    });
  },
  plan: plan => plan.map(({ offset, schedule, startTime }) => ({
    _attributes: {
      offset,
      schedule,
      startTime,
    },
  })),
  todPlan: (defaultPlanOffset, defaultPlan, formattedPlan) => ({
    _attributes: {
      offset: defaultPlanOffset,
      defaultPlan: defaultPlan.schedule,
    },
    plan: formattedPlan,
  }),
};

const getTod = (todIds, json) => {
  const { todPlan } = json;
  const filteredIds = Array.from(new Set(todIds)).sort();
  return filteredIds.reduce((bucket, id) => {
    const { tods } = todPlan.find(({ id: todId }) => todId === id);
    tods.forEach(tod => bucket.push(formatter.tod(id, tod)));
    return bucket;
  }, []);
};

const getSchedule = ({
  signalPhaseDefault,
  signalPhase,
  signalScenario,
}, tods) => tods.reduce((bucket, tod) => {
  const id = getAttributes(tod).scheduleID;
  const scenario = signalScenario.find(
    ({ id: scenarioId }) => scenarioId === id,
  );
  // const offset = scenario.persistalsis;
  const { offset } = scenario;
  const phase = formatter.phase(
    signalPhaseDefault,
    signalPhase,
    scenario.phase,
  );
  bucket.push(formatter.schedule(offset, id, phase));
  return bucket;
}, []);

const days = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THR',
  'FRI',
  'SAT',
];

const getCurrentPlanData = (todId, tods, schedules) => {
  const addSchduleInfo = (tod, index) => {
    const currentSchedule = schedules[index];
    return {
      ...getAttributes(tod),
      offset: getAttributes(currentSchedule).offset,
      duration: currentSchedule.phase
        .reduce((duration, phase) =>
          duration + getAttributes(phase).duration, 0),
    };
  };

  const hasTodId = planData => planData.id === todId;

  const byTodSeq = (curr, next) => curr.todSeq - next.todSeq;

  const currentPlanData = ({
    offset, scheduleID, fromTime, duration,
  }) => {
    const startTime = fromTime.split(':').reverse(
    ).reduce((startTime, value, index) => {
      const measure = Math.pow(60, index + 1);
      const num = Number(value);
      return measure * num + startTime;
    }, 0);
    return {
      offset, schedule: scheduleID, startTime, duration,
    };
  };

  return tods
    .map(addSchduleInfo)
    .filter(hasTodId)
    .sort(byTodSeq)
    .map(currentPlanData);
};

const MAX_SECOND = 86400;

const getSecond = ({ hour, min, sec }) => hour * 3600 + min * 60 + sec;

const getRange = ({ from, to }) => {
  const fromTime = getSecond(from);
  const toTime = getSecond(to);
  return {
    fromTime,
    toTime: toTime || MAX_SECOND,
  };
};

const getDefaultPlanIndex = (fromTime, plans) => {
  const planSize = plans.length;
  const index = plans.findIndex(({ startTime }) => startTime > fromTime);
  return (index - 1 + planSize) % planSize;
};

const getDefaultPlanOffset = (defaultPlan, fromTime) => {
  const {
    offset,
    startTime,
    duration,
  } = defaultPlan;
  const interval = (MAX_SECOND + fromTime - startTime) % MAX_SECOND;
  const timeDistance = interval - offset;
  const cycles = Math.ceil(timeDistance / duration);
  return (duration * cycles - timeDistance) % duration;
};

const getTodPlan = (todIds, tods, schedules, dates) => {
  const TODPlans = todIds
    .map(todId => getCurrentPlanData(todId, tods, schedules));

  return TODPlans.reduce((bucket, plans, index) => {
    const { fromTime, toTime } = getRange(dates[index]);
    const defaultPlanIndex = getDefaultPlanIndex(fromTime, plans);
    const defaultPlan = plans[defaultPlanIndex];
    const defaultPlanOffset = getDefaultPlanOffset(defaultPlan, fromTime);
    const plan = plans
      .slice(defaultPlanIndex + 1)
      .filter(plan => plan.startTime < toTime);
    const formattedPlan = formatter.plan(plan);
    bucket.push(
      formatter.todPlan(defaultPlanOffset, defaultPlan, formattedPlan),
    );
    return bucket;
  }, []);
};

const makeDate = ({ year, month, date }) =>
  new Date(`${year}-${month}-${date}`);

const getTodId = ({ from }) => {
  const fromDate = makeDate(from);
  const day = days[fromDate.getDay()];
  // 공휴일 판단
  // if (hollyday) return 4;
  if (day === 'SUN') return 3;
  if (day === 'SAT') return 2;
  return 1;
};

const getChildren = (json, dates) => {
  const todIds = dates.map(date => getTodId(date));
  const tod = getTod(todIds, json);
  const schedule = getSchedule(json, tod);
  const TODPlan = getTodPlan(todIds, tod, schedule, dates);
  return {
    tod,
    schedule,
    TODPlan,
  };
};

const getTrafficSignal = (json, dates) => {
  const children = getChildren(json, dates);
  return formatter.trafficSignal(json, children);
};

const reformSignal = (json, dates) => getTrafficSignal(json, dates);
const parse = (json, dates) => new Promise((resolve, reject) => {
  try {
    const reformedData = reformSignal(json, dates);
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
      .catch(err => reject(err)));
