<template>
  <div>
    <div class="flex bg-gray-700 items-center p-1">
      <div class="w-48">
        <b-form-input v-model="dtgDate" type="date"/>
      </div>
      <button class="block h-10 text-white px-2 py-1 bg-gray-500 rounded mx-2" @click="analizeDtg">DTG 분석</button>
    </div>
    <div
      :ref="mapId"
      :id="mapId"
      :style="{height: mapHeight + 'px'}"
    />

    <b-modal id="cctv-modal" ref="cctv-modal" :title="cctv.name" hide-footer >
      <!-- {{ videoUrl }} -->
      <video controls width="100%" autoplay >
        <source :src="videoUrl" type="video/mp4">
        <!-- <source src="http://192.168.1.220:8080/video/%EA%B0%91%EC%B2%9C%EB%8C%80%EA%B5%90%EB%84%A4%EA%B1%B0%EB%A6%AC/N_20201020_080000.mp4" type="video/mp4"> -->
        Sorry, your browser doesn't support embedded videos.
      </video>
  </b-modal>

  </div>
</template>

<script src="./dashboard.js">

</script>

<style>

</style>
