<template>
<div>
<b-container v-if="!simulation">
  <h1>We're sorry!!</h1>
</b-container>
<b-container fluid class="m-0 p-0" v-if="simulation">
  <div class="uniq-top-menu-right">
    <div>
      <b-btn @click="updateChart" size="sm" variant="dark">
        <b-icon icon="bar-chart-fill"/>
      </b-btn>
      <b-btn @click="sidebar = !sidebar" size="sm" variant="dark">
        <b-icon icon="align-start"/>
      </b-btn>
    </div>
  </div>
  <b-sidebar
    title="UNIQ-VIS"
    v-model="sidebar"
    bg-variant="dark"
    text-variant="white"
    shadow
    right
  >
    <pre class="text-light">{{ JSON.stringify(simulation, false, 2)}}</pre>
  </b-sidebar>

  <b-row class="p-0 m-0">
    <b-col cols="4" class="p-0">
      <b-card
        bg-variant="secondary"
        border-variant="secondary"
        class="no-border-radius p-0 m-0"
        no-body
        text-variant="white"
        >
          <div class="card-top" style="width:100%">
            <b-progress height="1rem" v-if="progress1 > 0" class="mt-0 w-100 no-border-radius" >
              <b-progress-bar :value="progress1" animated striped variant="primary">
                <span> {{ progress1 }} %</span>
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="card-bottom" style="overflow:auto">
            <b-card text-variant="light" bg-variant="dark" class="mt-1" no-body>
              <b-card-text class="m-0 p-2 text-center">
                신호비교
              </b-card-text>
              <bar-chart
                :chartData="phaseFixed"
                :options="barChartOption()"
                :height="120"
              />
            </b-card>
            <b-card text-variant="light" bg-variant="dark" class="mt-1" no-body>
              <div class="text-center">속도분포</div>
              <histogram-chart
                :chartData="chart1.histogramData"
                :height="120"
              />
            </b-card>
            <b-card
              class="mt-1 p-2"
              bg-variant="dark"
              no-body
            >
              <div class="text-center">속도분포(스텝)</div>
              <histogram-chart
                :chartData="chart1.histogramDataStep"
                :height="120"
              />
          </b-card>
          </div>
          <div
            class="m-0 p-0"
            :ref="mapIds[0]"
            :id="mapIds[0]"
            :style="{height: mapHeight + 'px'}"
          />
      </b-card>
    </b-col>
    <!-- RIGHT PANEL -->
    <b-col cols="4" class="p-0">
      <b-card
        bg-variant="primary"
        border-variant="primary"
        class="no-border-radius p-0 m-0"
        text-variant="white"
        no-body
      >
        <div class="card-top" style="width:100%">
          <b-progress height="1rem" v-if="progress2 > 0" class="mt-0 w-100 no-border-radius" >
              <b-progress-bar :value="progress2" animated striped variant="primary">
                <span> {{ progress2 }} %</span>
              </b-progress-bar>
            </b-progress>
        </div>
        <div class="card-bottom"  style="overflow:auto">
          <b-card text-variant="light" bg-variant="dark" class="mt-1" no-body>
            <b-card-text class="m-0 p-2 text-center">
              신호비교
            </b-card-text>
            <bar-chart
              :chartData="phaseTest"
              :options="barChartOption()"
              :height="120"
            />
          </b-card>
            <!-- <div class="text-center">속도분포</div> -->
          <b-card text-variant="light" bg-variant="dark" class="mt-1" no-body>
            <div class="text-center">속도분포</div>
            <histogram-chart
              :chartData="chart2.histogramData"
              :height="120"
            />
          </b-card>
          <b-card
            class="mt-1 p-2"
            bg-variant="dark"
            no-body
          >
            <div class="text-center">속도분포(스텝)</div>
            <histogram-chart :chartData="chart2.histogramDataStep" :height="120" class="mt-1"/>
          </b-card>
        </div>
        <div
          class="m-0 p-0"
          :ref="mapIds[1]"
          :id="mapIds[1]"
          :style="{height: mapHeight + 'px'}"
        />
      </b-card>
      <transition name="bounce">
        <div v-if="showEpoch" class="d-flex justify-content-center align-items-center ccc">
          <div style="font-size: 20rem">
            {{ selectedEpoch }}
          </div>
        </div>
      </transition>
    </b-col>
    <b-col cols="4" class="p-0" >
      <b-card
        bg-variant="dark"
        border-variant="dark"
        text-variant="light"
        style="border-radius:0"
        class="m-0 p-0"
        no-body
        >
        <b-card-text class="text-center p-2 m-0">
        {{ simulation.id }}
        </b-card-text>
      </b-card>
      <b-card
        bg-variant="secondary"
        border-variant="dark"
        text-variant="dark"
        no-body
        v-bind:style="{
          height: mapHeight - 40 + 'px',
          borderRadius: 0,
          overflow: 'auto'
        }"
      >
        <b-card-body class="p-1">
          <!----- 보상 그래프 ----->
          <b-card
            text-variant="light"
            bg-variant="dark"
            border-variant="dark"
            class="mt-1 p-2"
            no-body
          >
            <line-chart
              :chartData="rewards"
              :options="lineChartOption({}, chartClicked)"
              :height="180"
            />

            <b-btn variant="secondary" @click.prevent="runTest" size="sm">
              <span>신호최적화 비교 {{ selectedEpoch }}</span>
              <b-icon icon="play-fill"/>
            </b-btn>
          </b-card>
                      <b-card class="mt-1" bg-variant="dark" border-variant="dark" text-variant="light">
            <b-card-text class="m-0 p-0 text-center">
                <small>평균속도(실시간) </small>
                <b-icon icon="three-dots" animation="cylon" font-scale="1"></b-icon>
              </b-card-text>
            <line-chart
              :chartData="chart.currentSpeedChart"
              :options="lineChartOption({})"
              :height="120"
            />
          </b-card>
          <b-card class="mt-1" bg-variant="dark" text-variant="light">
              <!-- <uniq-card-title title="평균속도 비교"/> -->
              <b-card-text class="m-0 p-0 text-center">
                <small>평균속도(전체) </small>
              </b-card-text>

              <line-chart
                :chartData="chart1.linkSpeeds"
                :options="lineChartOption({})"
                :height="120"
              />
          </b-card>

            <b-card
              class="mt-1"
              bg-variant="dark"
              border-variant="dark"
              text-variant="light"
            >
              <b-card-text class="m-0 p-0 text-center">
                <small>평균속도(뷰영역) </small>
              </b-card-text>
            <line-chart :chartData="chart.currentSpeedInViewChart" :options="lineChartOption({})" :height="120"/>
          </b-card>

            <b-card
              class="mt-1"
              bg-variant="dark"
              border-variant="dark"
              text-variant="light"
            >
              <b-card-text class="m-0 p-0 text-center">
                <small>선택 교차로 </small>
              </b-card-text>
              <line-chart
                :chartData="chart.junctionSpeeds"
                :options="lineChartOption({})"
                :height="120"/>
          </b-card>



          <!-- --------------- -->
          <!-- Step Controller -->
          <!-- --------------- -->
          <b-card
            bg-variant="secondary"
            class="mt-1"
            v-bind:style="playerStyle"
            text-variant="light" no-body
          >
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
          <b-card
            class="mt-1 p-1"
            bg-variant="dark"
            text-variant="light"
            no-body
          >
            <div>
              <b-btn
                size="sm"
                v-for="reward of rewards.labels"
                :key="reward"
                class="ml-1"
                @click="selectedEpoch = reward"
              >
                {{ reward }}
              </b-btn>
            </div>
          </b-card>
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
</b-container>
</div>
</template>

<script src="./optimization-result-comparison-map.js"> </script>

<style>
  .ccc {
    position: absolute;
    z-index:100;
    top: 0;
    left: 0;
    /* border: 1px solid; */
    /* background-color: ; */
    width: 100%;
    /* LKheight: 100%; */
  }

  .no-border-radius {
    border-radius: 0;
  }
  .card-top {
    position: absolute;
    top: 0;
    left: 0;
    font-weight: bold;
    z-index:100;
  }
  .card-bottom {
    position: absolute;
    background-color: black;
    opacity: 0.8;
    bottom: 0px;
    left: 0px;
    font-weight: bold;
    z-index: 100;
    width: 100%;
    height: 400px;
  }

  .uniq-top-menu {
    position: fixed;
    z-index:100;
    top: 60px;
    padding: 0;
    left: 15px;
    border: 0px solid #73AD21;
  }
  .uniq-top-menu-right {
    position: fixed;
    z-index: 100;
    top: 53px;
    padding: 0;
    right: 15px;
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


  .bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

  /* @import '@/assets/images/gb1.jpg'; */
  @import '@/assets/styles/style.css';
</style>
