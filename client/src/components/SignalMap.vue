<template>
  <div>
    신호선택

    <div
      :ref="mapId"
      :id="mapId"
      :style="{height: '500px'}"
      class="map"
    />

  </div>
</template>

<script>

import makeMap from '@/map2/make-map';
import TrafficLightManager from '@/map2/map-traffic-lights';

const mapId = `map-${Math.floor(Math.random() * 100)}`;
export default {
  data() {
    return {
      map: null,
      mapId,
    }
  },

  created() {
  },
  mounted() {
    setTimeout(() => {
      this.map = makeMap({ mapId, zoom:15 });
    }, 2000)

  }
}
</script>

<style scoped>
.map {
    width: 100%;
  }
</style>
