

import * as R from 'ramda'

const convertArrayToObject = (array, lensPathArray = []) => {
  const view = R.view(R.lensPath(lensPathArray))
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [view(item)]: item,
    };
  }, initialValue);
};

export default convertArrayToObject
