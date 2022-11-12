<template>
  <div>
    <div class="fixed z-50 inset-auto h-full " v-if="showWaitingMsg">
      <div class="w-screen">
        <div class="animate-pulse mx-auto text-center mt-10 bg-yellow-300 p-5 text-xl font-bold">
          실행결과 분석 중입니다. 잠시후 실행 됩니다.
        </div>
      </div>
    </div>
    <div class="mx-1 fixed z-50 inset-y-40" v-if="simulation.error">
      <div class="max-w-full break-normal bg-red-200 rounded text-black p-2">{{simulation.error }}</div>
      <div>{{ statusText }}</div>
    </div>
    <div class="bg-gray-600">
      <div class="my-1">
        <div class="flex justify-between items-center p-2 border-b">
          <div class="text-white font-bold">시뮬레이션: {{ simulationId }}</div>
          <div class="text-center flex items-center space-x-1">
            <button class="bg-blue-200 rounded px-2 py-1 font-bold hover:bg-blue-400 hover:text-white" @click.stop="startSimulation()"> 시작<b-icon icon="caret-right-fill"/> </button>
            <button class="bg-blue-200 rounded px-2 py-1 font-bold hover:bg-blue-400 hover:text-white" @click="stop"> 중지<b-icon icon="stop-fill"/> </button>
            <button class="bg-blue-200 rounded px-2 py-1 font-bold hover:bg-blue-400 hover:text-white" @click="updateSimulation"> 상태확인 </button>
            <div class="bg-blue-400 p-1 rounded-lg">
              <span class="uppercase" v-if="simulation.status ==='running'">
                <div class="flex space-x-2 items-center">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div> {{ progress }} %</div>
                </div>
              </span>
              <span class="uppercase font-bold text-white px-2" v-else>{{ simulation.status }}</span>
            </div>
          </div>
        </div>
        <div class="p-2 text-white flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <!-- <span class="font-bold bg-gray-500 p-1 rounded"> 지역</span> -->
            <span class="font-bold bg-gray-500 px-2 p-1 rounded">{{ getRegionName(config.region) }}</span>
            <!-- <span class="font-bold bg-gray-500 p-1 rounded"> 시간</span> -->
            <span class="font-bold bg-gray-500 px-2 p-1 rounded">{{ config.fromTime }} ~ {{ config.toTime }}</span>
            <!-- <span class="font-bold bg-gray-500 p-1 rounded">실행 상태</span> -->
          </div>
          <div class="flex">
            <button @click="showModal"><b-icon icon="gear-fill"></b-icon></button>
          </div>
        </div>
      </div>
    </div>

    <div class="relative">
      <div :ref="mapId" :id="mapId" :style="{height: mapHeight + 'px'}" class=""/>
      <div class="w-40 p-1 absolute bottom-2 right-24">
        <UniqCongestionColorBar/>
      </div>
      <div class="absolute top-3 bg-gray-600 p-1 ml-1 rounded">
        <uniq-map-changer :map="map"/>
        <b-button variant="dark" size="sm" class="ml-1" @click="centerTo">처음위치</b-button>
      </div>
      <div class="p-1 absolute bottom-2 left-1 flex items-center bg-gray-600 rounded-lg">
        <div class="">
          <div class="" v-if="simulation.status === 'finished'">
            <div class="px-1 flex items-center">
              <div class="w-64 flex items-center px-2">
                <b-form-input
                  v-if="simulation.status === 'finished'"
                  variant="dark"
                  type="range"
                  min="0"
                  szie="sm"
                  :max="slideMax"
                  :value="currentStep"
                  @change="onChange"
                  @input="onInput"
                />
              </div>
              <div
                class="flex justify-center space-x-1 items-center flex-none" v-if="simulation.status === 'finished'"
              >
                <b-btn size="sm" variant="dark" @click="togglePlay" >
                  <b-icon v-if="toggleState() === '시작'" icon="play-fill"></b-icon>
                  <b-icon v-else icon="stop-fill"></b-icon>
                  {{toggleState()}}
                </b-btn>
                <b-btn size="sm" variant="secondary" @click="stepBackward"> <b-icon icon="chevron-compact-left"/></b-btn>
                <b-btn size="sm" variant="secondary" @click="stepForward" > <b-icon icon="chevron-compact-right"/></b-btn>
                <b-btn size="sm" variant="secondary" disabled> {{ currentStep }}</b-btn>
                <!-- {{ stepToTime(currentStep, simulation.configuration.fromTime, simulation.configuration.period) }} -->
              </div>
              <!-- <button @click="startReplay">리플레이</button> -->
              <!-- <button @click="stopReplay">리플레이 중지</button> -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="uniq-bottom-left w-96">
      <SimulationDetailsOnRunning
        v-if="simulation.status === 'running'"
        :simulation="simulation"
        :progress="progress"
        :focusData="focusData"
        :simulationId="simulationId"
        :avgSpeed="avgSpeed"
        @connect-web-socket="connectWebSocket"
        @toggle-focus-tool="toggleFocusTool"
        :logs="logs"
      >
      </SimulationDetailsOnRunning>
    </div>

    <!-- <div class="bg-gray-600 p-2"></div> -->

    <div v-if="currentEdge" class="p-1 space-y-1 uniq-top-right rounded-xl bg-gray-500" >
      <div v-if="currentEdge">
      {{ speedsByEdgeId[currentEdge.LINK_ID] || speedsByEdgeId[currentEdge.LINK_ID + '_0_0'] }}
        <div class="rounded-xl text-white text-center">
          <h5>
            <b-badge>{{ currentEdge.LINK_ID }}</b-badge>
            <b-badge>{{ currentEdge.vdsId }}</b-badge>
          </h5>
        </div>
        <div class="bg-gray-800 p-2 rounded-xl mt-1" >
          <div class="text-white text-sm text-center">SPEED</div>
          <line-chart :chartData="chart.linkSpeeds" :options="defaultOption()" :height="200"/>
        </div>
        <div class="bg-gray-800 p-2 rounded-xl mt-1" >
          <div class="text-white text-sm text-center">VOLUME</div>
          <line-chart :chartData="chart.linkVehPassed" :options="defaultOption('', '통행량')" :height="200"/>
        </div>
      </div>
      <div v-else>
        <!-- <div class="bg-gray-800 p-2 rounded-xl text-white text-center">링크를 선택하세요.</div> -->
      </div>
    </div>

    <b-modal title="시뮬레이션 정보" ref="simmodal" header-border-variant="dark"
      header-bg-variant="dark"
      header-text-variant="light"
      body-bg-variant="dark"
      body-text-variant="ligth"
      body-border-variant="dark"
      header-class="pt-2 pb-0 no-border-round"
      size="xl"
      hide-footer
    >
      <div class="p-2 space-y-1 bg-gray-700 mx-1">
        <div class="text-white min-w-max space-y-2">
          <div class="border-blue-600 space-y-2">
            <div class="flex space-x-1 items-center">
              <div class="bg-gray-500 px-1 rounded">지역</div><div class="px-1 rounded"> {{ getRegionName(config.region) }}</div>
            </div>
            <div class="flex space-x-1 items-center">
            <div class="bg-gray-500 px-1 rounded">통계주기</div> <div class="px-1 rounded">{{ config.period / 60 }}분</div>
            </div>
            <div class="flex space-x-1">
              <div class="bg-gray-500 px-1 rounded">시간</div><div class="px-1 rounded"> {{ config.fromTime }} ~
              {{ config.toTime }}</div>
            </div>
            <div class="flex space-x-1">
              <div class="bg-gray-500 px-1 rounded">스텝</div>
              <div class="px-1 rounded"> {{ Math.ceil((config.end - config.begin) / config.period) }}</div>
            </div>
            <div class="flex space-x-1">
              <div class="bg-gray-500 px-1 rounded">대상교차로</div>
              <div class="px-1 rounded"> {{ config.junctionId }}</div>
            </div>
            <div class="flex space-x-1">
              <div class="bg-gray-500 px-1 rounded">이미지</div>
              <div class="px-1 rounded"> {{ config.dockerImage }}</div>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-1" v-if="simulation.error">
            <div class="max-w-6xl break-normal bg-red-200 rounded text-black p-2">{{simulation.error }}</div>
          </div>
        <div class="mt-2 p-1 py-2 bg-gray-600 rounded-xl ">
          <line-chart :chartData="chart.linkMeanSpeeds" :options="defaultOption('시각', '')" :height="50"/>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script src="./simulation-result-map.js"> </script>

<style>
  .map {
    /* max-height: 1024px; */
    /* max-height: calc(100%); */
  }
  .uniq-top-right {
    width: 300px;
    position: absolute;
    padding: 0;
    top: 180px;
    right: 10px;
    z-index:100;
  }
  .uniq-bottom-left {
    /* width: 300px; */
    position: absolute;
    padding: 0;
    bottom: 70px;
    left: 10px;
    /* right: 10px; */
    z-index:100;
  }
</style>
