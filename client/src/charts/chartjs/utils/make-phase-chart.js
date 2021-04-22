const makePhaseChart = (data, type) => {
  const colors = ['skyblue', 'orange', 'green', 'blue', 'red']
  // const sl = type === 'fixed' ? 1 : 2
  const datasets = data.slice(1).map((d, i) => {
    return {
      label: `phase ${i}`,
      backgroundColor: colors[i],
      data: d

    }
  })
  // console.log(datasets.length)

  return {
    labels: data[0],
    datasets
    // datasets: [{
    //   label: 'Dataset 1',
    //   backgroundColor: 'skyblue',
    //   data: data[1]
    // }, {
    //   label: 'Dataset 2',
    //   backgroundColor: 'orange',
    //   data: data[2]
    // }]
  }
}

export default makePhaseChart
