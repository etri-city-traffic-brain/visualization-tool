<template>
  <div class="m-1">

    <!-- <b-card-group> -->

      <!-- <uniq-card-title title="평균속도" class="info-card"/> -->
      <div class="bg-gray-700 p-1 space-y-1"
      >
        <div class="text-center text-white">평균속도</div>
        <b-progress height="2rem" max="70" class="w-100" style="border-radius:0">
          <b-progress-bar animated striped :value="avgSpeed" v-bind:style="{'background-color':congestionColor(avgSpeed)}">
            <span> {{ (avgSpeed).toFixed(2) }} km </span>
          </b-progress-bar>
          </b-progress>
      </div>

      <uniq-card-title title="혼잡도 분포" class="info-card"/>
      <b-card
        text-variant="light"
        bg-variant="dark"
        border-variant="dark"
        no-body
        class="p-2 info-card"
      >
        <doughnut :chartData="avgSpeedView" :height="110" />
      </b-card>

      <uniq-card-title title="시뮬레이션 진행상태" class="info-card"/>
      <b-card
        text-variant="light"
        bg-variant="secondary"
        border-variant="secondary"
        no-body
        class="info-card"
      >
        <b-card-body class="p-0">
          <b-card-text>
            <b-progress
              striped
              :animated="progress !== 100"
              height="2rem"
              show-progress class="w-100"
              style="border-radius:0"
            >
              <b-progress-bar :value="progress" animated striped>
                <span> {{ progress }} %</span>
              </b-progress-bar>
            </b-progress>
          </b-card-text>

        </b-card-body>
      </b-card>
    <!-- </b-card-group> -->

    <b-card bg-variant="dark" border-variant="dark" no-body class="mt-1 info-card">
       <b-progress height="2rem" v-if="progress === 100">
        <b-progress-bar value="100" animated striped variant="success">
          <span><strong> 통계정보 생성중... </strong></span>
        </b-progress-bar>
      </b-progress>
    </b-card>

    <b-card bg-variant="dark" border-variant="dark" no-body class="mt-1 info-card" >
      <b-form-textarea
        class="textarea-black"
        id="textarea-small"
        size="sm"
        debounce="500"
        rows="12"
        :value="logs.join('\n')"
        placeholder="SALT logs..."
        style="font-size:0.7rem"
      >
        <!-- SALT Logs -->
      </b-form-textarea>
      <div>
        <b-button
          @click="$emit('connect-web-socket')"
          v-if="wsStatus !=='open'"
          size="sm"
          variant="dark"
        >
          <b-icon icon="plug"> </b-icon>
        </b-button>
        <b-button
          @click="$emit('toggle-focus-tool')"
          size="sm"
          variant="dark"
        >
          <b-icon icon="search"/>
        </b-button>
      </div>
    </b-card>
  </div>
</template>

<script>
import Doughnut from '@/components/charts/Doughnut';
import congestionColor from '@/utils/colors';
import UniqCardTitle from '@/components/func/UniqCardTitle';
export default {
  name: 'SimulationDetailsOnRunning',
  components: {
    Doughnut,
    UniqCardTitle
  },
  props: {
    simulation: Object,
    progress: Number,
    wsStatus: String,
    focusData: Object,
    simulationId: String,
    avgSpeed: Number,
    avgSpeedView: Object,
    avgSpeedFocus: Object,
    logs: Array
  },
  methods: {
    congestionColor
  }
}
</script>

<style scoped>
  .textarea-black {
    width: 100%;
    /* height: 100px; */
    background-color: black;
    font-size: 1em;
    font-weight: bold;
    font-family: Verdana, Arial, Helvetica, sans-serif;
    border: 1px solid black;
  }

  .info-card {
    opacity: 0.9;
    border-radius: 0px;
  }
</style>
