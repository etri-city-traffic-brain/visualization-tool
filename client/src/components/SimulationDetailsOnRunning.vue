<template>
  <div>
    <!-- <b-card-text class="m-2"> 시뮬레이션: <strong>{{ simulationId }} </strong> </b-card-text> -->
    <b-card-group deck>
      <b-card
        text-variant="light"
        bg-variant="secondary"
        border-variant="dark"
        no-body
        class="m-0"
      >
        <b-card-body class="pt-1">
          <!-- <b-card-text> 화면영역 </b-card-text> -->
          <b-card-text>
            평균속도:
            <b-form inline>
              <b-progress  max="70" class="w-50">
                <b-progress-bar :value="avgSpeed" v-bind:style="{'background-color':congestionColor(avgSpeed)}"></b-progress-bar>
              </b-progress> &nbsp;
              <span :style="{'color': congestionColor(avgSpeed)}"> {{ (avgSpeed).toFixed(2) }} km </span>
            </b-form>
            <b-form inline>
              <b-button v-if="wsStatus !=='open'" @click="$emit('connect-web-socket')" size="sm">
                연결 <b-icon icon="plug"> </b-icon>
              </b-button>
            </b-form>
          </b-card-text>
          속도분포
          <doughnut :chartData="avgSpeedView" :height="110" />
        </b-card-body>
      </b-card>
      <b-card
        text-variant="light"
        bg-variant="secondary"
        border-variant="dark"
        no-body
        class="m-0"
      >
        <b-card-body class="pt-1">
          <!-- <b-card-text> 선택지역 통행차량: {{ focusData.vehicles }} 대, </b-card-text> -->
          <b-card-text>
            평균속도 (선택지역):
            <b-form inline>
              <b-progress  max="70" class="w-50">
                <b-progress-bar :value="focusData.speed" v-bind:style="{'background-color':congestionColor(focusData.speed)}"></b-progress-bar>
              </b-progress> &nbsp;
              <span>{{ focusData.speed }} km </span>
            </b-form>
          </b-card-text>
          <b-card-text>
          속도분포
          <doughnut :chartData="avgSpeedFocus" :height="110"/>
          </b-card-text>
        </b-card-body>
      </b-card>
      <b-card
        text-variant="light"
        bg-variant="secondary"
        border-variant="dark"
        no-body
        class="m-0"
      >
        <b-card-body>
          <b-card-text>
            <h5>시뮬레이션 진행률:</h5>
            <b-progress
              striped
              :animated="progress !== 100"
              height="2rem"
              show-progress class="w-100 mb-2 mt-2">
              <b-progress-bar :value="progress" animated striped>
                <span> {{ progress }} %</span>
              </b-progress-bar>
            </b-progress>
          </b-card-text>
          <b-form inline>
            <b-button v-if="simulation.status!=='running'" size="sm"> 시뮬레이션 시작 <b-icon icon="caret-right-fill"/> </b-button>
            <b-button size="sm" variant="dark"> 시뮬레이션 중지 <b-icon icon="stop-fill"/> </b-button>
            <b-button class="ml-2" @click="$emit('toggle-focus-tool')" size="sm" variant="dark"> 포커스 도구 </b-button>
          </b-form>
          <b-badge>웹 소켓 연결상태: {{ wsStatus.toUpperCase() }}</b-badge>
        </b-card-body>
      </b-card>
    </b-card-group>
    <b-card bg-variant="dark" border-variant="dark" no-body class="mt-1">
      <b-progress height="2rem" v-if="progress === 100">
        <b-progress-bar value="100" animated striped variant="success">
          <span><strong> 통계정보 생성중... </strong></span>
        </b-progress-bar>
      </b-progress>
       <b-form-textarea
        class="textarea-black"
        id="textarea-small"
        size="sm"
        debounce="500"
        rows="4"
        :value="logs.join('\n')"
        placeholder="SALT logs..."
      ></b-form-textarea>
    </b-card>
  </div>
</template>

<script>
import Doughnut from '@/components/charts/Doughnut';
import congestionColor from '@/utils/colors';

export default {
  name: 'SimulationDetailsOnRunning',
  components: {
    Doughnut,
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
