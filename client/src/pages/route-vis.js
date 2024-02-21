/* eslint-disable no-unused-expressions */

import axios from 'axios'

import { scaleLinear } from 'd3'

const volumeColor = scaleLinear()
  .domain([0, 500, 1000])
  .range([
    'yellow',
    'orange',
    'red'
  ])
// .interpolate(interpolateHcl)

import makeMap from '@/map2/make-map'

import { makeArrow } from '@/utils/route-utils'
import userState from '@/user-state'
import region from '@/map2/region'
import center from '@turf/center-of-mass'

import * as maptalks from 'maptalks';

const { GeoJSON: { toGeometry } } = maptalks;

function makeDong(feature, color) {
  const dong = toGeometry(feature);

  dong.updateSymbol({
    lineColor: 'blue',
    lineWidth: 2,
    polygonFill: color,
    opacity: 0.2,
    textFill: 'black',
    textName: feature.properties.adm_nm,
    textSize: 15,
  });

  const dongCenter = toGeometry(center(feature))

  const size = 10
  dongCenter.properties.adm_cd = feature.properties.adm_cd
  dongCenter.updateSymbol({
    'markerType': 'ellipse',
    'markerFill': color,
    'markerFillOpacity': 0.8,
    'markerLineColor': '#fff',
    'markerLineWidth': 3,
    'markerWidth': size,
    'markerHeight': size
  })

  dong.on('click', (x) => {
    console.log('click', x.target.properties.adm_cd)
  })

  return { dong, center: dongCenter }
}

const { log } = console

function randomColor() {
  return "rgb(" + Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ')'
}

async function updateStatus(id, status) {
  return axios({
    url: `/salt/v1/route/${id}`,
    method: 'post',
    data: {
      id,
      status
    }
  })
}

async function getDaejeonDongs() {
  return axios({ url: '/salt/v1/route/dong/get', method: 'get' }).then(res => res.data)
}

async function getSejongDongs() {
  return axios({ url: '/salt/v1/route/dong/get?region=sejong', method: 'get' }).then(res => res.data)
}

const updateTrip = async (linkPoints, trips, showLabel) => {
  for (let linkId in trips) {
    const volume = trips[linkId]
    const circle = linkPoints[linkId]

    if (!circle) {
      continue
    }

    if (volume > 10 && showLabel.getZoom() > 14) {
      circle.updateSymbol({
        textName: volume,
        textSize: 12,
        textFill: 'black',
        textHaloFill: 'white',
        textHaloRadius: 1
      })
    }
    circle.setRadius(volume * 10)
  }
}

const wait = (t = 100) => {
  return new Promise((resolve) => {
    setTimeout(resolve, t)
  })
}

async function getSimulation(id) {
  return axios({
    url: `/salt/v1/route/${id}`,
    method: 'get'
  }).then(res => res.data)
}

async function getTod(id, region) {
  return axios({
    url: `/salt/v1/route/trip/${id}/tod?region=${region}`,
    method: 'get'
  }).then(res => res.data)
}

async function getTrip(id, region) {
  return axios({
    url: `/salt/v1/route/trip/${id}/from?region=${region}`,
    method: 'get'
  }).then(res => res.data)
}

