<template>
  <div>
    <!-- <b-container fluid class="mt-2">
      <b-card
        header="스텝별 평균속도 변화"
        header-text-variant="white"
        header-bg-variant="dark"
        no-body
      >
      <div class="bg-gray-700">
        <bar-chart
          class="bar"
          :chartData="speedsPerStep"
          :height="100"
        />
      </div>
      </b-card>
    </b-container> -->
    <div class="mt-2" >
      <div class="bg-gray-700 text-white space-y-1 my-1 p-1">
        <b-input-group variant="dark">
          <b-form-input
            variant="dark"
            type="range"
            min="0"
            :max="slideMax"
            :value="currentStep"
            @change="onChange"
            @input="onInput" />
          <b-button-group>
            <b-button size="sm" @click="stepBackward"> &lsaquo; </b-button>
            <b-button size="sm" @click="stepForward"> &rsaquo; </b-button>
          </b-button-group>
        </b-input-group>
        <div class="px-1">
          {{ currentStep }} / {{ slideMax }}
          <!-- <b-form-checkbox
            @change="togglePlay"
            value="play"
            unchecked-value="stop">
            자동실행 ({{ currentStep }} / {{ slideMax }})
          </b-form-checkbox> -->
        </div>
      </div>
    </div>


    <div class="mt-1" v-if="ready">
      <div class="grid grid-cols-2 gap-1">
        <div v-if="histogramData !==null" class="bg-gray-700 rounded text-white">
          <div class="font-bold text-center p-1">
            속도분포
          </div>
          <histogram-chart class="bar p-2" :chartData="histogramData" :height="100" />
        </div>
        <div v-if="histogramDataStep !==null" >
          <div class="bg-gray-700 text-white font-bold text-center p-1">
          스텝별 속도분포
        </div>
          <histogram-chart class="bar bg-gray-700 p-2" :chartData="histogramDataStep" :height="100" />
        </div>
      </div>


      <div class="grid grid-cols-2 gap-1 mt-1">
      <div v-if="pieData !== null" >
        <div class="bg-gray-700 text-center font-bold text-white p-1">
          혼잡도 분포
        </div>
        <doughnut class="p-2 bg-gray-700" :chartData="pieData" style="height:160px" />
      </div>
      <div v-if="pieDataStep !== null" >
       <div class="bg-gray-700 text-white font-bold text-center p-1">
          스텝별 혼잡도 분포
        </div>
        <doughnut class="p-2 bg-gray-700" :chartData="pieDataStep" style="height:160px" />
    </div>
    </div>
  </div>
  <div v-else>
    <div class="text-2xl text-center font-bold text-white my-5">Loading...</div>
  </div>
  </div>
</template>

<script src="./simulation-result.js"> </script>

<style scoped>
.card-header {
  padding: 0.30rem 0.75rem;
}
.card-footer {
  padding: 0.25rem 0.75rem;
}
.card-body {
  padding: 0.5rem;
}
</style>
