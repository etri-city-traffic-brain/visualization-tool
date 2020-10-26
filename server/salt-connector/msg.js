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
const MAX_VEHICLES = 48;
const EXTENT_LENGTH = 4;

const charCodes2Str = codes => codes.map(d => String.fromCharCode(d)).join('').trim()

const {
  double,
  uint32,
  float,
  int8,
  array,
  string,
} = Struct.types;

const Header = Struct([
  ['type', uint32],
  ['timestamp', double],
  ['length', uint32],
]);

/**
 * Init Message
 * direction: SALT > VIS
 */
const Init = Struct([
  ['simulationId', array(MAX_SIMULATION_ID_LENGTH, int8).transform(charCodes2Str)],
]);
Init.type = MsgType.INIT;

const Road = Struct([
  // ['lenRoadId', uint32],
  ['roadId', array(MAX_ROAD_ID_LENGTH, int8).transform(charCodes2Str)],
  // ['roadId', string(MAX_ROAD_ID_LENGTH)],
  ['speed', uint32],
  ['currentSignal', int8],
  ['numVehicles', uint32],
  // ['vehicles', array('numVehicles', int8)],
  ['vehicles', array(MAX_VEHICLES, int8)],
]);

// DIRECTION: SALT -> SLAT-VIS
const Data = Struct([
  ['numRoads', uint32],
  ['roads', array('numRoads', Road)],
]);
Data.type = MsgType.DATA;

// DIRECTION: SALT -> SLAT-VIS
const Status = Struct([
  ['status', int8],
  ['progress', uint32],

]);
Status.type = MsgType.STATUS;

// DIRECTION: SALT <- SLAT-VIS
const Set = Struct([
  ['extent', array(EXTENT_LENGTH, float)],
  ['roadType', int8],
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
  Road,
  MAX_SIMULATION_ID_LENGTH,
  MAX_ROAD_ID_LENGTH
};
