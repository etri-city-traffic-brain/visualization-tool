import * as maptalks from 'maptalks'
import moment from 'moment'

import SignalMap from '@/components/SignalMap'
import SignalEditor from '@/pages/SignalEditor'
import makeMap from '@/map2/make-map'
import { HTTP } from '@/http-common'
// import region from '../map2/region'

const random = () => `${Math.floor(Math.random() * 1000)}`
const generateRandomId = (prefix = 'DEFU') =>
  `${prefix.substring(0, 4).toUpperCase()}_${moment().year()}${moment().format(
    'MM'
  )}_${random().padStart(5, '0')}`

const format = date => moment(date).format('YYYY-MM-DD')
const getToday = () => format(new Date())

const periodOptions = [
  { value: 5 * 60, text: '5분' },
  { value: 10 * 60, text: '10분' },
  { value: 30 * 60, text: '30분' },
  { value: 60 * 60, text: '1시간' },
  { value: 120 * 60, text: '2시간' }
]

const intervalOptions = [
  { text: '10 초', value: 10 },
  { text: '20 초', value: 20 },
  { text: '30 초', value: 30 },
  { text: '40 초', value: 40 },
  { text: '50 초', value: 50 },
  { text: '60 초', value: 60 },
  { text: '70 초', value: 70 },
  { text: '80 초', value: 80 },
  { text: '90 초', value: 90 },
  { text: '100 초', value: 100 }
]

const regionOptions = [
  { text: '대전', value: 'dj' },
  { text: '유성구', value: 'yuseonggu' },
  { text: '도안', value: 'doan' },
  { text: '서구', value: 'seogu' },
  { text: '동구', value: 'dg' },
  { text: '대덕구', value: 'ddg' },
  { text: '중구', value: 'jg' }
]

const sTypeOptions = [
  { text: '메소', value: 'meso' },
  { text: '마이크로', value: 'micro' },
  { text: '멀티스케일', value: 'multi' }
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
      regionSelected: 'doan',
      junctionId: 'SA 101,SA 107,SA 111,SA 104',
      epoch: 10,
      extent: null, // current map extent
      dockerImage: 'images4uniq/salt:v2.1a.20210915.test_BUS',
      periodOptions: [...periodOptions],
      intervalOptions: [...intervalOptions],
      regionOptions: [...regionOptions],
      simulationTypeOptions: [...sTypeOptions],
      areaTypeOptions: [
        { text: '지역', value: 'region' },
        { text: '영역', value: 'area' }
      ],
      areaType: 'region',
      images: [],
      loading: false,
      showMap: false,
      showEnv: true,
      modelSavePeriod: 20,
      simulationTypeSelected: 'meso',
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      // region: {},
      currentConfig: {},
      dockerImages: {}
    }
  },
  destroyed () {
    if (this.map) {
      this.map.remove()
    }
  },
  mounted () {
    setTimeout(() => {
      this.map = makeMap({ mapId: this.mapId, zoom: 13 })
      // setTimeout(() => this.selectRegion(), 200)
    }, 200)

    HTTP({
      url: '/salt/v1/helper/docker',
      method: 'get'
    })
      .then(r => r.data)
      .then(d => {
        this.dockerImages = d.simulation.images
        console.log(d.simulation.images)
        // this.images = d.simulation.images
      })

    const env = this.env
    if (this.env) {
      this.envName = env.envName
      this.description = env.description
      this.fromDate = env.configuration.fromDate
      this.toDate = env.configuration.toDate
      this.fromTime = env.configuration.fromTime.slice(0, 5)
      this.toTime = env.configuration.toTime.slice(0, 5)
      this.periodSelected = env.configuration.period
      this.scriptSelected = env.configuration.script
      this.intervalSelected = env.configuration.interval
      this.regionSelected = env.configuration.region
      this.junctionId = env.configuration.junctionId
      this.epoch = env.configuration.epoch
      this.dockerImage = env.configuration.dockerImage
      this.modelSavePeriod = env.configuration.modelSavePeriod
    }
  },
  watch: {
    areaType: function (t) {
      if (t === 'area') {
        if (this.rectangleMeso) {
          this.rectangleMeso.startEdit()
          this.rectangleMeso.show()
        } else {
          this.setMesoRegion()
        }
        this.regionSelected = null
        return
      }
      if (this.rectangleMeso) {
        this.rectangleMeso.endEdit()
        this.rectangleMeso.hide()
      }
    },
    simulationTypeSelected: function (type) {
      if (type === 'multi') {
        if (this.rectangleMicro) {
          this.rectangleMicro.startEdit()
          this.rectangleMicro.show()
          return
        }
        this.setMicroRegion()
        return
      }
      if (this.rectangleMicro) {
        this.rectangleMicro.endEdit()
        this.rectangleMicro.hide()
      }
      if (type === 'meso') {
        this.microArea = {}
      }
      if (type === 'micro') {
        this.microArea = {}
      }
    }
  },
  methods: {
    getDockerImage () {
      return this.dockerImages[this.simulationTypeSelected]
    },
    getExtentMicro () {
      if (this.rectangleMicro) {
        const e = this.rectangleMicro.getExtent()
        return {
          minX: e.xmin,
          minY: e.ymin,
          maxX: e.xmax,
          maxY: e.ymax
        }
      }
    },
    getExtent () {
      if (this.rectangleMeso) {
        const e = this.rectangleMeso.getExtent()
        return {
          minX: e.xmin,
          minY: e.ymin,
          maxX: e.xmax,
          maxY: e.ymax
        }
      }
    },
    setMesoRegion () {
      const center = this.map.getCenter()
      if (this.rectangleMeso) {
        this.rectangleMeso.setCoordinates(center)
        return
      }
      const rectMeso = new maptalks.Rectangle(center, 3000, 3000, {
        symbol: {
          lineColor: '#34495e',
          lineWidth: 2,
          polygonFill: 'blue',
          polygonOpacity: 0.1,
          textName: 'Meso Area',
          textPlacement: 'Meso Area',
          textSize: 20,
          textDy: -20
        }
      })
      this.rectangleMeso = rectMeso

      new maptalks.VectorLayer('vectorMeso')
        .addGeometry([rectMeso])
        .addTo(this.map)
      rectMeso.startEdit()
    },
    setMicroRegion () {
      const center = this.map.getCenter()
      if (this.rectangleMicro) {
        this.rectangleMicro.setCoordinates(center.add(-0.02, 0.02))
        return
      }
      const rectMicor = new maptalks.Rectangle(
        center.add(-0.02, 0.02),
        2000,
        2000,
        {
          symbol: {
            lineColor: '#34495e',
            lineWidth: 2,
            polygonFill: 'rgb(216,115,149)',
            polygonOpacity: 0.1,
            textName: 'Micro Area',
            textPlacement: 'Micro Area',
            textSize: 20,
            textDy: -20
          }
        }
      )
      this.rectangleMicro = rectMicor

      new maptalks.VectorLayer('vectorMicro')
        .addGeometry([rectMicor])
        .addTo(this.map)
      rectMicor.startEdit()
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
          region: this.regionSelected,
          junctionId: this.junctionId,
          dockerImage: this.dockerImage,
          script: this.scriptSelected,
          epoch: this.epoch,
          modelSavePeriod: this.modelSavePeriod,
          simulationType: this.simulationTypeSelected,
          microArea: { ...this.getExtentMicro() },
          area: { ...this.getExtent() },
          areaType: this.areaType
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
