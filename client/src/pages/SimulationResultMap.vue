<template>
  <div>
    <div
      class="bg-gray-700 p-1 rounded-lg"
      v-bind:style="playerStyle"
      no-body v-if="simulation.status === 'finished'"
    >
      <b-button-group>
        <b-btn size="sm" variant="secondary" @click="togglePlay" > {{ toggleState() }} </b-btn>
        <b-btn size="sm" variant="secondary" @click="stepBackward"> <b-icon icon="caret-left-fill"/> </b-btn>
        <b-btn size="sm" variant="secondary" @click="stepForward" > <b-icon icon="caret-right-fill"/> </b-btn>
        <b-input-group size="sm">
          <b-form-input
            variant="dark"
            type="range"
            min="0"
            :max="slideMax"
            :value="currentStep"
            @change="onChange"
            @input="onInput"
          />
          <b-input-group-append>
            <b-btn size="sm" variant="dark">{{ currentStep }} </b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-button-group>
    </div>

    <!-- <div class="uniq-bottom-left">
      <uniq-congestion-color-bar/>
    </div> -->

    <!-- TOP LEFT PANEL -->
    <!-- -------------- -->
    <div class="uniq-top-left">
      <div class="bg-gray-700 rounded-xl p-2">
        <span class="mx-2 text-white">{{ simulationId }}</span>

        <div>
          <uniq-map-changer :map="map"/>
          <b-btn @click="centerTo(1)" class="ml-1" size="sm" variant="secondary">
            <b-icon icon="dice1"></b-icon>
          </b-btn>
          <b-btn @click="sidebar = !sidebar" size="sm" variant="secondary">
            VDS
          </b-btn>
          <b-btn @click="sidebarRse = !sidebarRse" size="sm" variant="secondary">
            RSE
          </b-btn>
        </div>
        <div class="grid grid-cols-2 mt-1 space-x-1 text-xs rounded">
          <div class="bg-yellow-100 text-center p-1 font-bold mb-1 space-y-1 rounded">
            <div>시뮬레이션</div>
            <div>
              <button
                class="bg-yellow-200 rounded px-2 py-1 font-bold hover:bg-yellow-300"
                @click.stop="startSimulation()"
              >
                시작<b-icon icon="caret-right-fill"/>
              </button>
              <button
                class="bg-yellow-200 rounded px-2 py-1 font-bold hover:bg-yellow-300"
                @click="stop"
              >
                중지<b-icon icon="stop-fill"/>
              </button>
            </div>
          </div>
          <div class="bg-green-100 text-center p-1 font-bold mb-1 space-y-1 rounded">
            <div>Replay</div>
            <div>
              <button
                class="flex-1 bg-green-200 rounded px-2 py-1 font-bold hover:bg-green-300"
                @click.stop="startReplay"
              >
                시작<b-icon icon="caret-right-fill"/>
              </button>
              <button
                class="flex-1 bg-green-200 rounded px-2 py-1 font-bold hover:bg-green-300"
                @click="stopReplay"
              >
                중지<b-icon icon="stop-fill"/>
              </button>
