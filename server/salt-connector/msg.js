/**
 * Protocl Definition
 * between SALT and SALT-VIS
 *
 * author: beanpole
 * last modified: 2020-09-05
 */

const Struct = require('awestruct');

const MsgType = {
  INIT: 0,
  DATA: 1,
  STATUS: 2,
  SET: 10,
  STOP: 11,
};

const SIMULATION_ID_LENGTH = 17;

const {
  doublebe,
  uint32be: uint32,
  floatbe: float,
  int8,
  array,
  string,
} = Struct.types;

const Header = Struct([
  ['type', uint32],
  ['timestamp', doublebe],
]);

// DIRECTION: SALT -> SLAT-VIS
const Init = Struct([
  ['header', Header],
  ['simulationId', string(SIMULATION_ID_LENGTH)],
]);

const Road = Struct([
  ['lenRoadId', uint32],
  ['roadId', string('lenRoadId')],
  ['speed', uint32],
  ['numVehicles', uint32],
  ['vehicles', array('numVehicles', int8)],
  ['currentSignal', int8],
]);

// DIRECTION: SALT -> SLAT-VIS
const Data = Struct([
  ['header', Header],
  ['numRoads', uint32],
  ['roads', array('numRoads', Road)],
]);

// DIRECTION: SALT -> SLAT-VIS
const Status = Struct([
  ['header', Header],
  ['status', uint32],
  ['progress', uint32],

]);

// DIRECTION: SALT <- SLAT-VIS
const Set = Struct([
  ['header', Header],
  ['extent', array(4, float)],
  ['roadType', uint32],
]);

// DIRECTION: SALT <- SLAT-VIS
const Stop = Struct([
  ['header', Header],
]);

module.exports = {
  MsgType,
  Header,
  Init,
  Set,
  Stop,
  Status,
  Data,
};
