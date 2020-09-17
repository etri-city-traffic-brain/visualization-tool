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
  tod: (id, tod, programId) => {
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
        programId,
      },
    };
  },
  schedule: (offset, id, phase, programId) => ({
    _attributes: {
      offset,
      id,
      programId,
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
  todPlan: ({ offset, schedule, programId }, formattedPlan) => ({
    _attributes: {
      offset,
      defaultPlan: schedule,
      programId,
    },
    plan: formattedPlan,
  }),
  plan: plan => plan.map(({
    offset, schedule, startTime, programId,
  }) => ({
    _attributes: {
      offset,
      schedule,
      startTime,
      programId,
    },
  })),
};

const getTodPlan = (todIds, tods, schedules, dates, { signalPhase }) => {
  const seperateTimes = Array.from(new Set(
    signalPhase.reduce((bucket, { apply: { from, to } }) => {
      bucket.push(`${from}:00`);
      bucket.push(`${to}:00`);
      return bucket;
    }, []).sort(),
  ));

  const getTodAttributes = (tod) => {
    // const objTod = getAttributes(tod);
    const objTod = tod['_attributes'];
    return Object.keys(objTod)
      .reduce((bucket, key) => {
        const obj = {};
        if (key === 'id') {
          obj.todId = objTod[key];
        } else if (key === 'scheduleID') {
          obj.schedule = objTod[key];
        } else if (key.includes('Time')) {
          obj[key] = `${objTod[key]}:00`;
        } else {
          obj[key] = objTod[key];
        }
        return { ...bucket, ...obj };
      }, {});
  };

  const getScheduleAttributes = (schedule) => {
    const objSchedule = getAttributes(schedule);
    return Object.keys(objSchedule)
      .reduce((bucket, key) => {
        const obj = {};
        if (key === 'id') {
          return bucket;
        }
        obj[key] = objSchedule[key];
        return { ...bucket, ...obj };
      }, {});
  };

  const planDatas = tods.map((tod, index) => {
    const schedule = schedules[index];
    const todAttributes = getTodAttributes(tod);
    const scheduleAttributes = getScheduleAttributes(schedule);
    const duration = schedule.phase.reduce((acc, ph) =>
      acc + Number(getAttributes(ph).duration),
    0);
    return {
      ...todAttributes,
      ...scheduleAttributes,
      duration,
    };
  });

  const getSecond = strTime => strTime.split(':').reverse()
    .reduce((acc, value, index) => acc + Number(value) * (60 ** index), 0);
  const calculateOffset = ({
    fromTime, toTime, duration, offset,
  }) => {
    const from = getSecond(fromTime);
    const to = getSecond(toTime);
    return (duration - ((to - from) % duration) + offset) % duration;
  };
  const timePadder = value => String(value).padStart(2, '0');
  return todIds.reduce((bucket, todId, index) => {
    const currentDate = dates[index];
    const [from, to] = Object.keys(currentDate).map((key) => {
      const {
        hour,
        min,
        sec,
      } = currentDate[key];
      if (key === 'to' && hour + min + sec === 0) {
        return '24:00:00';
      }
      return `${timePadder(hour)}:${timePadder(min)}:${timePadder(sec)}`;
    });
    const seperates = [...new Set([...seperateTimes, from, to])].sort();
    const currentPlans = planDatas.filter(planData => planData.todId === todId);
    const finalPlan = currentPlans.pop();
    if (finalPlan.toTime < finalPlan.fromTime) {
      const calOffset = calculateOffset({
        ...finalPlan,
        toTime: '24:00:00',
      });
      currentPlans.unshift({ ...finalPlan, fromTime: '00:00:00', offset: calOffset });
    }
    currentPlans.push({ ...finalPlan, toTime: '24:00:00' });
    const filteredPlans = currentPlans.filter(
      ({ fromTime, toTime }) => fromTime < to && toTime > from,
    );
    let seperateIndex = 0;
    const todPlans = filteredPlans.reduce((todPlan, plan, planIndex) => {

      if (plan.fromTime > seperates[seperateIndex]) {
        seperateIndex += 1;
      }
      if (seperateIndex > seperates.length) return todPlan;
      const seperate = seperates[seperateIndex];
      if (plan.toTime < seperate) return todPlan;
      if (plan.fromTime < seperate && plan.toTime > seperate) {
        todPlan[planIndex].toTime = seperate;

        if (planIndex + 1 === todPlan.length) {
          return todPlan;
        }
        todPlan[planIndex + 1].offset = calculateOffset({
          ...todPlan[planIndex],
          toTime: seperate,
        });
        todPlan[planIndex + 1].fromTime = seperate;
      }
      return todPlan;
    }, filteredPlans).map(todPlan => ({
      ...todPlan,
      startTime: getSecond(todPlan.fromTime),
    }));
    const defaultPlan = todPlans[0];
    const plans = todPlans.slice(1);

    bucket.push(formatter.todPlan(
      defaultPlan,
      formatter.plan(plans),
    ));
    return bucket;
  }, []);
};

const getSchedule = ({
  signalPhaseDefault,
  signalPhase,
  signalScenario: signalScenarios,
}, tods) => tods.reduce((bucket, tod) => {
  const {
    scheduleID: id,
    programId,
  } = getAttributes(tod);

  const scenario = signalScenarios[programId].scenarios.find(
    ({ id: scenarioId }) => scenarioId === id,
  );
  const { offset } = scenario;
  const phase = formatter.phase(
    signalPhaseDefault[programId].phaseDefault,
    signalPhase[programId].phase,
    scenario.phase,
  );
  bucket.push(formatter.schedule(offset, id, phase, programId));

  return bucket;
}, []);

const getMinutes = strTime => strTime.split(':').reverse()
  .reduce((bucket, value, index) => value * (60 ** index) + bucket, 0);

const getTod = (todIds, json) => {
  const { todPlan, signalPhase } = json;
  const programs = signalPhase
    .reduce((programBucket, { programId, apply: { from, to } }) => {
      const fromMin = getMinutes(from);
      const toMin = getMinutes(to);
      if (to < from) {
        programBucket.push({ programId, fromMin: fromMin - 1440, toMin });
        programBucket.push({ programId, fromMin, toMin: toMin + 1440 });
        return programBucket;
      }
      programBucket.push({ programId, fromMin, toMin });
      return programBucket;
    }, [])
    .sort(({ fromMin: prev }, { fromMin: next }) => prev > next);

  const filteredIds = Array.from(new Set(todIds)).sort();

  return filteredIds.reduce((bucket, id) => {
    const { tods } = todPlan.find(({ id: todId }) => todId === id);
    tods.forEach((tod) => {
      const { fromTime, toTime } = tod;
      const fromMin = getMinutes(fromTime);
      let toMin = getMinutes(toTime);
      if (toMin < fromMin) {
        toMin += 1440;
      }
      const programIds = programs.reduce((bucketProgramId, program) => {
        if (fromMin < program.toMin && toMin > program.fromMin) {
          bucketProgramId.push(program.programId);
        }
        return bucketProgramId;
      }, []);
      programIds.forEach((programId) => {
        bucket.push(formatter.tod(id, tod, programId));
      });
    });
    return bucket;
  }, []);
};

const makeDate = ({ year, month, date }) =>
  new Date(`${year}-${month}-${date}`);

const days = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THR',
  'FRI',
  'SAT',
];
const getTodId = ({ from }) => {
  const fromDate = makeDate(from);
  const day = days[fromDate.getDay()];
  // todId 가져옴에 있어서 API 필요((ex) 월~수, 수~금, 등 조건 때문)
  // if (hollyday) return 4; 위의 API호출이 가능하면 해결됨.
  if (day === 'SUN') return 3;
  if (day === 'SAT') return 2;
  return 1;
};

const getChildren = (json, dates) => {
  const todIds = dates.map(date => getTodId(date));
  const tod = getTod(todIds, json);
  const schedule = getSchedule(json, tod);
  const TODPlan = getTodPlan(todIds, tod, schedule, dates, json);
  return {
    tod,
    schedule,
    TODPlan,
  };
};

const reformData = (json, dates) => new Promise((resolve, reject) => {
  try {
    const children = getChildren(json, dates);
    resolve(formatter.trafficSignal(json, children));
  } catch (err) {
    reject(err);
  }
});

module.exports = (json, dates) =>
  new Promise((resolve, reject) =>
    insertYellow(json)
      .then(hasYellowSignal => reformData(hasYellowSignal, dates))
      .then(reformedData => resolve(reformedData))
      .catch(err => reject(err)));
