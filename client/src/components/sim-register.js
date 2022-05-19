import * as maptalks from 'maptalks'
import moment from 'moment'

import SignalMap from '@/components/SignalMap'
import SignalEditor from '@/pages/SignalEditor'
import makeMap from '@/map2/make-map'

const random = () => `${Math.floor(Math.random() * 1000)}`
const generateRandomId = (prefix = 'DEFU') =>
  `${prefix.substring(0, 4).toUpperCase()}_${moment().year()}${moment().format(
    'MM'
  )}_${random().padStart(5, '0')}`

const format = date => moment(date).format('YYYY-MM-DD')
const getToday = () => format(new Date())

const periodOptions = [
  { value: 15, text: '15초' },
  { value: 10 * 60, text: '10분' },
  { value: 30 * 60, text: '30분' },
  { value: 60 * 60, text: '1시간' },
  { value: 120 * 60, text: '2시간' }
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
  name: 'sim-registration',
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
      envName: generateRandomId('Exp'),
      id: generateRandomId(this.role),
      description: '...',
      fromDate: getToday(),
      toDate: getToday(),
      fromTime: '07:00',
      toTime: '08:59',
      periodSelected: periodOptions[0].value,
      intervalSelected: intervalOptions[0].value,
      junctionId: 'SA 101,SA 107,SA 111,SA 104',
      epoch: 10,
      extent: null, // current map extent
      dockerImage: 'images4uniq/salt:v2.1a.20210915.test_BUS',
      periodOptions: [...periodOptions],
      intervalOptions: [...intervalOptions],
      loading: false,
      showMap: false,
      showEnv: true,
      modelSavePeriod: 20,
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      region: {},
      currentConfig: {}
    }
  },
  destroyed () {
    if (this.map) {
      this.map.remove()
    }
  },
  mounted () {
    this.map = makeMap({ mapId: this.mapId, zoom: 15 })
    setTimeout(() => this.selectRegion(), 1000)

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
      this.dockerImage = env.configuration.dockerImage
      this.modelSavePeriod = env.configuration.modelSavePeriod
    }
  },
  methods: {
    getExtent () {
      if (this.rectangle) {
        const e = this.rectangle.getExtent()
        return {
          minX: e.xmin,
          minY: e.ymin,
          maxX: e.xmax,
          maxY: e.ymax
        }
      }
    },
    selectRegion () {
      const center = this.map.getCenter()
      if (this.rectangle) {
        this.rectangle.setCoordinates(center)
        return
      }
      const rect = new maptalks.Rectangle(center, 800, 700, {
        symbol: {
          lineColor: '#34495e',
          lineWidth: 2,
          polygonFill: 'rgb(216,115,149)',
          polygonOpacity: 0.2
        }
      })
      this.rectangle = rect

      new maptalks.VectorLayer('vector').addGeometry([rect]).addTo(this.map)
      rect.startEdit()
    },
    resetForm () {
      this.id = generateRandomId(this.role)
      this.description = '...'
    },
    getCurrentConfig () {
      const from = moment(`${this.fromDate} ${this.fromTime}`)
      const to = moment(`${this.toDate} ${this.toTime}`)
      const begin = moment.duration(this.fromTime).asSeconds()
      const end = to.diff(from) / 1000 - 60 + begin
      const days = to.diff(from, 'days') + 1
      const day = from.day()

      const simulationConfig = {
        id: this.id,
        user: this.userId,
        description: this.description,
        role: this.role,
        type: this.role,
        envName: this.envName,
        configuration: {
          region: this.areaSelected,
          // extent: this.extent,
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
          dockerImage: this.dockerImage,
          script: this.scriptSelected,
          epoch: this.epoch,
          modelSavePeriod: this.modelSavePeriod,
          ...this.getExtent()
        }
      }
      return simulationConfig
    },
    save () {
      this.loading = true
      if (!this.envName || this.envName.length < 3) {
        this.$bvToast.toast('환경 이름이 너무 짧거나 비어 있습니다.(3글자이상)')
        return
      }
      // send event to the parent
      this.$emit('config:save', this.getCurrentConfig())
      this.hide()
      this.loading = false
    },
    hide () {
      this.$emit('hide')
      this.$bvModal.hide(this.modalName)
      this.resetForm()
    },
    openInfobox () {
      this.currentConfig = this.getCurrentConfig()
      this.$refs['config-info'].show()
    },
    hideInfobox () {
      this.$refs['config-info'].hide()
    }
  }
}
