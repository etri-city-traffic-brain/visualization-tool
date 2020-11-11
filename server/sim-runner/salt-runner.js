/**
 * Simulator Runner
 */
const { spawn } = require("child_process");

const PYTHON = 'python'

const { log } = console

function exec({
  homeDir,
  scriptDir,
  script,
  params = [],
}) {
  let cnt = 0;
  const process = spawn(PYTHON, [`${scriptDir}/${script}`, ...params], {
    env: {
      PYTHONPATH: `${homeDir}/tools/libsalt/`
    }
  });

  process.stdout.on("data", data => {
    cnt += 1
    if(cnt < 5) {
      log(`stdout: ${data}`);
    }
  });

  process.stderr.on("data", data => {
    log(`stderr: ${data}`);
  });

  process.on('error', (error) => {
    log(`error: ${error.message}`);
  });

  process.on("close", code => {
    log(`child process exited with code ${code}`);
  });
  return process
}

module.exports = exec
