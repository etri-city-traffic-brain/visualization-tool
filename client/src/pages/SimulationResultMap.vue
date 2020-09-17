<template>
  <div>
    <div class="top">
      <div >
      <b-button-group v-if="simulation.status === 'finished'">
        <b-button v-b-toggle.sidebar-1 size="sm" variant="dark">
          <b-icon icon="align-end"/>
        </b-button>
        <b-button v-b-modal.modal-xl variant="secondary" size="sm" class="ml-1">
          <b-icon icon="bar-chart"/>
        </b-button>
        <b-button @click="center(1)" class="ml-1" size="sm">
          도안동
        </b-button>

        <!-- <v-switch v-model="running" class="ma-2" label="Disabled"></v-switch> -->
        <!-- <b-button size="sm" variant="danger" class="ml-1">막힘(~15km)</b-button> -->
        <!-- <b-button size="sm" variant="warning">정체(16~30km)</b-button> -->
        <!-- <b-button size="sm" variant="success">워활(31km~)</b-button> -->
        <!-- <b-form-checkbox v-model="running" name="check-button" switch size="lg"> simulator: {{ running }} </b-form-checkbox> -->
      </b-button-group>
      <h5 class="ml-2">
        <b-badge
          v-for="(value, id) in congestionColor.domain()"
          v-bind:key="id"
          :style="{'background-color': congestionColor(value), 'border': 0}"
        >
          {{ value }}
        </b-badge>
      </h5>
      </div>
    </div>

    <b-sidebar id="sidebar-1" :title="simulation.id" shadow class="pt-3">
      <div class="px-1 py-0">
        <b-card
          style="max-width: 20rem;"
          class="mt-0 mb-2 p-2"
        >
          <h4>
            <b-badge
              v-for="(value, id) in congestionColor.domain()"
              v-bind:key="id"
              :style="{'background-color': congestionColor(value), 'border': 0}"
              >
              {{ value }}
            </b-badge>
          </h4>
          <h5>
            <b-badge variant="primary"> {{ simulation.configuration.region }} </b-badge>
            <b-badge variant="primary"> {{ simulation.configuration.period / 60}}분 주기 </b-badge>
          </h5>
          <span>
            {{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} ~
            {{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }}
          </span>
        </b-card>

        <b-card
          sub-title="속도 분포"
          style="max-width: 20rem;"
          class="mt-2 mb-2 p-2"
        >
          <histogram-chart :chartData="chart.histogramData" :height="120"/>
        </b-card>
        <b-card
          sub-title="스텝별 속도 분포"
          style="max-width: 20rem;"
          class="mt-2 mb-2 p-2"
        >
          <histogram-chart class="bar" :chartData="chart.histogramDataStep" :height="120" />
        </b-card>
        <b-card
          sub-title="혼잡도 분포"
          style="max-width: 20rem;"
          class="mt-2 mb-2 p-2"
        >
          <doughnut :chartData="chart.pieData" style="height:120px;width:100%" />
        </b-card>
        <b-card
          sub-title="스텝별 혼잡도 분포"
          style="max-width: 20rem;"
          class="mt-2 mb-2 p-2"
        >
          <doughnut :chartData="chart.pieDataStep" style="height:120px;width:100%" />
        </b-card>
      </div>
    </b-sidebar>

    <div class="control-panel" >
      <div v-if="simulation.status === 'finished'" class="mt-2 mb-2 p-2" >
        <b-form-input
          type="range"
          min="0"
          :max="slideMax"
          :value="currentStep"
          @change="onChange"
          @input="onInput"
        />
        <b-button-group>
          <b-button size="sm" @click="togglePlay" :pressed.sync="playBtnToggle"> {{ toggleState() }} </b-button>
          <b-button size="sm" @click="stepBackward"> <b-icon icon="caret-left-fill"/> </b-button>
          <b-button size="sm" @click="stepForward"> <b-icon icon="caret-right-fill"/> </b-button>
          <b-button>{{ currentStep }}</b-button>
        </b-button-group>
      </div>

      <div v-if="simulation.status === 'running'">
         <b-button  size="sm" variant="dark" class="ml-1">
          <b-icon icon="caret-right-fill"/>
        </b-button>
        <b-button  size="sm" variant="dark" class="ml-1">
          <b-icon name="stop"/>
        </b-button>
      </div>
    </div>

    <!-- MAP CONTAINER //-->
    <div class="map"
      :ref="mapId"
      :id="mapId"
      :style="{height: mapHeight + 'px'}"
    />

    <b-card
      class="p-2 m-2 bottom"
      style="min-height:150px; max-height: 300px; min-width: 840px"
      v-if="simulation.status === 'finished'"
      :sub-title="simulationId"
    >
      <h5>
        <b-badge> {{ simulation.configuration.period / 60}}분 주기 </b-badge>
        <b-badge> {{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} </b-badge> ~
        <b-badge> {{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }} </b-badge>
        <b-badge> {{ currentEdge.id || 'NO LINK' }} </b-badge>
        <b-badge variant="light" :style="{'background-color': congestionColor(edgeSpeed())}" > {{ edgeSpeed().toFixed(2) }} km </b-badge>
      </h5>
      <line-chart :chartData="chart.linkSpeeds" :height="50"/>
    </b-card>

    <b-card
      v-if="simulation.status === 'running'"
      class="p-2 m-2 bottom"
      style="min-height:200px"
      :sub-title="simulationId"
    >
      <b-card-text>실시간 시뮬레이션 상태 혹은 통계를 보여줌</b-card-text>
    </b-card>

    <div class="loading" v-if="showLoading">
      <h1> <b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon></h1>
    </div>

    <b-modal id="modal-xl" size="xl" ok-only :title="simulationId">
      <simulation-result :simulationId="simulationId"/>
    </b-modal>

  </div>
</template>

<script src="./simulation-result-map.js"> </script>

<style>
  .map {
    width: 100%;
  }

  .control-panel {
    z-index: 999;
    position: fixed;
    right: 10px;
    padding: 2px;
    border-radius: 10px;
    background-color: white;
    border: 3px solid gray;
    width: 200px;

    top: 60px;
    right: 60px;

  }

  .control-panel > div {
    border-radius: 5px;
  }

  .top {
    position: fixed;
    z-index:100;
    top: 55px;
    padding: 0;
    left: 8px;
    width: 90%;
    border: 0px solid #73AD21;
  }

  .loading {
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top: -50px;
    margin-left: -100px;
  }

  .bottom {
    position: fixed;
    z-index:100;
    bottom: 0px;
    padding: 0;
    width: 99%;
    opacity: 0.9;
    max-height: 400px;
  }

  .right {
    text-align: right;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .slide-fade-enter-active {
    transition: all .3s ease;
  }

  .slide-fade-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }

  .slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */ {
    transform: translateX(-100px);
    opacity: 0;
  }


  /* custom scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: blue gray;
  }
  *::-webkit-scrollbar {
    width: 12px;
  }
  *::-webkit-scrollbar-track {
    background: gray;
  }
  *::-webkit-scrollbar-thumb {
    background-color:skyblue;
    border-radius: 20px;
    border: 2px solid gray;
  }


</style>
