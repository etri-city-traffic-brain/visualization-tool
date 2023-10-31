/* eslint-disable no-unused-expressions */

import axios from 'axios'

import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'
import { makeArrow } from '@/utils/route-utils'
import userState from '@/user-state'
import region from '@/map2/region'
import center from '@turf/center-of-mass'

import * as maptalks from 'maptalks';

const { GeoJSON: { toGeometry } } = maptalks;

function makeDong(feature, color) {
  const dong = toGeometry(feature);

  dong.updateSymbol({
    lineColor: 'black',
    lineWidth: 2,
    polygonFill: color,
    opacity: 0.6,
    textFill: 'black',
    textName: feature.properties.adm_nm,
    textSize: 15,
  });

  const dongCenter = toGeometry(center(feature))

  const size = 10

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

function getColor() {
  return "rgb(" + Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ')'
}

async function getDaejeonDongs() {
  return axios({ url: '/salt/v1/route/dong', method: 'get' }).then(res => res.data)
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
      mapManager: null,
      showLoading: false,
      wsClient: null,
      showWaitingMsg: false,
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
    }
  },
  async mounted() {
    this.id = this.$route.params ? this.$route.params.id : null
    log('Route Visualization:', this.id)
    this.showLoading = true
    this.map = makeMap({ mapId: this.mapId, zoom: 15 })

    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus: this,
      grid: false
    })

    this.mapManager.loadMapData()
    this.showLoading = false
    window.addEventListener('resize', this.resize.bind(this))
    this.resize()
    setTimeout(() => this.centerTo(), 100)

    const dongGeojson = await getDaejeonDongs()
    const layerDong = new maptalks.VectorLayer('dongLayer', [], {})
    const layerRoute = new maptalks.VectorLayer('routeLayer', [], {})

    const { features } = dongGeojson

    const dongCenters = []

    const onlyYuseong = (feature) => feature.properties.adm_nm.indexOf('유성') >= 0

    features
      .filter(onlyYuseong)
      .forEach((feature) => {
        const color = getColor()
        const { dong, center } = makeDong(feature, color)
        layerDong.addGeometry(dong);
        dongCenters.push(center)

      });

    dongCenters.forEach((dong) => {
      layerRoute.addGeometry(dong)
    })

    const line1 = makeArrow(dongCenters[0], dongCenters[1], 5)
    const line2 = makeArrow(dongCenters[1], dongCenters[0], 5)
    const line3 = makeArrow(dongCenters[1], dongCenters[3], 5)

    layerRoute.addGeometry([line1, line2, line3])

    this.map.addLayer([layerDong, layerRoute])

  },
  methods: {

    showModal() {
      this.$refs.simmodal.show()
    },
    hideModal() {
      this.$refs.simmodal.hide()
    },

    resize() {
      this.mapHeight = window.innerHeight - 150
    },

    centerTo() {
      const center = region[this.config.region] || region.doan
      this.map.animateTo({ center, zoom: 12 }, { duration: 1000 })
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
  }
}
