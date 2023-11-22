import moment from 'moment'

// import simulationService from '@/service/simulation-service'
import optService from '@/service/optimization-service'
import SignalMap from '@/components/SignalMap'
import SignalEditor from '@/pages/SignalEditor'
import { HTTP } from '@/http-common'
import SignalGroupSelection from '@/pages/SignalGroupSelection'

const random = () => `${Math.floor(Math.random() * 1000)}`
const generateRandomId = (prefix = 'DEFU') =>
  `${prefix.substring(0, 4).toUpperCase()}_${moment().year()}${moment().format(
    'MM'
  )}_${random().padStart(5, '0')}`
const format = date => moment(date).format('YYYY-MM-DD')
const getToday = () => format(new Date())

const periodOptions = [
  { value: 15, text: '15초' },
  { value: 30, text: '30초' },
  { value: 1 * 60, text: '1분' },
  { value: 5 * 60, text: '5분' },
  { value: 10 * 60, text: '10분' },
  { value: 20 * 60, text: '20분' },
  { value: 30 * 60, text: '30분' },
  { value: 60 * 60, text: '1시간' },
  { value: 120 * 60, text: '2시간' }
]

const areaOptions = [

]

const scriptOptions = [{ value: 'run.py', text: 'run.py' }]

const actionOptions = [
  // { value: 'offset', text: 'offset - 옵셋 조정' }, // default
  // { value: 'kc', text: 'kc - 즉시 신호 변경' },
  // { value: 'gr', text: 'gr - 녹색시간 조정' },
  // { value: 'gro', text: 'gro - 녹색시간과 옵셋 조정' }
  { value: 'ga', text: 'ga - 현시 주기 만족' },
  { value: 'gt', text: 'gt - 현시 최소최대 만족' },

]
const methodOptions = [
  { value: 'sappo', text: 'SAPPO' },
  { value: 'ddqn', text: 'DDQN' },
  { value: 'sappo_rnd', text: 'SAPPO_RND' }
]
const rewardFuncOptions = [
  { value: 'wq', text: 'wq - 대기 큐 길이' },
  { value: 'pn', text: 'pn - 통과 차량 수' },
  { value: 'wt', text: 'wt - 대기 시간' },
  // { value: 'tt', text: 'tt - 통과 소요 시간' },
  // { value: 'cwq', text: 'cwq - 축적된 대기 큐 길이' }
]

const stateOptions = [
  { value: 'vd', text: 'vd - 차량 수와 밀도' },
  { value: 'v', text: 'v - 차량 수' },
  { value: 'd', text: 'd - 차량 밀도' },
  // { value: 'vdd', text: 'vdd - 차량 수를 밀도로 나눈 값' }
]

const intervalOptions = [
  { text: '10 Step', value: 10 },
  { text: '20 Step', value: 20 },
  { text: '30 Step', value: 30 },
  { text: '40 Step', value: 40 },
  { text: '50 Step', value: 50 },
  { text: '60 Step', value: 60 },
  { text: '70 Step', value: 70 },
  { text: '80 Step', value: 80 },
  { text: '90 Step', value: 90 },
  { text: '100 Step', value: 100 }
]

const lrOptions = [
  { text: '0.0001', value: 0.0001 },
  { text: '0.005', value: 0.005 },
]

const memLenOptions = [
  { text: '16', value: 16 },
  { text: '32', value: 32 },
  { text: '64', value: 64 },
  { text: '128', value: 128 },
  { text: '256', value: 256 },
  { text: '512', value: 512 },
]


const { log } = console

