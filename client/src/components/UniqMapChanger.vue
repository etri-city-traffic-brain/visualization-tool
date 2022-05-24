<template>
  <div class="inline">
    <b-button @click="changeMap(0)" size="sm"> 일반 </b-button>
    <!-- <b-button @click="changeMap(1)"> 그레이</b-button> -->
    <b-button @click="changeMap(2)" size="sm"> 야간</b-button>
    <b-button @click="changeMap(3)" size="sm"> 위성 </b-button>
  </div>
</template>

<script>
import * as maptalks from 'maptalks';
const urlTemplates = [
  'http://xdworld.vworld.kr:8080/2d/Base/201411/{z}/{x}/{y}.png',
  'http://xdworld.vworld.kr:8080/2d/gray/201411/{z}/{x}/{y}.png',
  // 'http://xdworld.vworld.kr:8080/2d/midnight/201411/{z}/{x}/{y}.png',
  'https://api.mapbox.com/styles/v1/yeonheon/ckmpoihi20bp917pg47jpypm1/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWVvbmhlb24iLCJhIjoiY2o3YTIza3YyMDl1dTJxbzFrN2tjc2tiOSJ9.vAzYQZxcOCxgTrGxE_Zq5g',
  'http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg',
]
export default {
  name: 'uniq-map-changer',
  props: {
    map: Object
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
