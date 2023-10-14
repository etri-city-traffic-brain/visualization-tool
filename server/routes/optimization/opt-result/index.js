const FileService = require('./service/file-service')
const AnalyseService = require('./service/analyse-service')
const OptimizeService = require('./service/optimize-service')

function App() {
  const optimizeService = OptimizeService()
  const fileService = FileService()

  async function makeReports(filepathFt, filepathRl) {
    const analyseServiceFt = AnalyseService()
    const analyseServiceRl = AnalyseService()



    await Promise.all([
      fileService.readByLine(filepathFt, analyseServiceFt.onLine),
      fileService.readByLine(filepathRl, analyseServiceRl.onLine)
    ])
    const targetMax = Math.min(analyseServiceFt.getMaxStep(), analyseServiceRl.getMaxStep())
    const reportFt = analyseServiceFt.get(targetMax)
    const reportRl = analyseServiceRl.get(targetMax)
    const reportOp = optimizeService.optimize(reportFt, reportRl)

    return Object.freeze({ reportFt, reportRl, reportOp })
  }
  async function makeReportFiles(filepathFt, filepathRl, dirpathOutput = './') {
    const { reportFt, reportRl, reportOp } = await makeReports(filepathFt, filepathRl)

    const writterFt = await fileService.Writter(fileService.join(dirpathOutput, 'ft.json'))
    const writterRl = await fileService.Writter(fileService.join(dirpathOutput, 'rl.json'))
    const writterOp = await fileService.Writter(fileService.join(dirpathOutput, 'op.json'))

    await fileService.mkdir(dirpathOutput)
    writterFt.write(JSON.stringify(reportFt, null, 2))
    writterRl.write(JSON.stringify(reportRl, null, 2))
    writterOp.write(JSON.stringify(reportOp, null, 2))

    console.log('- reports created')
  }

  return Object.freeze({
    makeReports,
    makeReportFiles
  })
}

module.exports = App
