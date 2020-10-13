/**
 * Protocl Definition
 * between SALT and SALT-VIS
 *
 * author: beanpole
 * last modified: 2020-10-13
 */

const Struct = require('awestruct');
const { MsgType } = require('./type');

const MAX_SIMULATION_ID_LENGTH = 17;
const MAX_ROAD_ID_LENGTH = 16;
const HEADER_LENGTH = 16;

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
  ['length', uint32],
]);

// DIRECTION: SALT -> SLAT-VIS
const Init = Struct([
  // ['header', Header],
  ['simulationId', string(MAX_SIMULATION_ID_LENGTH)],
]);
Init.type = MsgType.INIT;

const Road = Struct([
  // ['lenRoadId', uint32],
  ['roadId', string(MAX_ROAD_ID_LENGTH)],
  ['speed', uint32],
  ['numVehicles', uint32],
  ['vehicles', array('numVehicles', int8)],
  ['currentSignal', int8],
]);

// DIRECTION: SALT -> SLAT-VIS
const Data = Struct([
  // ['header', Header],
  ['numRoads', uint32],
  ['roads', array('numRoads', Road)],
]);
Data.type = MsgType.DATA;

// DIRECTION: SALT -> SLAT-VIS
const Status = Struct([
  // ['header', Header],
  ['status', uint32],
  ['progress', uint32],

]);
Status.type = MsgType.STATUS;

// DIRECTION: SALT <- SLAT-VIS
const Set = Struct([
  // ['header', Header],
  ['extent', array(4, float)],
  ['roadType', uint32],
]);

Set.type = MsgType.SET;


// DIRECTION: SALT <- SLAT-VIS
const Stop = Struct([
  ['header', Header],
]);
Stop.type = MsgType.STOP;

module.exports = {
  Header,
  Init,
  Set,
  Stop,
  Status,
  Data,
};
