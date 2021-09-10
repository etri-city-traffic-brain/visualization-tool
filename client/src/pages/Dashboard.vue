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

  <b-modal id="cctv-modal" ref="cctv-modal" title="CCTV" hide-footer >
    <video controls width="100%" autoplay >
    <source src="https://www.rmp-streaming.com/media/big-buck-bunny-360p.mp4" type="video/mp4">
    Sorry, your browser doesn't support embedded videos.
</video>
  </b-modal>

  </div>
</template>

<script src="./dashboard.js">

</script>

<style>

</style>
