
const { Init, Data, Set, MsgType } = require('./msg');
const encode = require('./encode');

const makeHeader = type => ({
  type,
  timestamp: new Date().getTime(),
})

module.exports = {
  makeInit(obj) {
    return encode(Init, {
      header: {
        type: MsgType.INIT,
        timestamp: new Date().getTime(),
      },
      ...obj
    });
  },
  makeData(obj) {
    return encode(Data, {
      header: {
        type: MsgType.DATA,
        timestamp: new Date().getTime(),
      },
      ...obj
    });
  },
  makeSet(obj) {
    return encode(Set, {
      header: makeHeader(MsgType.SET),
      ...obj
    });
  }
};
