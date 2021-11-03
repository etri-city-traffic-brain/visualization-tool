<template>
  <div>
    <div class="uniq-top-left">
      <div class="bg-gray-700 py-1 font-bold text-center text-white">
      {{ simulationId }}
      </div>
      <!-- <uniq-congestion-color-bar class="mt-1"/> -->
      <div >
        <!-- 혼잡도 차트 -->
        <!--
        <div class="d-flex justify-content-around align-items-center">
          <doughnut :chartData="avgSpeedView" :height="50" :width="100" class="mt-1"/>
          <span
            v-bind:style="{
              'color':congestionColor(avgSpeed),
              'font-size': '2rem'
            }"
            class="font-weight-bold"
          >
            {{ (avgSpeed).toFixed(2) }} km
          </span>
        </div>
        -->
        <!-- <b-card
          class="mt-1 p-1"
          text-variant="dark"
          v-bind:style="{ 'background-color':congestionColor(avgSpeed) }"
          no-body
        >
          <b-card-text class="text-center">
            <h2> {{ (avgSpeed).toFixed(2) }} km </h2>
          </b-card-text>
        </b-card> -->
       </div>

      <div class="bg-gray-700 mt-1" >
        <div class="text-white text-center p-1 text-sm">Total Reward</div>

      <!-- 보상 그래프 -->
        <!-- <line-chart
          :chartData="rewards"
          :options="defaultOption({}, chartClicked)"
          :height="220"
        /> -->
        <line-chart
          :chartData="rewardTotal"
          :options="defaultOption({}, chartClicked)"
          :height="220"
        />

      </div>
      <div class="bg-gray-700 mt-1 p-1">
      <button class="bg-gray-500 text-white px-2 rounded text-sm hover:bg-gray-800 py-1" @click="getReward" size="sm">업데이트 리워드</button>
      </div>
      <div class="mt-1 p-2 bg-gray-700 font-bold text-white text-sm opacity-90 rounded">
      <!-- 최적화 진행률 -->
      <div class="text-center mb-1 uppercase">
        Epoch: {{ progressOpt }} / {{ simulation.configuration.epoch }}
      </div>

      <b-progress :max="simulation.configuration.epoch" height="8px">
        <b-progress-bar :value="progressOpt" animated striped variant="primary" >
          <!-- <span>Epoch {{ progressOpt }} / {{ simulation.configuration.epoch }}</span> -->
        </b-progress-bar>
      </b-progress>

    <!-- <div class="relative pt-1">
      <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
        <div style="width:30%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
      </div>
    </div> -->

    </div>


    <div class="mt-1 p-2 bg-indigo-400 font-bold text-sm opacity-90 rounded">
      <div class="text-center mb-1">
        시뮬레이션 진행률
      </div>
      <b-progress class="" height="8px">
        <b-progress-bar :value="progress" animated striped variant="primary">
          <span> {{ progress }} %</span>
        </b-progress-bar>
      </b-progress>
    </div>

    <div class="mt-1">
      <div class="bg-gray-500 font-bold text-white text-center uppercase p-1 animate-pulse" v-if="simulation.status === 'running' || simulation.status === 'stopping'">
        {{ simulation.status }}...
      </div>
      <div class="bg-gray-500 text-white text-center uppercase p-1" v-else>
        {{ simulation.status }}...
      </div>
    </div>


    <b-card
      bg-variant="dark"
      text-variant="light"
      no-body
      class="mt-1 p-2"
    >
      <div>
        <div>
        <button class="bg-gray-500 text-white px-2 rounded text-sm hover:bg-gray-800 py-1" @click="runTrain"> <b-icon icon="play-fill"/> 시작 </button>
        <button class="bg-gray-500 text-white px-2 rounded text-sm hover:bg-gray-800 py-1" @click="stop" size="sm">중지</button>

        <button
        class="bg-gray-500 text-white px-2 rounded text-sm hover:bg-gray-800 py-1"
        @click="stopVis" size="sm">가시화 중지
        </button>
        <button
        class="bg-gray-500 text-white px-2 rounded text-sm hover:bg-gray-800 py-1"
        @click="startVis" size="sm">가시화 시작
        </button>

        </div>
        <div class="mt-1">
        <router-link
          class="bg-gray-500 text-white px-2 rounded text-sm hover:bg-gray-800 py-1"
          :to="{
            name: 'OptimizationResultComparisonMap',
            params: {id: simulationId}
          }"
        >
          <b-icon icon="front"/> 신호비교
        </router-link>
        </div>
      </div>
    </b-card>
    </div>

    <div class="uniq-bottom-right">
      <!-- 제어버튼 -->

    </div>

    <!-- ----------- -->
    <!-- BOTTOM LEFT -->
    <!-- ----------- -->
    <div
    class="uniq-bottom-left"
    >

    </div>

    <!-- -------------------- -->
    <!-- 교차로별 보상 그래프 -->
    <!-- -------------------- -->
    <div class="reward-charts flex flex-wrap">
      <div v-for="(chart, idx) of rewardCharts" :key="idx" class="p-1">
        <div class="text-center text-xs text-white px-2 pt-1 w-36- bg-gray-500 rounded-t-xl tracking-wide">{{ chart.label }}</div>
        <!-- <div class="bg-white p-1"> -->
        <div class="bg-gray-700 pb-1 pr-1">
          <line-chart
            :chartData="chart"
            :options="defaultOption({}, ()=>{})"
            :height="90"
            :width="200"
          />
        </div>
        <!-- </div> -->
      </div>
    </div>

    <!------------- -->
    <!--  배경지도  -->
    <!---------------->
    <div
      :ref="mapId"
      :id="mapId"
      :style="{height: mapHeight + 'px'}"
      class="m-0 p-0"
    />
  </div>
</template>

<script src="./optimization-result-map.js"> </script>

<style>

  .info-card {
    opacity: 0.9;
    border-radius: 0px;
  }

  .uniq-box-panel {
    border-radius: 0px;
  }

  .map {
    max-height: calc(100%);
  }

  .uniq-top-left {
    max-width: 260px;
    height: 100%;
    position: fixed;
    z-index:100;
    top: 50px;
    padding: 0;
    left: 5px;
  }
  .reward-charts {
    /* max-width: 260px; */
    width: 80%;
    /* height: 100%; */
    position: fixed;
    z-index:100;
    top: 50px;
    padding: 0;
    left: 280px;
  }

  .uniq-bottom-left {
    width: 260px;

    position: fixed;
    z-index:100;
    bottom: 10px;
    padding: 0;
    left: 5px;
    border: 0px solid #73AD21;
  }

  .uniq-bottom-right {
    /* width: 260px; */
    position: fixed;
    z-index:100;
    bottom: 10px;
    padding: 0;
    right: 5px;
  }

  .uniq-top-right {
    position: fixed;
    z-index:100;
    top: 60px;
    padding: 0;
    right: 15px;
    border: 0px solid #73AD21;
  }

  .loading-container {
    position: fixed;
    top:0;
    left:50%;
    height: 600px;
  }

  .loading-vertical-center {
    margin: 0;
    position: absolute;
    top: 50%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  @import '@/assets/styles/style.css';
</style>
