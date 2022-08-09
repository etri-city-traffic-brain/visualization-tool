<template>
  <div>
    <div class="fixed z-50 inset-auto h-full " v-if="showWaitingMsg">
      <div class="w-screen">
        <div class="animate-pulse mx-auto text-center mt-10 bg-yellow-300 p-5 text-xl font-bold">
          실행결과 분석 중입니다. 잠시후 실행 됩니다.
        </div>
      </div>
    </div>
    <div class="bg-gray-700 p-1">
      <div class="my-1">
        <div class="flex justify-between items-center p-2 border-b">
          <div class="text-white font-bold">시뮬레이션: {{ simulationId }}</div>
          <div class="text-center flex items-center space-x-1">
            <button class="bg-blue-200 rounded px-2 py-1 font-bold hover:bg-blue-400 hover:text-white" @click.stop="startSimulation()" > 시작<b-icon icon="caret-right-fill"/> </button>
            <button class="bg-blue-200 rounded px-2 py-1 font-bold hover:bg-blue-400 hover:text-white" @click="stop" > 중지<b-icon icon="stop-fill"/> </button>
          </div>
        </div>
        <div class="p-2 text-white border-b flex justify-between items-center">
          <div>
            <span class="font-bold bg-gray-500 p-1 rounded"> 지역</span>
             {{ getRegionName(config.region) }}
             <span class="font-bold bg-gray-500 p-1 rounded"> 시간</span> {{ config.fromTime }} ~ {{ config.toTime }}
          </div>
          <div>
            <button @click="showModal"><b-icon icon="gear-fill"></b-icon></button>
          </div>
        </div>
      </div>
    </div>

    <div class="relative">
      <div :ref="mapId" :id="mapId" :style="{height: mapHeight + 'px'}" class="p-1"/>
      <div class="w-40 p-1 absolute bottom-2 right-24">
        <UniqCongestionColorBar/>
      </div>
      <div class="w-80 p-1 absolute bottom-2 left-2 flex items-center">
        <uniq-map-changer :map="map"/>
        <b-button variant="dark" size="sm" class="ml-1" @click="centerTo">중앙</b-button>
      </div>
    </div>

    <div class="bg-gray-600 p-1 pb-3" v-if="simulation.status === 'finished'">
      <div class="py-2 bg-gray-700 rounded-xl mb-2 p-2">
        <b-form-input
          v-if="simulation.status === 'finished'"
          variant="dark"
          type="range"
          min="0"
          :max="slideMax"
          :value="currentStep"
          @change="onChange"
          @input="onInput"
        />
        <div
          class="flex justify-center space-x-1 items-center"

          no-body v-if="simulation.status === 'finished'"
        >
          <b-btn size="sm" variant="primary" @click="togglePlay" >
            <b-icon v-if="toggleState() === '시작'" icon="play-fill"></b-icon>
            <b-icon v-else icon="stop-fill"></b-icon>
            {{toggleState()}}
          </b-btn>
          <b-btn size="sm" variant="secondary" @click="stepBackward"> <b-icon icon="chevron-compact-left"/></b-btn>
          <b-btn size="sm" variant="secondary" @click="stepForward" > <b-icon icon="chevron-compact-right"/></b-btn>
          <span class="text-white">step: {{ currentStep }}</span>
        </div>
      </div>
      <div class="p-1 py-2 bg-gray-700 rounded-xl ">
        <line-chart :chartData="chart.linkMeanSpeeds" :options="defaultOption()" :height="50"/>
      </div>
    </div>

    <SimulationDetailsOnRunning
      v-if="simulation.status == 'running'"
      :simulation="simulation"
      :progress="progress"
      :wsStatus="wsStatus"
      :focusData="focusData"
      :simulationId="simulationId"
      :avgSpeed="avgSpeed"
      @connect-web-socket="connectWebSocket"
      @toggle-focus-tool="toggleFocusTool"
      :logs="logs"
    >
    </SimulationDetailsOnRunning>

    <div class="bg-gray-600 p-2"></div>

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
          <line-chart :chartData="chart.linkVehPassed" :options="defaultOption('통행량')" :height="200"/>
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
      hide-footer
    >
      <div class="p-2 space-y-1 bg-gray-700 my-1 mx-1">
        <div class="text-white min-w-max space-y-2">
          <div class="border-blue-600 space-y-2">
            <div class="flex space-x-1 items-center">
              <div class="bg-blue-500 px-1 rounded">지역</div><div class="bg-gray-500 px-1 rounded"> {{ getRegionName(config.region) }}</div>
              <div class="bg-blue-500 px-1 rounded">통계주기</div> <div class="bg-gray-500 px-1 rounded">{{ config.period / 60 }}분</div>
            </div>
            <div class="flex space-x-1">
              <div class="bg-blue-500 px-1 rounded">시작</div><div class="bg-gray-500 px-1 rounded"> {{ config.fromTime }}</div>
              <div class="bg-blue-500 px-1 rounded">종료</div> <div class="bg-gray-500 px-1 rounded">{{ config.toTime }}</div>
            </div>
            <div class="flex space-x-1">
              <div class="bg-blue-500 px-1 rounded">스텝</div>
              <div class="bg-gray-500 px-1 rounded"> {{ Math.ceil((config.end - config.begin) / config.period) }}</div>
            </div>
          </div>
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
    right: 5px;
    z-index:100;
  }
</style>
