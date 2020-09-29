<template>
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
          <b-button @click="center(1)" class="ml-1" size="sm" variant="dark">
            도안동
          </b-button>
        </b-button-group>
        <uniq-congestion-color-bar/>

        <uniq-map-changer :map="map" />
      </div>
    </div>

    <b-sidebar
      title="Properties"
      v-model="sidebar"
      bg-variant="dark"
      text-variant="white"
      shadow
    >
      <uniq-simulation-result-ext :simulation="simulation" />
    </b-sidebar>

    <!-- MAP CONTAINER -->
    <b-card
      bg-variant="dark"
      border-variant="dark"
      class="mt-0 p-1 uniq-box-panel map"
      no-body
      >
      <div
        :ref="mapId"
        :id="mapId"
        :style="{height: mapHeight + 'px'}"
      />
      <!-- CONTROL PANEL -->
      <div class="uniq-step-player">
        <b-card bg-variant="secondary" text-variant="light" no-body v-if="simulation.status === 'finished'" >
          <b-input-group size="sm">
            <b-button-group>
              <b-button size="sm" variant="dark" @click="togglePlay" :pressed.sync="playBtnToggle"> {{ toggleState() }} </b-button>
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
      <div class="loading-container" v-if="showLoading">
        <div class="loading-vertical-center">
          <b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon>
        </div>
      </div>
    </b-card>


    <!-- BOTTOM CONTAINER -->
    <b-card
      class="uniq-box-panel mt-0"
      bg-variant="dark"
      border-variant="dark"
      no-body
      style="height:400px;overflow:auto"
      v-if="simulation.status === 'finished'"
    >
      <!-- <div class="px-1 py-0" > -->
      <b-card
        bg-variant="dark"
        text-variant="light"
        border-variant="dark"
        v-if="simulation.status === 'finished'"
        :sub-title="simulationId"
        no-body
        class="p-1"
        style="border-radius: 0px;"
      >
        <h5>
          <b-badge variant="dark"> {{ simulation.configuration.period / 60}}분 주기 </b-badge>
          <b-badge variant="dark"> {{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} </b-badge> ~
          <b-badge variant="dark"> {{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }} </b-badge>
          <b-badge variant="dark"> {{ currentEdge.id || 'NO LINK' }} </b-badge>
          <b-badge variant="light" :style="{'background-color': congestionColor(edgeSpeed())}" > {{ edgeSpeed().toFixed(2) }} km </b-badge>
        </h5>
        <b-card>
          <line-chart :chartData="chart.linkSpeeds" :height="50"/>
        </b-card>
      </b-card>

      <b-card-group deck class="m-0">
        <b-card
          bg-variant="secondary"
          text-variant="light"
          border-variant="secondary"
          no-body
          class="p-1 m-0"
        >
          <h5><b-badge variant="dark">속도분포</b-badge></h5>
          <b-card no-body class="m-0 pt-3">
            <histogram-chart :chartData="chart.histogramData" :height="135" class="mt-1"/>
          </b-card>
        </b-card>

        <b-card
          bg-variant="secondary"
          text-variant="light"
          border-variant="secondary"
          sub-title="스텝별 속도 분포"
          no-body
          class="p-1 m-0"
        >
          <h5><b-badge variant="dark">스텝별 속도 분포</b-badge></h5>
          <b-card no-body class="m-0 pt-3">
            <histogram-chart class="mt-1" :chartData="chart.histogramDataStep" :height="135"/>
          </b-card>
        </b-card>
        <b-card
          bg-variant="secondary"
          text-variant="light"
          border-variant="secondary"
          sub-title="혼잡도 분포"
          no-body
          class="p-1 m-0"
        >
          <h5><b-badge variant="dark">혼잡도 분포</b-badge></h5>
          <b-card no-body class="m-0 pt-2">
            <doughnut :chartData="chart.pieData" :height="130" />
          </b-card>
        </b-card>
        <b-card
          bg-variant="secondary"
          text-variant="light"
          border-variant="secondary"
          sub-title="스텝별 혼잡도 분포"
          no-body
          class="p-1 m-0"
        >
          <h5><b-badge variant="dark">스텝별 혼잡도 분포</b-badge></h5>
          <b-card no-body class="m-0 pt-2">
            <doughnut :chartData="chart.pieDataStep" :height="130"/>
          </b-card>
        </b-card>
      </b-card-group>
     </b-card>

    <b-card
      text-variant="light"
      bg-variant="dark"
      border-variant="dark"
      v-if="simulation.status === 'running'"
      class="p-0 m-0"
      style="height:400px; border-radius: 0px;"
      :title="simulationId"
    >
      <!-- <b-card-text>실시간 시뮬레이션 상태 혹은 통계를 보여줌</b-card-text> -->
      <!-- {{ currentZoom }} -->
      <!-- <b-card-text>{{ currentExtent[0] }} {{ currentExtent[1] }} </b-card-text> -->
      <b-button  size="sm" class="ml-1">
        start simulation <b-icon icon="caret-right-fill"/>
      </b-button>
      <b-button  size="sm" class="ml-1">
        <b-icon icon="stop-fill"/>
      </b-button>
      <b-button  @click="connectWebSocket" size="sm" class="ml-1">
        connect ws <b-icon icon="plug"> </b-icon>
      </b-button>
      <b-button  size="sm" class="ml-1">
        simulation status:
        <b-icon v-if="simulation.status==='running'" icon="circle-fill" variant="success" animation="throb" font-scale="1"></b-icon>
        <b-icon v-else icon="circle-fill" variant="danger" animation="throb" font-scale="1"></b-icon>
      </b-button>
      <b-button  size="sm" class="ml-1">
        ws status:
        <b-icon v-if="wsStatus==='open'" icon="circle-fill" variant="success" animation="throb" font-scale="1"></b-icon>
        <b-icon v-if="wsStatus==='error'" icon="circle-fill" variant="danger" animation="throb" font-scale="1"></b-icon>
        <b-icon v-if="wsStatus==='close'" icon="slash-circle" variant="danger" font-scale="1"></b-icon>
      </b-button>
      <b-button  size="sm" variant="dark" class="ml-1"
      :style="{'background-color': congestionColor(avgSpeed), 'border': 0}"
      >
        average speed: {{avgSpeed}}km
      </b-button>
    </b-card>

    <b-modal id="modal-xl" size="xl" ok-only :title="simulationId">
      <simulation-result :simulationId="simulationId"/>
    </b-modal>

  </b-container>
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
    max-height: 800px;
  }

  .uniq-step-player {
    z-index: 999;
    position: absolute;
    width: 300px;
    /* top: 65px; */
    bottom: 10px;
    right: 10px;
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

</style>
