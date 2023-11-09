/* eslint-disable no-unused-expressions */

import axios from 'axios'

import { scaleLinear, interpolateHcl } from 'd3'

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

  return { dong, center: dongCenter }
}

const { log } = console

function randomColor() {
  return "rgb(" + Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ')'
}

async function getDaejeonDongs() {
  return axios({ url: '/salt/v1/route/dong', method: 'get' }).then(res => res.data)
}

const updateTrip = async (map, trip) => {
  for (let step in trip) {
    const volume = trip[step]
    const target = map[step]

    if (target) {
      target.setRadius(volume * 10)
    }
  }
}

const wait = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
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
      showLinkFrom: true,
      showLinkTo: true,
      showTod: true,
      tod: {},
      message: ''
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
  },
  async mounted() {
    this.id = this.$route.params ? this.$route.params.id : null

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
      await this.loadLinks()
      this.message = '링크 목록 조회 완료'
      await this.loadDong()

      this.message = 'Loading OD Metrix'
      await this.loadTODMetrix()
      this.message = 'OD 데이터 조회 완료'

      this.showLoading = false

      this.message = ''
    } catch (err) {
      this.message = "데이터가 준비되지 않았습니다."
      log(err.message)
    }

    window.addEventListener('resize', this.resize.bind(this))


  },
  methods: {
    previous() {
      if (this.currentStep < 1) {
        return
      }
      this.onStepChanged(this.currentStep - 1)
    },
    next() {
      if (this.currentStep >= 23) {
        this.currentStep = 0
        this.onStepChanged(this.currentStep)
        return
      }
      this.onStepChanged(this.currentStep + 1)
    },
    onInput(v) {
      this.currentStep = v
    },
    async onStepChanged(step) {
      this.currentStep = step

      if (!this.trip) {
        await this.loadTrip()
      }
      const tripFrom = this.trip.from[step]
      const tripTo = this.trip.to[step]

      updateTrip(this.linkMapFrom, tripFrom)
      updateTrip(this.linkMapTo, tripTo)

      if (this.tod[step]) {
        this.updateOD(this.tod[step])
      }
    },

    async startTripVisualization() {
      if (!this.trip) {
        await this.loadTrip()
      }

      for (let step in this.trip.from) {
        if (Number.isNaN(step) || step === 'NaN') {
          return
        }
        const tripFrom = this.trip.from[step]
        const tripTo = this.trip.to[step]
        updateTrip(this.linkMapFrom, tripFrom)
        updateTrip(this.linkMapTo, tripTo)
        this.currentStep = step

        if (this.tod[step]) {
          this.updateOD(this.tod[step])
        }

        await wait()
      }
    },
    toggleLinksFrom() {
      if (this.layerLinkFrom.isVisible()) {
        this.layerLinkFrom.hide()
        this.showLinkFrom = false
      } else {
        this.layerLinkFrom.show()
        this.showLinkFrom = true
      }

    },
    toggleLinksTo() {
      if (this.layerLinkTo.isVisible()) {
        this.showLinkTo = false
        this.layerLinkTo.hide()
      } else {
        this.showLinkTo = true
        this.layerLinkTo.show()
      }
    },
    toggleTod() {
      if (this.layerRoute.isVisible()) {
        this.showTod = false
        this.layerRoute.hide()
      } else {
        this.showTod = true
        this.layerRoute.show()
      }
    },
    async updateOD(odm) {
      this.layerRoute.clear()
      const arrows = odm.map((od) => {
        const dongO = this.dongCenters[od[0]]
        const dongD = this.dongCenters[od[1]]
        const volume = od[2]
        if (!dongO || !dongD) {
          return
        }
        const arrow = makeArrow(dongO, dongD, Math.log(volume))
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
        autoHideDelay: 5000,
        appendToast: false,
        variant,
        toaster: 'b-toaster-bottom-right'
      })
    },

    async loadTODMetrix() {
      this.tod = await axios({
        url: `/salt/v1/route/trip/${this.id}/tod`,
        method: 'get'
      }).then(res => res.data)
    },

    async loadLinks() {
      this.links = await axios({
        url: '/salt/v1/map/yuseong'
      }).then(res => res.data)

      const pointsFrom = this.links.features.map(feature => {
        const point = toPoint(feature, 'blue')
        this.linkMapFrom[feature.properties.LINK_ID] = point
        return point
      })
      const pointsTo = this.links.features.map(feature => {
        const point = toPoint(feature, 'red')
        this.linkMapTo[feature.properties.LINK_ID] = point
        return point
      })

      this.layerLinkFrom.addGeometry(pointsFrom)
      this.layerLinkTo.addGeometry(pointsTo)
    },

    async loadTrip() {
      this.trip = await axios({
        url: `/salt/v1/route/trip/${this.id}/from`,
        method: 'get'
      }).then(res => res.data)
    },

    async loadDong() {
      const dongGeojson = await getDaejeonDongs()
      const { features } = dongGeojson

      const onlyYuseong = (feature) => {
        // return feature.properties.adm_nm.indexOf('유성') >= 0 ||
        //   feature.properties.adm_cd === '2503066' ||
        //   feature.properties.adm_cd === '2503070'

        return [
          '2503066',
          '2503070',
          '2504054',
          '2504059',
          '2504064',
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
