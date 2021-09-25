
export default ([labels = [], data = []] = []) => {
  return {
    labels,
    datasets: [{
      label: '보상',
      backgroundColor: 'skyblue',
      borderColor: 'skyblue',
      data,
      fill: false,
      borderWidth: 1,
      pointRadius: 1
    }]
  }
}
