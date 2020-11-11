<template>
  <div>
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
  destroyed() {
    if (this.map) {
      this.map.remove();
    }
  },
  mounted() {
    setTimeout(() => {
      try {
        this.map = makeMap({ mapId, zoom:15 });
        this.tl = TrafficLightManager(this.map, this.$refs.connectionEditor, this);
        this.tl.load();

      } catch (err) {
        // console.log(err)
      }
    }, 200)

  }
}
</script>

<style scoped>
.map {
    width: 100%;
  }
</style>
