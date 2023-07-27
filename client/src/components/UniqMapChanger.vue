<template>
  <div class="inline">
    <button
      class="bg-gray-300 text-xs rounded p-1 text-black hover:bg-indigo-500 hover:text-white font-bold"
      @click="changeMap(0)"
      size="sm"
    >
      일반
    </button>
    <!-- <b-button @click="changeMap(1)"> 그레이</b-button> -->
    <button
      class="bg-gray-300 text-xs rounded p-1 text-black hover:bg-indigo-500 hover:text-white font-bold"
      @click="changeMap(2)"
      size="sm"
    >
      야간
    </button>
    <button
      class="bg-gray-300 text-xs rounded p-1 text-black hover:bg-indigo-500 hover:text-white font-bold"
      @click="changeMap(3)"
      size="sm"
    >
      위성
    </button>
  </div>
</template>

<script>
import * as maptalks from "maptalks";
const urlTemplates = [
  // 'http://xdworld.vworld.kr:8080/2d/Base/201411/{z}/{x}/{y}.png',
  "https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png",
  "http://xdworld.vworld.kr:8080/2d/gray/201411/{z}/{x}/{y}.png",
  // 'http://xdworld.vworld.kr:8080/2d/midnight/201411/{z}/{x}/{y}.png',
  "https://api.mapbox.com/styles/v1/yeonheon/ckmpoihi20bp917pg47jpypm1/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWVvbmhlb24iLCJhIjoiY2o3YTIza3YyMDl1dTJxbzFrN2tjc2tiOSJ9.vAzYQZxcOCxgTrGxE_Zq5g",
  "https://xdworld.vworld.kr/2d/Satellite/service/{z}/{x}/{y}.jpeg"
];
export default {
  name: "uniq-map-changer",
  props: {
    map: Object
  },
  methods: {
    changeMap(type = 0) {
      this.map.setBaseLayer(
        new maptalks.TileLayer("base", {
          urlTemplate: urlTemplates[type]
        })
      );
    }
  }
};
</script>

<style scoped>
.btn {
  @apply bg-indigo-100 text-white;
}
</style>
