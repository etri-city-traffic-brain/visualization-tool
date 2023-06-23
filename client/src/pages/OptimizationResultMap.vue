<template>
  <div>
    <div class="uniq-top-left">
      <div class="bg-gray-700 py-2 text-white p-2 rounded-lg text-sm space-y-1 border w-80">

        <div> <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">ID</span> {{ simulation.id }} </div>
        <div> <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">지역</span> {{ getRegionName(simulation.configuration.region) }} </div>
        <div> <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">시간</span> <span class="text-xs">{{ simulation.configuration.fromTime }}({{ simulation.configuration.begin }}) ~
        {{ simulation.configuration.toTime }}({{ simulation.configuration.end }})</span></div>
        <div> <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">주기</span> {{ simulation.configuration.period }} (초)</div>
        <div> <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">교차로</span> {{ simulation.configuration.junctionId }} </div>
        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">이미지</span>
          <span class="text-xs">{{ simulation.configuration.dockerImage }} </span>
        </div>

        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">상태</span>
          <span class="bg-gray-700 rounded-full text-center uppercase text-white font-bold space-x-1">
            <span class="inline-block bg-green-500 px-1 animate-pulse rounded" v-if="simulation.status === 'running' || simulation.status === 'stopping'">
              {{ simulation.status }}
            </span>
            <span class="inline-block bg-yellow-500 rounded px-1 " v-else>
              {{ simulation.status }}
            </span>

            <button class="bg-gray-600 text-white px-2 rounded text-sm hover:bg-blue-600" @click="getReward">
              <b-icon icon="arrow-clockwise"></b-icon> 상태 갱신
            </button>
          </span>
        </div>

        <!-- <div> <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">스크립트</span> {{ simulation.configuration.script }} </div> -->

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

      <div class="bg-gray-700 mt-2 rounded-lg border w-80" >
        <!-- <div class="text-white text-center p-1 text-sm">Total Reward</div> -->
        <div class="font-bold p-2 text-white text-center">보상그래프</div>
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

      <div class="mt-2 p-2 bg-gray-700 font-bold text-white text-sm opacity-90 rounded-lg w-80">
      <!-- 최적화 진행률 -->
        <div class="mb-1 uppercase inline-block text-center text-white rounded text-sm px-1 font-bold">
          Epoch: {{ progressOpt }} / {{ simulation.configuration.epoch }}
        </div>

        <b-progress :max="simulation.configuration.epoch" height="14px">
          <b-progress-bar :value="progressOpt" variant="primary" >
            <!-- <span>Epoch {{ progressOpt }} / {{ simulation.configuration.epoch }}</span> -->
          </b-progress-bar>
        </b-progress>
      </div>

      <div class="bg-gray-600 opacity-90 rounded-lg mt-2 p-2 w-80">
        <div>
          <button class="font-bold bg-blue-300 px-2 rounded text-sm hover:bg-blue-600 hover:text-white py-1" @click="runTrain">
            <b-icon icon="play-fill"/> 학습 시작
          </button>
          <button class="font-bold bg-yellow-300 px-2 rounded text-sm hover:bg-yellow-600 hover:text-white py-1" @click="stop" size="sm">
            <b-icon icon="stop-fill"></b-icon> 학습 중지
          </button>
          <router-link
            v-if="status==='finished' || status==='stopped'"
            class="bg-gray-400 px-2 rounded text-sm hover:bg-gray-800 hover:text-white py-1 "
            tag="button"
            :to="{
              name: 'OptimizationResultComparisonMap',
              params: {id: simulationId}
            }"
          >
            <b-icon icon="front"/> 신호비교
          </router-link>
        </div>
        <div class="mt-1">
        </div>
      </div>
    </div>

    <div class="uniq-bottom-right">
      <!-- 제어버튼 -->
    </div>

    <!-- ----------- -->
    <!-- BOTTOM LEFT -->
    <!-- ----------- -->
    <div class="uniq-bottom-left" >

    </div>

    <!-- -------------------- -->
    <!-- 교차로별 보상 그래프 -->
    <!-- -------------------- -->
    <div class="reward-charts flex flex-col flex-wrap max-h-max rounded-lg">
      <!-- <div class="text-white text-center mt-1">교차로별 보상 그래프</div> -->
      <div v-for="(chart, idx) of rewardCharts" :key="idx" class="p-1">
        <div class="w-80 text-center text-xs text-white px-2 pt-2 py-1 bg-gray-600 rounded-t-lg tracking-wide">
          {{ chart.label }}
        </div>
        <div class="bg-gray-700 pb-1 pr-1 w-80 h-48 rounded-b-lg">
          <line-chart
            :chartData="chart"
            :options="defaultOption({}, ()=>{})"
            :height="180"
            :width="200"
          />
        </div>
      </div>
    </div>

    <!-- 시뮬레이션 진행률 표시 -->
    <div class="uniq-bottom w-screen">
      <!--
        <div class="mt-2 mb-1 inline-block text-center text-white rounded text-sm px-1 font-bold">
          시뮬레이션: {{progres || 0}} / 100
        </div>
      -->
      <div class="mx-1">
        <b-progress height="14px">
          <b-progress-bar :value="progress" animated striped variant="primary">
            <span> {{ progress }} %</span>
          </b-progress-bar>
        </b-progress>
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
    position: fixed;
    top: 60px;
    left: 10px;
    max-width: 280px;
    height: 100%;
    z-index:100;
    padding: 0;
  }

  .uniq-bottom {
    position: fixed;
    bottom: 5px;
    /* left: 10px; */
    /* max-width: 280px; */
    /* height: 100%; */
    z-index:100;
    /* padding: 0; */
  }

  .reward-charts {
    position: fixed;
    top: 100px;
    right: 10px;
    /* width: 80%; */
    z-index:100;
    padding: 0;
    /* opacity: 0.8; */
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

  /* .uniq-top-right {
    position: fixed;
    z-index:100;
    top: 60px;
    padding: 0;
    right: 15px;
    border: 0px solid #73AD21;
  } */

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
