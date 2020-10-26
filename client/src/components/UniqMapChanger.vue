<template>
  <b-button-group size="sm">
    <b-button variant="dark" @click="changeMap(0)">
      일반지도
    </b-button>
    <!-- <b-button variant="secondary" @click="changeMap(1)">Gray</b-button>
    <b-button variant="dark" @click="changeMap(2)">Midnight</b-button> -->
    <b-button variant="primary" @click="changeMap(3)" class="ml-1" >
      위성지도 <b-icon icon="bar-chart"/>
    </b-button>
  </b-button-group>
</template>

<script>
import * as maptalks from 'maptalks';
const urlTemplates = [
  'http://xdworld.vworld.kr:8080/2d/Base/201411/{z}/{x}/{y}.png',
  'http://xdworld.vworld.kr:8080/2d/gray/201411/{z}/{x}/{y}.png',
  'http://xdworld.vworld.kr:8080/2d/midnight/201411/{z}/{x}/{y}.png',
  'http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg',
]
export default {
  name: 'uniq-map-changer',
  props: {
    map: Object
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
    changeMap(type = 0) {
      this.map.setBaseLayer(
        new maptalks.TileLayer('base', {
          urlTemplate: urlTemplates[type],
        }))
    }
  }
}
</script>
