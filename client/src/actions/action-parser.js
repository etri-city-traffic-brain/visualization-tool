function parseDuration(duration) {
  const result = duration.slice()
  for (let i = 0; i < duration.length; i++) {
    if (duration[i] < 5) {
      result[i - 1] = duration[i - 1] + duration[i]
    }
  }
  return result.filter(v => v >= 5)
}

function parseActions(str = '') {
  const values = str.split('#')
  if (values.length < 3) {
    return null
  }
  const durationStr = values[2].split('_').map(v => Number(v))

  return {
    action: Number(values[0]),
    offset: Number(values[1]),
    duration: parseDuration(durationStr)
  }
}

export default parseActions
