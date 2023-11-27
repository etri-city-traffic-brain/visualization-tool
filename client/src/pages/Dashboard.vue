<template>
  <div>
    <div class="fixed z-50 left-2 top-14 w-full flex justify-center">
      <div class="text-sm text-white bg-gray-700 items-center px-2 py-2 space-x-1 flex justify-between rounded">
        <div class="flex items-center space-x-1">
          <div>날짜선택</div>
          <input class="px-2 py-1 text-black rounded" v-model="dtgDate" type="date" style="height:26px"/>
          <button class="px-2 py-1 bg-blue-500 rounded" @click="analizeDtg">통행량 보기</button>
          <button class="px-2 py-1 bg-gray-500 rounded" @click="hideDtg">통행량 숨김</button>
        </div>
        <div class="w-40"></div>
        <div>
          <button class="px-2 py-1 bg-gray-500 rounded" @click="loadLineTrail(5)">개별차량 궤적(5)</button>
          <button class="px-2 py-1 bg-gray-500 rounded" @click="loadLineTrail(10)">10</button>
          <button class="px-2 py-1 bg-gray-500 rounded" @click="loadLineTrail(30)">30</button>
          <button class="px-2 py-1 bg-gray-500 rounded" @click="loadLineTrail(50)">50</button>
          <button class="text-white px-2 py-1 bg-gray-500 rounded" @click="loadLineTrail(100)">100</button>
          <input type="checkbox" class="text-white px-2 py-1 bg-gray-500 rounded mx-2" v-model="useTrip"/>
          <span v-if="useTrip">숨김</span>
          <span v-else>보이기</span>
          <!-- <button class="text-white px-2 py-1 bg-gray-500 rounded" @click="loadLinks">링크 애니메이션</button> -->
          <!-- <input type="checkbox" class="text-white px-2 py-1 bg-gray-500 rounded mx-2" v-model="useBuilding">빌딩</button> -->
          <!-- <input type="checkbox" class="text-white px-2 py-1 bg-gray-500 rounded mx-2" v-model="useLinks"/>도로 -->

        </div>
      </div>

    </div>
    <!-- VDS 통계 -->
    <transition name="slice-fade">
      <div v-if="showVds" class="bg-gray-700 opacity-80 dashboard-uniq-top-left min-w-max">
        <div class="flex justify-between text-blue-300 font-bold pl-3 mt-2">
          <div>VDS 통계</div>
          <button
            @click.prevent="showVds = !showVds"
            class="px-2 mx-2 hover:bg-blue-500 hover:text-white"
          >닫기</button>
        </div>
        <div v-if="chart.vds.length > 0" class="grid grid-cols-4 gap-2 text-white p-2 m-1 p-2">
          <div v-for="(c, idx) of chart.vds" :key="idx" class="bg-gray-800 rounded-lg w-60">
            <div class="uppercase text-sm font-bold text-blue-200 p-2">{{ c.title }} / {{ c.day }}</div>
            <line-chart :chartData="c.chartDataset" :options="defaultOption()" :height="180" />
          </div>
        </div>
      </div>
    </transition>

    <div
      v-if="videoUrl"
      class="bg-gray-700 opacity-80 text-white p-2 rounded-xl m-2 p-2 dashboard-uniq-top-right w-80"
    >
      <div class="font-bold text-blue-300 mb-2">CCTV {{ cctv.name }}</div>
      <video controls width="100%" autoplay>
        <source :src="videoUrl" type="video/mp4" />
        <!-- <source src="http://192.168.1.220:8080/video/%EA%B0%91%EC%B2%9C%EB%8C%80%EA%B5%90%EB%84%A4%EA%B1%B0%EB%A6%AC/N_20201020_080000.mp4" type="video/mp4"> -->
        Sorry, your browser doesn't support embedded videos.
      </video>
    </div>
    <div :ref="mapId" :id="mapId" :style="{ height: mapHeight + 'px' }" />

    <!-- <b-modal id="cctv-modal" ref="cctv-modal" :title="cctv.name" hide-footer >
      <video controls width="100%" autoplay >
        <source :src="videoUrl" type="video/mp4">
        Sorry, your browser doesn't support embedded videos.
      </video>
    </b-modal>-->
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
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