'          </div>
          </div>
        </div>
      </div>
      <SimulationDetailsOnFinished
        v-if="simulation.status === 'finished'"
        :simulation="simulation"
        :simulationId="simulationId"
        :avgSpeed="avgSpeed"
        :chart="chart"
        :currentEdge="currentEdge"
        :edgeSpeed="edgeSpeed"

      >
      </SimulationDetailsOnFinished>
      <SimulationDetailsOnRunning
        v-if="simulation.status === 'running'"
        :simulation="simulation"
        :progress="progress"
        :wsStatus="wsStatus"
        :focusData="focusData"
        :simulationId="simulationId"
        :avgSpeed="avgSpeed"
        :avgSpeedView="avgSpeedView"
        :avgSpeedFocus="avgSpeedFocus"
        @connect-web-socket="connectWebSocket"
        @toggle-focus-tool="toggleFocusTool"
        :logs="logs"
      >
      </SimulationDetailsOnRunning>
    </div>

    <div class="uniq-top-left2">
      <div class="bg-gray-700 rounded-xl p-2">
        <div v-for="link of chart.links" :key="link.linkId">
          <div class="flex items-center">
          <d3-speed-bar :value="link.speeds"></d3-speed-bar>
          <div class="text-white w-32 text-xs ml-1 mr-1 px-1 py-1 ">{{ link.linkId }}</div>
          <button
            class="text-yellow-400 hover:text-white"
            @click="removeLinkChart(link.linkId)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentEdge"class="p-1 space-y-1 uniq-top-right rounded-xl bg-gray-500" >
      <div v-if="currentEdge">
        <div class="rounded-xl text-white text-center">
          <h5>
            <b-badge>{{ currentEdge.LINK_ID }}</b-badge>
            <b-badge>{{ currentEdge.vdsId }}</b-badge>
          </h5>
        </div>
        <div class="bg-gray-800 p-2 rounded-xl mt-1" >
          <div class="text-white text-sm text-center">SPEED</div>
          <line-chart :chartData="chart.linkSpeeds" :options="defaultOption()" :height="150"/>
        </div>
        <div class="bg-gray-800 p-2 rounded-xl mt-1" >
          <div class="text-white text-sm text-center">VOLUME</div>
          <line-chart :chartData="chart.linkVehPassed" :options="defaultOption()" :height="150"/>
        </div>
        <!-- <div class="bg-gray-800 p-2 rounded-xl mt-1" >
        <line-chart :chartData="chart.linkWaitingTime" :options="defaultOption()" :height="150"/>
        </div> -->

          <!-- <div class="bg-gray-800 p-2 rounded-xl mt-1" >
          <d3-heatmap :value="chart.linkSpeeds"></d3-heatmap>
        </div> -->

      </div>
      <div v-else>
        <!-- <div class="bg-gray-800 p-2 rounded-xl text-white text-center">링크를 선택하세요.</div> -->
      </div>
    </div>

     <div
        :ref="mapId"
        :id="mapId"
        :style="{height: mapHeight + 'px'}"
      />
      <b-sidebar
        title="UNIQ-VIS"
        v-model="sidebar"
        bg-variant="dark"
        text-variant="white"
        right
      >
        <uniq-simulation-result-ext :simulation="simulation" />

          <!-- <div class="bg-gray-800 p-2 rounded-xl mt-1" >
            <d3-speed-bar :value="chart.linkSpeeds"></d3-speed-bar>
          </div> -->

        <div
          v-for="(entry, idx) of Object.entries(vdsList)"
          :key="idx"
          class="bg-gray-400 rounded m-1 px-2"
        >
          <b-badge class="cursor-pointer" @click="goToLink(entry[0])">{{ entry[0] }}</b-badge> {{ entry[1].vdsId }} {{ entry[1].sectionId }}
        </div>
      </b-sidebar>

      <b-sidebar
        title="UNIQ-VIS"
        v-model="sidebarRse"
        bg-variant="dark"
        text-variant="white"
        right
      >
        <div
          v-for="(entry, idx) of Object.entries(rseList)"
          :key="idx"
          class="bg-gray-400 rounded m-1 px-2"
        >
          <b-badge class="cursor-pointer"
            @click="goToRse(entry[0])">{{ entry[0] }}</b-badge>
        </div>
      </b-sidebar>

  </div>
</template>

<script src="./simulation-result-map.js"> </script>


<style>
  .uniq-box-panel {
    min-height:220px;
    max-height: 500px;
    min-width: 860px;
    border-radius: 0px;
  }

  .map {
    /* max-height: 1024px; */
    /* max-height: calc(100%); */
  }

  .uniq-top-menu {
    position: fixed;
    z-index:100;
    top: 50px;
    padding: 0;
    left: 5px;
    border: 0px solid #73AD21;
  }

  .uniq-top-left {
    position: fixed;
    top: 55px;
    max-width: 300px;
    overflow: auto;
    height: 100%;
    z-index:100;
    padding: 0;
    left: 5px;
    /* max-height: 490px; */
  }

  .uniq-bottom-left {
    position: fixed;
    bottom: 10px;

    padding: 0;
    left: 5px;
    z-index:100;
  }

  .uniq-top-left2 {
   position: fixed;
    top: 55px;
    max-width: 300px;
    z-index:100;
    padding: 0;
    left: 310px;
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

  .uniq-bottom {
    position: fixed;
    bottom: 10px;
    padding: 0;
    left: 5px;
    z-index:100;
  }


  .uniq-top-right {
    width: 300px;
    /* height: 100%; */
    /* height: 520px; */
    position: fixed;
    padding: 0;
    top: 180px;
    right: 5px;
    z-index:100;
  }
  /* @import '@/assets/images/gb1.jpg'; */
  /* @import '@/assets/styles/style.css'; */
</style>
