<template>
  <div>
    <div class="text-white p-2 font-bold border-b">
      신호최적화 학습 {{ simulation.id }}
    </div>
    <div class="text-white p-2 font-bold flex justify-between space-x-2" >
      <div class="flex space-x-2">
        <div>
          {{ simulation.configuration.regionName }} | {{ simulation.configuration.junctionId }}
        </div>
        <div>|</div>
        <div>
          {{ simulation.configuration.fromTime }} ~ {{ simulation.configuration.toTime }}
        </div>
      </div>
      <!-- <div class="flex space-x-1 items-center uppercase">
        <div>액션: {{ simulation.configuration.action }}</div>
        <div>메소드: {{ simulation.configuration.method }}</div>
        <div>보상함수: {{ simulation.configuration.rewardFunc }}</div>
      </div> -->

      <div>

        <div class="font-bold text-black">
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
      </div>

    </div>
    <div class="uniq-top-left space-y-1">

      <!--
      <div class="bg-gray-700 text-white p-2 rounded-lg space-y-1 border w-80">
        <div class="text-sm">

        </div>
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
      </div>
    -->

      <div class="bg-gray-700 w-80 rounded-lg">
        <div class="font-bold p-1 text-white text-center">전체 보상그래프</div>
        <div class="px-1">
          <line-chart :chartData="rewardTotal" :options="defaultOption({}, chartClicked)" :height="180" />
        </div>
      </div>

          <!-- 교차로별 보상 그래프 -->
    <div class="bg-gray-700 w-80 rounded-lg ">
      <div class="font-bold p-1 text-white text-center ">교차로별 보상 그래프</div>
      <div v-for="(chart, idx) of rewardCharts" :key="idx" class="p-1">
        <div class="text-center text-white py-1">
          {{ chart.label }}
        </div>
        <div class="bg-gray-700 pb-1 pr-1 rounded-b-lg">
          <line-chart :chartData="chart" :options="rewardChartOption" :height="120" />
        </div>
      </div>
    </div>

      <div class="bg-gray-700 w-80 rounded-lg">
        <div class="text-center p-1 text-white">에포크</div>
        <div class="p-2 h-24 overflow-y-auto">
          <button
            v-for="e in epochs"
            :key="e"
            class="text-white font-bold bg-blue-400 mr-1 rounded text-sm px-1 hover:bg-blue-200 hover:text-black"
            @click="selectEpoch(e)"
          >
            {{ e }}
          </button>
        </div>
      </div>

      <!-- 최적화 진행률 -->
      <!--
        <div class="mt-2 p-2 bg-gray-700 font-bold text-white text-sm opacity-90 rounded-lg w-80">
        <div class="mb-1 uppercase inline-block text-center text-white rounded text-sm px-1 font-bold">
          Epoch: {{ progressOpt }} / {{ simulation.configuration.epoch }}
        </div>

        <b-progress :max="simulation.configuration.epoch" height="14px">
          <b-progress-bar :value="progressOpt" variant="primary">
            <span>Epoch {{ progressOpt }} / {{ simulation.configuration.epoch }}</span>
          </b-progress-bar>
        </b-progress>
      </div>
      -->

      <!--
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
      -->


    </div>

    <div class="train-result-table-container text-sm text-white rounded-lg p-1">
      <div class="bg-gray-700 p-3 text-center" v-if="optTrainResult && optTrainResult.length > 0">
        전체 통과시간 향상률
        <div class="text-4xl text-center font-bold"
        :style="{
          'color': getColorForImprovedRate(optTrainResult[optTrainResult.length-1].improvedRate)
        }"
        >
          {{  optTrainResult[optTrainResult.length-1].improvedRate }} %
        </div>
      </div>

      <div class="mt-1 bg-gray-700 ">
        <div class="text-center p-1 font-bold">
          교차로별 통과시간 향상률
        </div>
        <div class="w-84 p-1">
          <div class="grid grid-cols-6 gap-1 text-white text-center text-xs">
            <div class="bg-gray-500 col-span-3 py-1">교차로</div>
            <div class="bg-gray-500 py-1">기존(s)</div>
            <div class="bg-gray-500 py-1">최적(s)</div>
            <div class="bg-gray-500 py-1">향상률(%)</div>
          </div>
          <div class="train-result-table">

            <div v-for="(r, idx) of optTrainResult" :key="idx"
              class="grid grid-cols-6"
              :style="{
                color: getColorForImprovedRate(r.improvedRate)
              }"
            >
              <div class="border-b col-span-3">
                <svg v-if="r.improvedRate < 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" /> </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block"> <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" /> </svg>
                {{ r.name.toUpperCase() }}
              </div>
              <div class="border-b text-right">{{ r.ftAvgTravelTime }}</div>
              <div class="border-b text-right">{{ r.rlAvgTravelTime }}</div>
              <div class="border-b text-right">{{ r.improvedRate }}</div>
            </div>

          </div>
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

    <div class="bg-gray-800 fixed bottom-0 text-sm w-full text-white px-2 py-1 flex justify-between">
      <div class="flex space-x-1">
        <div>

        </div>
        <div class="flex space-x-1 items-center">
          <div class="flex-none">
            에포크 진행상태:
          </div>
          <div class="w-40">
            <b-progress>
              <b-progress-bar :max="simulation.configuration.epoch" :value="progressOpt" variant="primary">
                <span>Epoch {{ progressOpt }} / {{ simulation.configuration.epoch }}</span>
              </b-progress-bar>
            </b-progress>
          </div>
        </div>
        <div class="flex space-x-1 items-center">
          <div>시뮬레이션 진행률</div>
          <div class="w-40">
            <b-progress>
              <b-progress-bar :value="progress" animated striped variant="primary">
                <span> {{ progress }} %</span>
              </b-progress-bar>
            </b-progress>
          </div>
        </div>
      </div>

      <div class="">
        <span class="inline-block text-yellow-500 px-1 animate-pulse rounded"
          v-if="status === 'running' || status === 'stopping'">
          status: {{ status }}
        </span>
        <span class="inline-block text-blue-300 rounded px-1 " v-else>
          status: {{ status }}
        </span>

        <button class="text-white px-2 rounded text-sm hover:bg-blue-400" @click="getReward">
          <b-icon icon="arrow-clockwise"></b-icon>
        </button>
      </div>
    </div>

    <div v-if="!isReady" class="absolute top-24 w-full">
      <div class="flex justify-center">
        <div
          class="border rounded-lg text-center bg-blue-300 p-5 text-xl font-bold flex items-center space-x-1 justify-center w-92">
          <svg class="animate-spin h-16 w-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <div>
            실행 준비 중입니다. 잠시후 실행 됩니다.
          </div>
        </div>
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
  top: 140px;
  left: 10px;
  max-width: 280px;
  height: 100%;
  z-index: 100;
  padding: 0;
}

.reward-charts {
  position: fixed;
  top: 140px;
  right: 10px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 100;
  padding: 0;
}

.train-result-table-container {
  position: fixed;
  top: 140px;
  right: 10px;
  /* height: calc(100% - 450px); */
  /* max-height: calc(100% - 450px); */
  /* overflow-y: auto; */
  /* width: 80%; */
  z-index: 100;
  padding: 0;
}

.train-result-table {
  max-height: 600px;
  overflow-y: auto;
}


@import "@/assets/styles/style.css";
</style>
