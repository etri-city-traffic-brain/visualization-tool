
export default ({data = [], backgroundColor = [], labels = [],}={}) => ({
  labels,
  datasets: [{
    data,
    backgroundColor,
  }],
})
