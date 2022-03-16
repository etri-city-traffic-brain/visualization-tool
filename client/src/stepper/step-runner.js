
export default (max, callback) => {
  let position = 0
  let interval

  function doWork () {
    if (callback && typeof callback === 'function') {
      callback(position)
    }

    position += 1
    if (position >= max) {
      position = 0
    }
  }

  function start (once) {
    if (once) {
      doWork()
      return
    }
    if (!interval) {
      interval = setInterval(doWork, 1000)
    }
  }

  function update (idx) {
    position = +idx
    doWork(position)
  }

  function stop () {
    clearInterval(interval)
    interval = null
  }

  function status () {
    return Boolean(interval)
  }

  return {
    start,
    stop,
    update,
    status
  }
}
