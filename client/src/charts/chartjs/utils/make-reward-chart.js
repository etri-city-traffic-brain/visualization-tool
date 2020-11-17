
export default ([labels = [], data = []]= []) => {
  return {
    labels,
    datasets: [{
      label: 'Reward',
      backgroundColor: 'skyblue',
      borderColor: 'skyblue',
      data,
      fill: false,
    }]
  }
}
