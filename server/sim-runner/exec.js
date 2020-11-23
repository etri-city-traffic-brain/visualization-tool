/**
 * Simulator Runner
 */
const { spawn } = require('child_process');

const { log } = console

function exec({ script, pythonPath, params = [] }) {

  let cnt = 0;
  const process = spawn('python', [script, ...params], {
    env: {
      PYTHONPATH: pythonPath,
    }
  });

  process.stdout.on('data', data => {
    cnt += 1
    if(cnt < 5) {
      log(`stdout: ${data}`);
    }
  });

  process.stderr.on('data', data => {
    log(`stderr: ${data}`);
  });

  process.on('error', (error) => {
    log(`error: ${error.message}`);
  });

  process.on('close', code => {
    log(`child process exited with code ${code}`);
  });

  return process
}

module.exports = exec
