<template>
  <div>
    <b-container fluid class="m-0 p-0">
      <div class="uniq-top-menu">
        <div>
          <b-button @click="sidebar = !sidebar" size="sm" variant="dark">
            <b-icon icon="align-end"/>
          </b-button>
          <b-button-group v-if="simulation.status === 'finished'">
            <b-button v-b-modal.modal-xl variant="secondary" size="sm">
              <b-icon icon="bar-chart"/>
            </b-button>
          </b-button-group>
          <uniq-congestion-color-bar/>
          <b-button @click="centerTo(1)" class="ml-1" size="sm" variant="dark"> 실증지역 </b-button>
          <!-- <b-button @click="centerTo(2)" class="ml-1" size="sm" variant="dark"> 세종(시청) </b-button> -->
          <uniq-map-changer :map="map" />

          <b-button @click="stop" class="ml-1" size="sm" variant="dark"> 중지 </b-button>
        </div>

        <b-card bg-variant="secondary" class="mt-1" v-bind:style="playerStyle" text-variant="light" no-body v-if="simulation.status === 'finished'" >
          <b-input-group size="sm">
            <b-button-group>
              <b-button size="sm" variant="dark" @click="togglePlay" > {{ toggleState() }} </b-button>
              <b-button size="sm" variant="dark" @click="stepBackward" class="ml-1"> <b-icon icon="caret-left-fill"/> </b-button>
              <b-button size="sm" variant="dark" @click="stepForward" > <b-icon icon="caret-right-fill"/> </b-button>
            </b-button-group>
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
              <b-button size="sm" variant="dark">{{ currentStep }} </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-card>
      </div>

      <b-sidebar
        title="UNIQ-VIS"
        v-model="sidebar"
        bg-variant="dark"
        text-variant="white"
      >
        <uniq-simulation-result-ext :simulation="simulation" />
      </b-sidebar>

      <b-row class="p-0 m-0">
        <b-col cols="6" sm="6" md="6"  lg="6" class="p-0">
          <b-card
            bg-variant="dark"
            border-variant="dark"
            class="uniq-box-panel map"
            no-body
            >
            <div
              :ref="mapId"
              :id="mapId"
              :style="{height: mapHeight + 'px'}"
            />
            <div class="loading-container" v-if="showLoading">
              <div class="loading-vertical-center">
                <b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon>
              </div>
            </div>
          </b-card>
        </b-col>
        <b-col cols="3" sm="6" md="6"  lg="3" class="p-0">
          <b-card
            text-variant="light"
            bg-variant="dark"
            border-variant="dark"
            no-body

            :style="{
              height: mapHeight + 'px',
              borderRadius: 0,
              overflow: 'auto'
            }"
          >
            <b-card-body class="p-2">
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
            </b-card-body>
          </b-card>
        </b-col>
        <b-col cols="3" sm="0" md="0"  lg="3" class="p-0">
          <b-card
            no-body
            bg-variant="dark"
             :style="{
              height: mapHeight + 'px',
              borderRadius: 0,
              overflow: 'auto'
            }"
          >
          <uniq-simulation-result-ext :simulation="simulation" />
          </b-card>
        </b-col>
      </b-row>
    </b-container>
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
    max-height: calc(100%);
  }

  .uniq-top-menu {
    position: fixed;
    z-index:100;
    top: 60px;
    padding: 0;
    left: 15px;
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

  * {
    scrollbar-width: thin;
    scrollbar-color: #f8f9fa #343a40;
  }
  *::-webkit-scrollbar {
    width: 12px;
  }
  *::-webkit-scrollbar-track {
    background: #343a40;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #f8f9fa;
    border-radius: 20px;
    border: 3px solid #343a40;
  }

  /* @import '@/assets/images/gb1.jpg'; */
  @import '@/assets/styles/style.css';
</style>
