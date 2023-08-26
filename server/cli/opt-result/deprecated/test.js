

const tls = {
  tl1: ['link1', 'link2', 'link3'],
  tl2: ['link2', 'link3', 'link5']
}

const result = [
  { step: 1, linkId: 'link1', speed: 30 },
  { step: 2, linkId: 'link1', speed: 20 },
  { step: 3, linkId: 'link1', speed: 10 },
  { step: 4, linkId: 'link3', speed: 30 },
]

const tlInfo = {

}

function findTLs(linkId) {
  const result = []
  for (let tl in tls) {

    if (tls[tl].includes(linkId)) {
      result.push(tl)
    }
  }
  return result
}

for (let x in result) {
  const line = result[x]

  const tls = findTLs(line.linkId)

  tls.forEach(tl => {
    const info = tlInfo[tl] || {}
    if (!info.speeds) {
      info.speeds = []
    }
    tlInfo[tl] = info // overwrite
    info.speeds.push(line.speed)
  })

}
console.log(JSON.stringify(tlInfo, false, 2))
