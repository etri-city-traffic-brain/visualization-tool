const Moment = require('moment');
const jsonToXml = require('xml-js');
const reformData = require('./reformData');

const error = {
  json: Error('Json is empty'),
  dateTime: Error('Input is not dateTime format'),
  invalidate: Error('Invalidate start time and finish time'),
};

const momentToObj = moment => ({
  year: moment.year(),
  month: moment.month() + 1,
  date: moment.date(),
  hour: moment.hour(),
  min: moment.minute(),
  sec: moment.second(),
});

const makeMomentFactory = moment => dateTime => new Promise((resolve, reject) => {
  try {
    const currentMoment = moment(`${dateTime}`);
    resolve(currentMoment);
  } catch (e) {
    reject(error.dateTime);
  }
});

const isValid = (fromMoment, toMoment) => new Promise((resolve, reject) => {
  const diffSeconds = toMoment.diff(fromMoment, 'seconds');
  diffSeconds < 0 || diffSeconds > 604800
    ? reject(error.invalidate)
    : resolve({ fromMoment, toMoment });
});

const getDates = (startMoment, endMoment, resultMoments = []) => {
  const nextMoment = Moment(
    startMoment,
  ).add(1, 'day').hour(0).minute(0)
    .second(0);
  const nextIsEarlier = endMoment.diff(nextMoment, 'seconds') > 0;

  const resultMoment = { from: momentToObj(Moment(startMoment)) };
  resultMoment.to = nextIsEarlier
    ? momentToObj(Moment(nextMoment))
    : momentToObj(Moment(endMoment));
  resultMoments.push(resultMoment);

  return nextIsEarlier
    ? getDates(nextMoment, endMoment, resultMoments)
    : resultMoments;
};

const xmlFormat = trafficSignals => ({
  _declaration: {
    _attributes: {
      version: '1.0',
      encoding: 'UTF-8',
      standalon: 'yes',
    },
  },
  trafficSignalSystem: {
    trafficSignal: trafficSignals,
  },
});

module.exports = ({ json, from, to }) => new Promise((resolve, reject) => {
  if (!json) return reject(error.json);
  if (!from || !to) return reject(error.dateTime);
  const momentFactory = makeMomentFactory(Moment);
  Promise.all([from, to].map(dateTime => momentFactory(dateTime)))
    .then(([fromMoment, toMoment]) => isValid(fromMoment, toMoment))
    .then(({ fromMoment, toMoment }) => {
      const dates = getDates(fromMoment, toMoment);
      return reformData(json, dates);
    })
    .then((reformedDatas) => {
      const xmlJsonData = xmlFormat(reformedDatas);
      const xmlData = jsonToXml.json2xml(
        xmlJsonData, { compact: true, spaces: 4 },
      );
      resolve(xmlData);
    })
    .catch(err => reject(err));
});
