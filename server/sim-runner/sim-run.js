const exec = require('./salt-runner')

const script = 'default.py'
const homeDir = '/home/ubuntu/uniq-sim'
const scriptDir = `${homeDir}/scripts`

const { log } = console

const process = exec({
  homeDir,
  scriptDir,
  script,
})

process.on("close", code => {
  log(`child process exited with code ${code}`);
});
