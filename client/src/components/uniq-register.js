
import moment from 'moment'

import simulationService from '@/service/simulation-service'
import SignalMap from '@/components/SignalMap'
import SignalEditor from '@/pages/SignalEditor'

const random = () => `${Math.floor(Math.random() * 1000)}`
const generateRandomId = (prefix = 'DEFU') => `${prefix.substring(0, 4).toUpperCase()}_${moment().year()}${moment().format('MM')}_${random().padStart(5, '0')}`
const format = date => moment(date).format('YYYY-MM-DD')
const getToday = () => format(new Date())

const periodOptions = [
  { value: 10 * 60, text: '10분' },
  { value: 30 * 60, text: '30분' },
  { value: 60 * 60, text: '1시간' },
  { value: 120 * 60, text: '2시간' },
  { value: 240 * 60, text: '4시간' },
  { value: 360 * 60, text: '6시간' }
]

const areaOptions = [
  { value: 10, text: '테스트지역' },
  { value: 250, text: '대전광역시' },
  { value: 25030, text: '서구' },
  { value: 25040, text: '유성구' },
  { value: 290, text: '세종시' },
  { value: 29010, text: '세종특별자치시' }
]

const scriptOptions = [
  { value: 'default.py', text: 'default.py' },
  { value: 'RL_2phase_pressure.py', text: 'RL_2phase_pressure.py' }
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
    SignalEditor
  },
  data () {
    return {
      envName: generateRandomId('Exp'), //
      id: generateRandomId(this.role), //
      description: '...', //
      fromDate: getToday(), //
      toDate: getToday(), //
      fromTime: '07:00', //
      toTime: '08:59', //
      periodSelected: periodOptions[0].value, //
      areaSelected: areaOptions[0].value, //
      scriptSelected: scriptOptions[0].value, //
      intervalSelected: intervalOptions[0].value, //
      junctionId: '',
      epoch: 10,
      extent: null, // current map extent

      periodOptions: [...periodOptions],
      areaOptions: [...areaOptions],
      scriptOptions: [...scriptOptions],
      intervalOptions: [...intervalOptions],
      loading: false,
      showMap: false,
      showEnv: true
    }
  },
  async mounted () {
    // console.log('simulation register ui', this.modalName)
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
      this.junctionId = env.configuration.junctionId
      this.epoch = env.configuration.epoch
    }
    try {
      this.scriptOptions = await simulationService.getScripts()
    } catch (err) {
      this.scriptOptions = [...scriptOptions]
    }
  },
  methods: {
    openSignalMap () {
      this.$refs['signal-map'].show()
    },
    resetForm () {
      this.id = generateRandomId(this.role)
      this.description = '...'
    },
    async register () {
      this.loading = true
      const from = moment(`${this.fromDate} ${this.fromTime}`)
      const to = moment(`${this.toDate} ${this.toTime}`)
      const begin = moment.duration(this.fromTime).asSeconds()
      const end = (to.diff(from) / 1000 - 60) + begin
      const days = to.diff(from, 'days') + 1
      const day = from.day()

      if (!this.envName || this.envName.length < 3) {
        this.$bvToast.toast('환경 이름이 너무 짧거나 비어 있습니다.(3글자이상)')
        return
      }

      const simulationConfig = {
        id: this.id,
        user: this.userId,
        description: this.description,
        role: this.role,
        type: this.role,
        envName: this.envName,
        configuration: {
          region: this.areaSelected,
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
          epoch: this.epoch
        }
      }

      if (this.role === 'simulation') {
        this.$emit('simulationconfig:save', simulationConfig)
      } else {
        this.$emit('optenvconfig:save', simulationConfig)
      }
      this.hide()
      this.loading = false
    },
    hide () {
      this.$emit('hide')
      this.$bvModal.hide(this.modalName)
      this.resetForm()
    },
    selectJunction (junction) {
      this.$refs['signal-map'].hide()
      // this.junctionId = junction.id
    },
    selectionFinished ({ junctions, extent }) {
      this.junctionId = junctions.join(',')
      this.extent = extent
      this.showMap = false
    }
  }
}
