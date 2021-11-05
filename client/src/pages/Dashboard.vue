<template>
  <div>
    <div class="flex bg-gray-700 items-center p-1 py-2">
      <div class="w-48- text-white ml-2">
        날짜: <input class="text-black pl-2 py-1 rounded" v-model="dtgDate" type="date"/>
      </div>
      <button class="text-white px-2 py-1 bg-gray-500 rounded mx-2" @click="analizeDtg">
        DTG 분석
      </button>
    </div>
    <!-- VDS 통계 -->
    <transition name="slice-fade">
    <div v-if="showVds" class="bg-gray-700 opacity-80 dashboard-uniq-top-left min-w-max">
      <div class="flex justify-between text-blue-300 font-bold pl-3 mt-2">
        <div>VDS 통계</div>
        <button @click.prevent="showVds = !showVds" class="px-2 mx-2 hover:bg-blue-500 hover:text-white">닫기</button>
      </div>
      <div
        v-if="chart.vds.length > 0"
        class="grid grid-cols-4 gap-2 text-white p-2 m-1 p-2 "
      >
        <div v-for="(c, idx) of chart.vds" :key="idx" class="bg-gray-800 rounded-lg w-60">
          <div class="uppercase text-sm font-bold text-blue-200 p-2">{{ c.title }} / {{ c.day }}</div>
          <line-chart :chartData="c.chartDataset" :options="defaultOption()" :height="180"/>
        </div>
      </div>
    </div>
    </transition>

    <div v-if="videoUrl" class="bg-gray-700 opacity-80 text-white p-2 rounded-xl m-2 p-2 dashboard-uniq-top-right w-80">
      <div class="font-bold text-blue-300 mb-2">
        CCTV {{ cctv.name }}
      </div>
       <video controls width="100%" autoplay >
        <source :src="videoUrl" type="video/mp4">
        <!-- <source src="http://192.168.1.220:8080/video/%EA%B0%91%EC%B2%9C%EB%8C%80%EA%B5%90%EB%84%A4%EA%B1%B0%EB%A6%AC/N_20201020_080000.mp4" type="video/mp4"> -->
        Sorry, your browser doesn't support embedded videos.
      </video>
    </div>
    <div
      :ref="mapId"
      :id="mapId"
      :style="{height: mapHeight + 'px'}"
    />

    <!-- <b-modal id="cctv-modal" ref="cctv-modal" :title="cctv.name" hide-footer >
      <video controls width="100%" autoplay >
        <source :src="videoUrl" type="video/mp4">
        Sorry, your browser doesn't support embedded videos.
      </video>
  </b-modal> -->

  </div>
</template>

<script src="./dashboard.js">

</script>

<style scoped>
  .dashboard-uniq-top-left {
    position: fixed;
    top: 105px;
    overflow: auto;
    /* height: 100%; */
    z-index: 99;
    padding: 0;
    left: 5px;
    max-width: 1024px;
    max-height: 490px;
  }

  .dashboard-uniq-top-right {
    position: fixed;
    bottom: 20px;
    overflow: auto;
    /* height: 100%; */
    z-index: 99;
    padding: 0;
    right: 5px;
    /* max-width: 1024px; */
    max-height: 490px;
  }

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

</style>
