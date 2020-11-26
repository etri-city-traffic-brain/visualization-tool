/**
 * Protocl Definition
 * between SALT and SALT-VIS
 *
 * author: beanpole
 * last modified: 2020-10-13
 */

const Struct = require('awestruct');
const { MsgType } = require('./salt-msg-type');

const MAX_SIMULATION_ID_LENGTH = 17;
const MAX_ROAD_ID_LENGTH = 16;
const MAX_VEHICLES = 48;
const EXTENT_LENGTH = 4;

// const { charCodes2Str } = require('./utils')
const charCodes2Str = codes => codes.map(d => String.fromCharCode(d)).join('').replace(/\0/g,'').trim()

const {
  double,
  uint32,
  float,
  int8,
  array,
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
  ['roadId', array(MAX_ROAD_ID_LENGTH, int8).transform(charCodes2Str)],
  ['speed', uint32],
  ['currentSignal', int8],
  ['numVehicles', uint32],
  ['vehicles', array(MAX_VEHICLES, int8)],
]);

/**
 * Data Message
 * DIRECTION: SALT -> SLAT-VIS
 */
const Data = Struct([
  ['numRoads', uint32],
  ['roads', array('numRoads', Road)],
]);
Data.type = MsgType.DATA;

/**
 * Status Message
 * DIRECTION: SALT -> SLAT-VIS
 */
const Status = Struct([
  ['status', int8],
  ['progress', uint32],
]);
Status.type = MsgType.STATUS;


/**
 * Set Message
 * DIRECTION: SALT <- SLAT-VIS
 */
const Set = Struct([
  ['extent', array(EXTENT_LENGTH, float)],
  ['roadType', int8],
]);

Set.type = MsgType.SET;

/**
 * Stop Message
 * DIRECTION: SALT <- SLAT-VIS
 */
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
