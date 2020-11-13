<template>
  <div>

    <!-- <b-card-group> -->

      <uniq-card-title title="혼잡도 분포"/>
      <b-card
        text-variant="light"
        bg-variant="dark"
        border-variant="dark"
        no-body
        class="mt-1"
      >
        <b-card-body class="p-2">
          <!-- <b-form inline> -->
            <b-progress height="2rem" max="70" class="w-100">
              <b-progress-bar animated striped :value="avgSpeed" v-bind:style="{'background-color':congestionColor(avgSpeed)}">
                <span> {{ (avgSpeed).toFixed(2) }} km </span>
              </b-progress-bar>
              </b-progress>
            <!-- </b-form> -->
            <b-form inline v-if="wsStatus !=='open'">
              <b-button @click="$emit('connect-web-socket')" size="sm">
                연결 <b-icon icon="plug"> </b-icon>
              </b-button>
            </b-form>
          <doughnut :chartData="avgSpeedView" :height="110" />
        </b-card-body>
      </b-card>

      <uniq-card-title title="혼잡도 분포(포커스)"/>

      <b-card
        text-variant="light"
        bg-variant="dark"
        border-variant="dark"
        no-body
        class="mt-1"
      >
        <b-card-body class="p-2">
          <!-- <b-form inline> -->
            <b-progress height="2rem" max="70" class="w-100">
              <b-progress-bar animated striped :value="focusData.speed" v-bind:style="{'background-color':congestionColor(focusData.speed)}">
                <span>{{ focusData.speed }} km </span>
              </b-progress-bar>
            </b-progress>
          <!-- </b-form> -->
          <doughnut :chartData="avgSpeedFocus" :height="110"/>
        </b-card-body>
      </b-card>

      <uniq-card-title title="시뮬레이션 진행상태"/>
      <b-card
        text-variant="light"
        bg-variant="dark"
        border-variant="dark"
        no-body
        class="mt-1"
      >
        <b-card-body class="p-2">
          <b-card-text>
            <b-progress
              striped
              :animated="progress !== 100"
              height="2rem"
              show-progress class="w-100"
              v-if="progress > 0"
            >
              <b-progress-bar :value="progress" animated striped>
                <span> {{ progress }} %</span>
              </b-progress-bar>
            </b-progress>
          </b-card-text>
          <b-form inline>
            <b-button v-if="simulation.status!=='running'" size="sm"> 시뮬레이션 시작 <b-icon icon="caret-right-fill"/> </b-button>
            <b-button size="sm" variant="secondary"> 시뮬레이션 중지 <b-icon icon="stop-fill"/> </b-button>
            <b-button class="ml-2" @click="$emit('toggle-focus-tool')" size="sm" variant="secondary">
              렌즈 <b-icon icon="search"/>
            </b-button>
          </b-form>
        </b-card-body>
      </b-card>
    <!-- </b-card-group> -->

    <b-card bg-variant="dark" border-variant="dark" no-body class="mt-1">
       <b-progress height="2rem" v-if="progress === 100">
        <b-progress-bar value="100" animated striped variant="success">
          <span><strong> 통계정보 생성중... </strong></span>
        </b-progress-bar>
      </b-progress>
    </b-card>

    <b-card bg-variant="dark" border-variant="dark" no-body class="mt-1">

       <b-form-textarea
        class="textarea-black"
        id="textarea-small"
        size="sm"
        debounce="500"
        rows="12"
        :value="logs.join('\n')"
        placeholder="SALT logs..."
      ></b-form-textarea>
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
</style>
