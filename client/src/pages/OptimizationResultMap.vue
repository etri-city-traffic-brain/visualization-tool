<template>
  <div>
    <div class="uniq-top-left">
      <div class="bg-gray-700 py-2 text-white p-2 rounded-lg text-sm space-y-1 border w-80">
        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">ID</span>
          {{ simulation.id }}
        </div>
        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">지역</span>
          {{ getRegionName(simulation.configuration.region) }}
        </div>
        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">시간</span>
          <span class="text-xs">
            {{ simulation.configuration.fromTime }}({{
              simulation.configuration.begin
            }}) ~ {{ simulation.configuration.toTime }}({{
  simulation.configuration.end
}})
          </span>
        </div>
        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">주기</span>
          {{ simulation.configuration.period }} (초)
        </div>
        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">교차로</span>
          {{ simulation.configuration.junctionId }}
        </div>
        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">이미지</span>
          <span class="text-xs">{{ simulation.configuration.dockerImage }}
          </span>
        </div>
        <!--
        <div>
          <span class="w-14 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">상태</span>
          <span class="bg-gray-700 rounded-full text-center uppercase text-white font-bold space-x-1">
            <span class="inline-block bg-green-500 px-1 animate-pulse rounded" v-if="simulation.status === 'running' ||
              simulation.status === 'stopping'
              ">
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
         -->
      </div>

      <div class="bg-gray-700 mt-2 rounded-lg border w-80">
        <div class="font-bold p-1 text-white text-center">보상그래프</div>
        <div class="px-1">
          <line-chart :chartData="rewardTotal" :options="defaultOption({}, chartClicked)" :height="180" />
        </div>
      </div>

      <div class="bg-gray-700 w-80  mt-2">
        <div class="text-center p-1 text-white">에포크</div>
        <div class="p-2 h-24 overflow-y-auto">
          <button v-for="e in epochs" :key="e" class="bg-gray-200 mr-1 rounded text-sm px-1 hover:bg-blue-200"
            @click="selectEpoch(e)">
            {{ e }}
          </button>
        </div>
      </div>

      <div class="mt-2 p-2 bg-gray-700 font-bold text-white text-sm opacity-90 rounded-lg w-80">
        <!-- 최적화 진행률 -->
        <div class="mb-1 uppercase inline-block text-center text-white rounded text-sm px-1 font-bold">
          Epoch: {{ progressOpt }} / {{ simulation.configuration.epoch }}
        </div>

        <b-progress :max="simulation.configuration.epoch" height="14px">
          <b-progress-bar :value="progressOpt" variant="primary">
            <!-- <span>Epoch {{ progressOpt }} / {{ simulation.configuration.epoch }}</span> -->
          </b-progress-bar>
        </b-progress>
      </div>

      <div class="mt-2 p-2 bg-gray-700 font-bold text-white text-sm opacity-90 rounded-lg w-80">
        <div class="mb-1 uppercase inline-block text-center text-white rounded text-sm px-1 font-bold">
          시뮬레이션 진행 상태
        </div>
        <div class="mx-1">
          <b-progress height="14px">
            <b-progress-bar :value="progress" animated striped variant="primary">
              <span> {{ progress }} %</span>
            </b-progress-bar>
          </b-progress>
        </div>
      </div>

      <div class="bg-gray-600 opacity-90 rounded-lg mt-2 p-2 w-80">
        <div>
          <button class="font-bold bg-blue-300 px-2 rounded text-sm hover:bg-blue-600 hover:text-white py-1"
            @click="runTrain">
            <b-icon icon="play-fill" /> 학습 시작
          </button>
          <button class="font-bold bg-yellow-300 px-2 rounded text-sm hover:bg-yellow-600 hover:text-white py-1"
            @click="stop" size="sm">
            <b-icon icon="stop-fill"></b-icon> 학습 중지
          </button>
          <router-link v-if="status === 'finished' || status === 'stopped'"
            class="bg-gray-400 px-2 rounded text-sm hover:bg-gray-800 hover:text-white py-1 " tag="button" :to="{
              name: 'OptimizationResultComparisonMap',
              params: { id: simulationId }
            }">
            <b-icon icon="front" /> 신호비교
          </router-link>
        </div>
        <div class="mt-1"></div>
      </div>
    </div>

    <!-- 교차로별 보상 그래프 -->
    <div class="reward-charts rounded-lg bg-gray-700">
      <div class="text-white text-center mt-1">교차로별 보상 그래프</div>
      <div v-for="(chart, idx) of rewardCharts" :key="idx" class="p-1">
        <div class="text-center text-white py-1">
          {{ chart.label }}
        </div>
        <div class="bg-gray-700 pb-1 pr-1 w-80 h-48- rounded-b-lg">
          <line-chart :chartData="chart" :options="rewardChartOption" :height="120" :width="200" />
        </div>
      </div>
    </div>

    <div class="train-result-table text-sm bg-gray-800 text-white rounded-lg p-1">
      <div class="text-center p-1">
        교차로별 통과시간 향상률
      </div>
      <!-- { "name": "SA 103", "SA": "total",
        "ftAverageSpeed": "22.84",
        "ftVehPassed": 1168,
        "ftAvgTravelTime": 66.97,
        "rlAvgTravelTime": 57.87,
        "improvedRate": 13.58 } -->
      <div class="w-80 p-1">
        <div class="text-white font-bold grid grid-cols-6 gap-1 text-center">
          <div class="bg-gray-500 col-span-3">교차로</div>
          <div class="bg-gray-500">기존</div>
          <div class="bg-gray-500">최적</div>
          <div class="bg-gray-500">향상률</div>
        </div>
        <div v-for="(r, idx) of optTrainResult" :key="idx" class="grid grid-cols-6" :style="{
          color: getColorForImprovedRate(r.improvedRate)
        }">
          <div class="border-b col-span-3">{{ r.name.toUpperCase() }}</div>
          <div class="border-b text-right">{{ r.ftAvgTravelTime }}</div>
          <div class="border-b text-right">{{ r.rlAvgTravelTime }}</div>
          <div class="border-b text-right">{{ r.improvedRate }}</div>
        </div>
      </div>
    </div>

    <!-- 시뮬레이션 진행률 표시 -->
    <!-- <div class="uniq-bottom w-screen"> -->
    <!--
        <div class="mt-2 mb-1 inline-block text-center text-white rounded text-sm px-1 font-bold">
          시뮬레이션: {{progres || 0}} / 100
        </div>
      -->
    <!-- </div> -->

    <!------------- -->
    <!--  배경지도  -->
    <!---------------->
    <div :ref="mapId" :id="mapId" :style="{ height: mapHeight + 'px' }" class="m-0 p-0"></div>
    <div class="bg-gray-800 fixed bottom-0 text-sm w-full text-white px-2 flex justify-between">
      <div>
        {{ simulation.id }}
      </div>
      <div class="">
        <span class="inline-block text-yellow-500 px-1 animate-pulse rounded"
          v-if="status === 'running' || status === 'stopping'">
          상태: {{ status }}
        </span>
        <span class="inline-block text-blue-300 rounded px-1 " v-else>
          상태: {{ status }}
        </span>

        <button class="bg-gray-600 text-white px-2 rounded text-sm hover:bg-blue-600" @click="getReward">
          <b-icon icon="arrow-clockwise"></b-icon> 상태 갱신
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./optimization-result-map.js"></script>

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
  z-index: 100;
  padding: 0;
}

.reward-charts {
  position: fixed;
  top: 60px;
  right: 10px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 100;
  padding: 0;
}

.train-result-table {
  position: fixed;
  top: 400px;
  right: 10px;
  /* height: calc(100% - 450px); */
  max-height: calc(100% - 450px);
  overflow-y: auto;
  /* width: 80%; */
  z-index: 100;
  padding: 0;
}

@import "@/assets/styles/style.css";
</style>