export default {
  name: 'uniq-registration',
  props: [
    'userId',
    'modalName',
    'intersectionField',
    'epochField',
    'role',
    'env'
  ],
  components: {
    SignalMap,
    SignalEditor,
    SignalGroupSelection
  },
  data() {
    return {
      envName: generateRandomId('Exp'), //
      id: generateRandomId(this.role), //
      description: '...', //
      fromDate: getToday(), //
      toDate: getToday(), //
      fromTime: '07:00', //
      toTime: '08:59', //
      periodSelected: periodOptions[1].value, //
      areaSelected: '', //
      scriptSelected: scriptOptions[0].value, //
      intervalSelected: intervalOptions[0].value, //
      actionOptionSelected: actionOptions[0].value, //
      methodOptionSelected: methodOptions[0].value, //
      rewardFuncOptionSelected: rewardFuncOptions[0].value, //
      stateOptionSelected: stateOptions[0].value,
      lrSelected: lrOptions[0].value,
      memLenSelected: memLenOptions[0].value,
      junctionId: '',
      epoch: 10,
      extent: null, // current map extent
      // dockerImage: 'images4uniq/optimizer:v1.1a.20220531',
      dockerImage: '',
      imageOptions: [],
      periodOptions: [...periodOptions],
      areaOptions: [...areaOptions],
      scriptOptions: [...scriptOptions],
      intervalOptions: [...intervalOptions],
      stateOptions: [...stateOptions],
      actionOptions,
      methodOptions,
      rewardFuncOptions,
      lrOptions: [...lrOptions],
      memLenOptions: [...memLenOptions],
      loading: false,
      showMap: false,
      showEnv: true,
      modelSavePeriod: 5,
      center: {},
      scenario: [],
      signalGroups: ['SA 101', 'SA 103']
    }
  },
  async mounted() {

    HTTP({
      url: '/salt/v1/helper/docker',
      method: 'get'
    })
      .then(r => r.data)
      .then(d => {
        this.imageOptions = d.optimization.images
        this.dockerImage = this.imageOptions[0]
      })

    const scenario = await optService.getScenario()

    this.scenario = scenario
    this.areaOptions = scenario.map(s => {
      return {
        value: s.region,
        text: s.description,
      }
    })


    if (this.modalName === 'create-simulation-modal') {
      this.showEnv = false
    }
    const env = this.env
    if (this.env) {
      this.envName = env.envName
      this.description = env.description
      this.fromDate = env.configuration.fromDate
      this.toDate = env.configuration.toDate
      this.fromTime = env.configuration.fromTime.slice(0, 5)
      this.toTime = env.configuration.toTime.slice(0, 5)
      this.periodSelected = env.configuration.period
      this.areaSelected = env.configuration.region

      this.scriptSelected = env.configuration.script
      this.intervalSelected = env.configuration.interval

      this.actionOptionSelected = env.configuration.action
      this.methodOptionSelected = env.configuration.method
      this.rewardFuncOptionSelected = env.configuration.rewardFunc
      this.junctionId = env.configuration.junctionId
      this.epoch = env.configuration.epoch
      this.dockerImage = env.configuration.dockerImage
      this.modelSavePeriod = env.configuration.modelSavePeriod
      this.center = env.configuration.center

      this.memLenSelected = env.configuration.memLen
      this.lrSelected = env.configuration.lr
    }

    // this.regionChanged(this.areaSelected)
    // log(this.junctionId)
  },

  methods: {
    async regionChanged(v) {
      const obj = this.scenario.find(item => item.region === v)
      if (obj) {
        // this.junctionId = obj.tls.join(',')
      }
      const scenario = this.scenario.find(s => {
        return s.region === v
      })

      if (scenario) {
        const groups = await optService.getSignalGroups(scenario.region)
        this.signalGroups = {
          targetGroups: scenario.tls,
          totalGroups: groups
        }
      }
    },
    openSignalMap() {
      this.$refs['signal-map'].show()
    },
    resetForm() {
      this.id = generateRandomId(this.role)
      this.description = '...'
    },
    async register() {

      const from = moment(`${this.fromDate} ${this.fromTime}`)
      const to = moment(`${this.toDate} ${this.toTime}`)
      const begin = moment.duration(this.fromTime).asSeconds()
      const end = to.diff(from) / 1000 - 60 + begin
      const days = to.diff(from, 'days') + 1
      const day = from.day()

      if (!this.envName || this.envName.length < 3) {
        this.$bvToast.toast('환경 이름이 너무 짧거나 비어 있습니다.(3글자이상)')
        return
      }

      if (!this.junctionId) {
        this.$bvToast.toast('대상 교차로 그룹이 비었습니다.')
        return
      }

      if (!this.center.x) {
        log('center:', this.center)
        this.$bvToast.toast('지도의 중앙이 설정되지 않았습니다.')
        return
      }


      const regionName = this.areaOptions.find(v => v.value === this.areaSelected)


      const simulationConfig = {
        id: this.id,
        user: this.userId,
        description: this.description,
        role: this.role,
        type: this.role,
        envName: this.envName,
        configuration: {
          region: this.areaSelected,
          regionName: regionName.text,
          extent: this.extent,
          fromDate: this.fromDate,
          toDate: this.toDate,
          fromTime: `${this.fromTime}:00`,
          toTime: `${this.toTime}:00`,
          period: this.periodSelected,
          begin,
          end,
          day,
          days,
          interval: this.intervalSelected,
          junctionId: this.junctionId,
          script: this.scriptSelected,
          epoch: this.epoch,
          modelSavePeriod: this.modelSavePeriod,
          action: this.actionOptionSelected,
          method: this.methodOptionSelected,
          rewardFunc: this.rewardFuncOptionSelected,
          dockerImage: this.dockerImage,
          center: this.center,
          memLen: this.memLenSelected,
          lr: this.lrSelected
        }
      }

      if (this.role === 'simulation') {
        this.$emit('simulationconfig:save', simulationConfig)
      } else {
        this.$emit('optenvconfig:save', simulationConfig)
      }
      this.hide()

    },
    hide() {
      this.$emit('hide')
      this.$bvModal.hide(this.modalName)
      this.resetForm()
    },
    selectJunction(junction) {
      this.$refs['signal-map'].hide()
      // this.junctionId = junction.id
    },
    selectionFinished({ junctions, extent, center }) {
      this.junctionId = junctions.join(',')
      this.extent = extent
      this.showMap = false
      this.center = center
    }
  }
}
