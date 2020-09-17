import moment from 'moment';

export default (startTime, endTime) => {
  const start = moment(startTime);
  const end = moment(endTime);

  const minutes = end.diff(start, 'minutes');
  const interval = moment().hour(0).minute(minutes);
  const text = interval.format("HH:mm")
  const x = text.split(':');
  if(x[0] === '00') {
    return x[1] + '분'
  } else {
    return `${x[0]}시간${x[1]}분`
  }
}
