
const { fork } = require('child_process')

function main() {
  const child = fork('stats-by-tl.js')
  child.send({
    home: '/home/ubuntu/uniq-sim',
    optId: 'OPTI_202307_00979',
    region: 'cdd3'
  })
}

main()
