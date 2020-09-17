const R = require('ramda');
const { reduce, zipWith, map, compose, head, drop } = R;

const a1 = [1,2,3];
const a2 = [4,5,6];
const a3 = [7,8,9];
const a4 = [1,2,3];

const arr = [a1,a2, a3,];

const add = (a, b) => (a + b);

const aggregate = arr =>
  map(
    value => value / arr.length,
    reduce((arr, cur) => zipWith(add, arr, cur), head(arr), drop(1, arr))
  );


// const result = zipWith(mean, a1, a2, a3);
console.log(aggregate(arr));

