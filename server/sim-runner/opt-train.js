const exec = require('./salt-runner')

// const script = 'RL_2phase_pressure.py'
// const homeDir = '/home/ubuntu/traffic-simulator'
// const scriptDir = `${homeDir}/test/libsalt`
const script = 'RL_2phase_pressure.py'
const homeDir = '/home/ubuntu/uniq-vis'
const scriptDir = `${homeDir}`
const params = ['--mode', 'train']
exec({
  homeDir,
  scriptDir,
  script,
  params
})