export default {
  name: 'RouteVis',
  components: {
  },
  data() {
    return {
      userState,
      id: null,
      simulation: { configuration: {} },
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      mapHeight: 600, // map view height
      showLoading: false,
      links: {},
      dongCenters: {},
      layerLinkFrom: {},
      layerLinkTo: {},
      layerDong: {},
      layerRoute: {},
      linkMapFrom: {},
      linkMapTo: {},
      currentStep: 0,
      trip: null,
      showTod: true,
      showLinkFrom: false,
      showLinkTo: false,
      tod: {},
      message: '',
      min: 0,
      max: 0,
      statuses: [
        { value: 'ready', label: '준비', delay: 1000 * 2 },
        { value: 'runDijkstra', label: '경로탐색', delay: 1000 * 2 },
        { value: 'runOD2Trips', label: 'OD-Matrix 생성', delay: 1000 * 2 },
        { value: 'runRouter', label: '경로할당', delay: 1000 * 5 },
        { value: 'runSimulator', label: '모의실험', delay: 1000 * 5 },
        { value: 'runCalibrator', label: '보정', delay: 1000 * 3 },
        { value: 'runOD2Trips2', label: '트립생성', delay: 1000 * 5 },
        { value: 'runRouter2', label: '경로할당', delay: 1000 * 5 },
        { value: 'runSimulator2', label: '모의실험', delay: 1000 * 8 },
        { value: 'runCalibrator2', label: '검증보정', delay: 1000 * 3 },
        { value: 'finished', label: '완료', delay: 1000 },
      ],
      status: 'ready',
      isRunning: false,
    }
  },
  destroyed() {
    if (this.map) {
      this.map.remove()
    }
    window.removeEventListener('resize', this.resize.bind(this))
  },
  computed: {
    config() {
      return this.simulation.configuration
    },

    // status() {
    //   return this.simulation.status || 'ready'
    // },

    statusColor() {
      return ''
    }
  },
  async mounted() {
    this.id = this.$route.params ? this.$route.params.id : null

    this.simulation = await getSimulation(this.id)

    const oneMin = 60 * 1000

    const elapsed = (this.simulation.created, Date.now() - new Date(this.simulation.created).getTime())
    this.status = this.simulation.status
    // 준비상태가 아니면 시간에 따라 상태를 업데이트하여
    //
    if (this.simulation.status === 'finished') {
      //
    } else if (this.simulation.status !== 'ready') {
      // if (elapsed > oneMin) {
      //   this.status = 'runOD2Trips'
      // } if (elapsed > oneMin * 2) {
      //   this.status = 'runRouter'
      // }
      // if (elapsed > oneMin * 3) {
      //   this.status = 'runSimulator2'
      // }
      // if (elapsed > oneMin * 5) {
      //   this.status = 'finished'
      // }
      // updateStatus(this.id, this.status)
      this.generateRoute()
    }

    this.layerLinkFrom = new maptalks.VectorLayer('linkLayerFrom', [], {})
    this.layerLinkTo = new maptalks.VectorLayer('linkLayerTo', [], {})
    this.layerDong = new maptalks.VectorLayer('dongLayer', [], {})
    this.layerRoute = new maptalks.VectorLayer('routeLayer', [], {})

    this.showLoading = true
    this.message = '로딩중...'
    this.map = makeMap({ mapId: this.mapId, zoom: 13 })
    this.map.addLayer([
      this.layerDong,
      this.layerLinkTo,
      this.layerLinkFrom,
      this.layerRoute
    ])
    this.resize()
    this.centerTo()
    try {

      this.message = '링크 목록 조회 완료'
      this.makeToast("링크목록 조회완료")
      await this.loadDong()
      this.makeToast("행정동 조회완료")

      this.message = 'Loading OD Metrix'
      await this.loadTODMetrix()
      this.message = 'OD 데이터 조회 완료'

      this.showLoading = false

      this.message = ''
      this.loadLinks()
    } catch (err) {
      this.message = "데이터가 준비되지 않았습니다."
      log(err.message)
    }

    window.addEventListener('resize', this.resize.bind(this))


  },
  watch: {
    status() {
      if (this.status === 'runRouter') {
        this.showLinkFrom = false
        this.showLinkTo = false
        this.showTod = true
        this.startTripVisualization()
      }
      if (this.status === 'runCalibrator2') {
        this.showLinkFrom = true
        this.showLinkTo = true
        this.showTod = false
        this.startTripVisualization()
      }
    },
    showLinkFrom(v) {
      if (v) {
        this.layerLinkFrom.show()
      } else {
        this.layerLinkFrom.hide()
      }
    },
    showLinkTo(v) {
      if (v) {
        this.layerLinkTo.show()
      } else {
        this.layerLinkTo.hide()
      }
    },
    showTod(v) {
      if (v) {
        this.layerRoute.show()
      } else {
        this.layerRoute.hide()
      }
    }
  },
  methods: {
    async generateRoute() {
      const idx = this.statuses.findIndex(s => s.value === this.status)
      let sss = []
      if (idx >= 0) {
        sss = this.statuses.slice(idx)
      } else {
        sss = this.statuses.slice()
      }
      if (this.status === 'finished') {
        sss = this.statuses.slice()
      }
      for (let s of sss) {
        await wait(s.delay)
        this.status = s.value
        updateStatus(this.id, this.status)
      }
    },
    previous() {
      if (this.currentStep < 1) {
        return
      }
      this.onStepChanged({
        target: {
          value: this.currentStep - 1
        }
      })
    },
    next() {
      if (this.currentStep >= 23) {
        this.currentStep = 0
        this.onStepChanged({
          target: {
            value: this.currentStep
          }
        })
        return
      }
      this.onStepChanged({
        target: {
          value: this.currentStep + 1
        }
      })
    },
    onInput(e) {
      this.currentStep = e.target.value
    },
    async onStepChanged(e) {
      const step = e.target.value
      this.currentStep = Number(step)

      if (!this.trip) {
        await this.loadTrip()
      }
      const tripFrom = this.trip.from[step]
      const tripTo = this.trip.to[step]

      updateTrip(this.linkMapFrom, tripFrom, this.map)
      updateTrip(this.linkMapTo, tripTo, this.map)

      if (this.tod[step]) {
        this.updateOD(this.tod[step])
      }
    },

    async startTripVisualization() {
      if (this.isRunning) {
        log('already running')
        return
      }

      this.isRunning = true
      if (!this.trip) {
        await this.loadTrip()
      }

      for (let step in this.trip.from) {
        if (Number.isNaN(step) || step === 'NaN') {
          this.currentStep = 0
          this.isRunning = false
          return
        }
        const tripFrom = this.trip.from[step]
        const tripTo = this.trip.to[step]
        updateTrip(this.linkMapFrom, tripFrom, this.map)
        updateTrip(this.linkMapTo, tripTo, this.map)
        this.currentStep = step

        if (this.tod[step]) {
          this.updateOD(this.tod[step])
        }

        await wait(200)
      }
      this.currentStep = 0
      this.isRunning = false

    },
    toggleLinksFrom() {
      this.showLinkFrom = !this.showLinkFrom
    },
    toggleLinksTo() {
      this.showLinkTo = !this.showLinkTo
    },
    toggleTod() {
      this.showTod = !this.showTod
    },
    async updateOD(odm) {
      this.layerRoute.clear()
      // console.log(odm)
      const arrows = odm.map((od) => {
        const dongO = this.dongCenters[od[0]]
        const dongD = this.dongCenters[od[1]]
        const volume = od[2]
        if (!dongO || !dongD) {
          return
        }

        const scaledValue = (volume - this.min) / (2000 - this.min);

        // const arrow = makeArrow(dongO, dongD, Math.log(volume) * 1.2)
        const arrow = makeArrow(dongO, dongD, scaledValue * 10)
        if (!arrow) {
          return
        }
        arrow.updateSymbol({
          lineColor: volumeColor(volume),
          textName: volume,
          textSize: 12,
          markerFillOpacity: 1,
          textFill: 'black',
          textHaloFill: volumeColor(volume),
          textHaloRadius: 2
        })



        return arrow

      }).filter(v => v)
      this.layerRoute.addGeometry(arrows)

    },
    showModal() {
      this.$refs.simmodal.show()
    },
    hideModal() {
      this.$refs.simmodal.hide()
    },
    resize() {
      this.mapHeight = window.innerHeight - 50
    },
    centerTo() {
      const center = region[this.config.region] || region.doan
      this.map.animateTo({ center, zoom: 13 }, { duration: 10 })
    },

    makeToast(msg, variant = 'info') {
      this.$bvToast.toast(msg, {
        title: 'Notification',
        autoHideDelay: 3000,
        appendToast: false,
        variant,
        toaster: 'b-toaster-top-right'
      })
    },

    async loadTODMetrix() {


      this.tod = await getTod(this.id, this.simulation.configuration.region)
      // this.tod = await axios({
      //   url: `/salt/v1/route/trip/${this.id}/tod?region=${this.simulation.configuration.region}`,
      //   method: 'get'
      // }).then(res => res.data)


      const x = Object.values(this.tod).map(arr => arr.map(a => a[2]))
      let values = []
      x.forEach(v => {
        values = values.concat(v)
      })
      const min = Math.min(...values);
      const max = Math.max(...values);
      this.min = min
      this.max = max
    },

    async loadLinks() {

      if (this.simulation.configuration.region === 'sejong') {
        this.links = await axios({ url: '/salt/v1/map/sejong' }).then(res => res.data)

      } else {
        this.links = await axios({ url: '/salt/v1/map/yuseong' }).then(res => res.data)
      }

      const fasterThan30 = feature => feature.properties.SPEEDLH >= 20
      const pointsFrom = this.links.features.filter(fasterThan30).map(feature => {
        const point = toPoint(feature, 'blue')
        this.linkMapFrom[feature.properties.LINK_ID] = point
        return point
      })

      const pointsTo = this.links.features.filter(fasterThan30).map(feature => {
        const point = toPoint(feature, 'red')
        this.linkMapTo[feature.properties.LINK_ID] = point
        return point
      })

      this.layerLinkFrom.addGeometry(pointsFrom)
      this.layerLinkTo.addGeometry(pointsTo)

      this.layerLinkFrom.hide()
      this.layerLinkTo.hide()

    },

    async loadTrip() {
      const region = this.simulation.configuration.region



      this.trip = await getTrip(this.id, region)
      // this.trip = await axios({
      //   url: `/salt/v1/route/trip/${this.id}/from?region=${region}`,
      //   method: 'get'
      // }).then(res => res.data)

    },

    async loadDong() {

      let dongGeojson
      if (this.simulation.configuration.region === 'sejong') {
        dongGeojson = await getSejongDongs()
        const { features } = dongGeojson

        const onlySejong = (feature) => {
          return [
            '2901031',
            '2901061',
            '2901062',
            '2901053',
            '2901059',
            '2901056',
            '2901060',
            '2901064',


            // '2901060',
            // '2901059',
            // '2901056',
            // '2901067',
            // '2901061',
            // '2901064',
            // '2901066',
            // '2901061',
            // '2901053',
            // '2901068'
          ].indexOf(feature.properties.adm_cd) >= 0
        }

        features
          .filter(onlySejong)
          .forEach((feature) => {
            const color = randomColor()
            const { dong, center } = makeDong(feature, color)
            this.layerDong.addGeometry(dong);
            this.dongCenters[center.properties.adm_cd] = center
          });
      } else if (this.simulation.configuration.region === 'doan') {
        dongGeojson = await getDaejeonDongs()
        const { features } = dongGeojson

        const onlyYuseong = (feature) => {

          return [
            '2503066',
            '2503070',
            '2504054',
            '2504059',
            '2504064',
            '2504065',
            '2504065',
            '2504054',

          ].indexOf(feature.properties.adm_cd) >= 0

        }

        features
          .filter(onlyYuseong)
          .forEach((feature) => {
            const color = randomColor()
            const { dong, center } = makeDong(feature, color)
            this.layerDong.addGeometry(dong);
            this.dongCenters[center.properties.adm_cd] = center
          });
      } else {
        dongGeojson = await getDaejeonDongs()
        const { features } = dongGeojson

        const onlyYuseong = (feature) => {

          return [
            '2503064',
            '2503065',
            '2503066',
            '2503067',
            '2503068',
            '2503060',
            '2503069',
            '2504064',
            '2504054',
            '2504065',

          ].indexOf(feature.properties.adm_cd) >= 0

        }

        features
          .filter(onlyYuseong)
          .forEach((feature) => {
            const color = randomColor()
            const { dong, center } = makeDong(feature, color)
            this.layerDong.addGeometry(dong);
            this.dongCenters[center.properties.adm_cd] = center
          });
      }
    },
  }
}

function toPoint(feature, color) {

  // const coord = color === 'red' ?
  //   feature.geometry.coordinates[0] :
  //   feature.geometry.coordinates[feature.geometry.coordinates.length - 1]
  const coord = feature.geometry.coordinates[0]

  var circle = new maptalks.Circle(coord, 0, {
    symbol: {
      // lineColor: '#34495e',
      lineWidth: 0,
      polygonFill: color,
      polygonOpacity: 0.1,
    }

  });
  return circle
}
