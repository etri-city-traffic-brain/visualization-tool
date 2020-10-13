const MsgType = {
  INIT: 0,
  DATA: 1,
  STATUS: 2,
  SET: 10,
  STOP: 11,
};

const StatusType = {
  RUNNING: 0,
  FINISHED: 1,
  FAILURE: 2,
};

const RoadType = {
  LINK: 0,
  CELL: 1,
};

const SignalType = {
  RED: 0,
  GREEN: 1,
};

const VehicleType = {
  SMALL: 0,
  LARGE: 1,
};

module.exports = {
  MsgType,
  StatusType,
  RoadType,
  SignalType,
  VehicleType,
};
