<template>
  <div class="p-1">
    <div class="bg-gray-800 p-1 rounded rounded-lg">
      <div class="text-center text-white p-1">평균속도</div>
      <div class="p-3 text-center ">
        <span class="text-5xl text-white"> {{ avgSpeed.toFixed(2) }} km </span>
      </div>
      <div>
        <div v-if="progress === 100">
          <b-progress height="2rem">
            <b-progress-bar value="100" animated striped variant="success">
              <span><strong> 통계정보 생성중... </strong></span>
            </b-progress-bar>
          </b-progress>
        </div>
        <div v-else>
          <b-progress
            striped
            :animated="progress !== 100"
            height="1rem"
            show-progress
            class="w-100"
            style="border-radius:0"
          >
            <b-progress-bar :value="progress" animated striped>
              <span> {{ progress }} %</span>
            </b-progress-bar>
          </b-progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Doughnut from "@/components/charts/Doughnut";
import congestionColor from "@/utils/colors";
import UniqCardTitle from "@/components/func/UniqCardTitle";
export default {
  name: "SimulationDetailsOnRunning",
  components: {
    Doughnut,
    UniqCardTitle
  },
  props: {
    simulation: Object,
    progress: Number,
    focusData: Object,
    simulationId: String,
    avgSpeed: Number,
    logs: Array
  },
  methods: {
    congestionColor
  }
};
</script>
