<template>
  <div>
    <div :ref="mapId" :id="mapId" :style="{ height: '500px' }" class="map" />
    {{ region }}
    <b-card bg-variant="secondary">
      <b-card-text>
        <b-badge v-for="junction of junctions" :key="junction" class="m-1">
          {{ junction }}
          <b-badge
            href="#"
            class="m-1"
            variant="dark"
            size="sm"
            @click="deleteJunction(junction)"
            >X</b-badge
          >
        </b-badge>
      </b-card-text>

      <b-card-text class="text-right">
        <b-btn @click="finishSelection" size="sm" variant="info">
          선택완료
        </b-btn>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import makeMap from "@/map2/make-map";
import TrafficLightManager from "@/map2/map-traffic-lights";

const { log } = console;

export default {
  props: ["region"],
  data() {
    return {
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      junctions: [],
      trafficLightManager: null
    };
  },
  destroyed() {
    if (this.map) {
      this.map.remove();
    }
  },
  watch: {
    region(v) {
      this.goTo(v);
    }
  },
  mounted() {
    setTimeout(() => {
      try {
        this.map = makeMap({ mapId: this.mapId, zoom: 15 });
        this.trafficLightManager = TrafficLightManager(
          this.map,
          this.$refs.connectionEditor,
          this
        );
        this.trafficLightManager.load();
        this.goTo(this.region);
        this.$on("junction:clicked", node => {
          this.addItem(node.nodeId);
        });

        this.$on("signalGroup:clicked", group => {
          console.log("add signal group");
          this.addItem(group.groupId);
        });
      } catch (err) {
        log(err);
      }
    }, 200);
  },
  methods: {
    goTo(v) {
      if (v === "doan") {
        this.map.animateTo({
          center: [127.3396677, 36.3423342],
          zoom: 14
        });
      } else if (v === "cdd3") {
        this.map.animateTo({
          center: [127.35375270822743, 36.383148078460906],
          zoom: 14
        });
      }
    },
    addItem(item) {
      if (this.junctions.includes(item)) {
        return;
      }
      this.junctions.push(item);
    },
    finishSelection() {
      this.$emit("selection:finished", {
        junctions: this.junctions,
        extent: this.map.getExtent()
      });
    },
    deleteJunction(junction) {
      const idx = this.junctions.indexOf(junction);
      if (idx >= 0) {
        this.junctions.splice(idx, 1);
      }
    }
  }
};
</script>

<style scoped>
.map {
  width: 100%;
}
</style>
