    <!--
      디자인참고: http://lezir.vuejs.themesbrand.com/index-1
    //-->
<template>
  <div class="godo bg-gray-800 h-full- overflow-hidden">
    <video autoplay muted loop src="public/bg.mp4" class="bg-video object-cover"></video>

    <!-- Center Item -->
    <div class="fixed inset-0 h-full flex items-center">
      <div class="relative py-3 max-w-xl sm:max-w-3xl sm:mx-auto mt-10">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-900 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl bg-opacity-75"></div>
        <div class="absolute inset-0 bg-blue-900 transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl bg-opacity-75"></div>
        <div class="relative bg-gray-700 shadow-lg sm:rounded-3xl sm:p-5 bg-opacity-75">
          <div class="bg-gray-100 rounded-xl p-8 bg-opacity-95">
            <div class="divide-y divide-gray-200">
              <div class="pt-6 space-y-4">
              <div class="py-2 text-base leading-6 space-y-3 text-gray-700 sm:text-lg sm:leading-7 animate__animated animate__backInLeft">
                <h3 class="italic font-bold">UNIQ</h3>
                <p class="italic font-bold text-blue-900 text-4xl">클라우드 엣지 기반 도시교통 브레인</p>
                <p class="text-lg font-semibold text-indigo-700 underline">대도시의 교통소통 최적화를 위해,</p>
                <p class=""><strong>클라우드-엣지</strong> 기반 실시간 교통상황 분석 및 대규모 교통 시뮬레이션 분산처리를 통해 교통제어 지능을 제공하는
                <strong class="text-blue-500">도시교통 브레인 시스템 개발</strong> </p>
              </div>
            </div>
            <div class="pt-4 text-base leading-6 font-bold sm:text-lg sm:leading-7 ">
              <router-link :to="{ name: 'SimulationList'}" >
                <button
                  class="bg-blue-900 px-4 py-2 rounded text-white text-sm hover:bg-blue-400 animate__animated animate__backInUp"
                  >교통 시뮬레이션
                </button>
              </router-link>
              <router-link :to="{ name: 'OptimizationList'}" >
                <button
                  class="bg-green-900 px-4 py-2 rounded text-white text-sm hover:bg-green-400 animate__animated animate__backInUp"
                  >신호 최적화
                </button>
              </router-link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import App from '../App.vue';

export default {
  name: "Intro",
  data() {
    return {
    };
  },
  components: { App }
};
</script>

<style scoped>

.godo {
  font-family: 'Godo', sans-serif;
  /* font-size: 20px */
}

.bg-video {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;

}
</style>
