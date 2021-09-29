<template>
  <div class="bg-gray-500">
    <div v-if="!simulation" class="w-80 mx-auto text-center">
      <div class="font-bold text-lg">We're sorry!!</div>
      <div class="font-bold text-sm">시뮬레이션 정보를 읽어오는데 실패하였습니다.</div>
    </div>
    <div v-else>
      <!-- RIGHT PANEL -->
      <div class="grid grid-cols-4 gap-0 p-1">
        <div class="col-span-3">
          <div class="flex">
            <div class="flex-1">
              <div class="text-center text-sm font-bold text-white w-36 pt-1 bg-gray-800 rounded-t-2xl">
                기존신호
              </div>
              <div
                class="border-4 border-gray-800"
                :ref="mapIds[0]"
                :id="mapIds[0]"
                :style="{height: '600px'}"
              />
              <b-progress height="1rem" v-if="progress1 >= 0" class="no-border-radius" >
                <b-progress-bar :value="progress1" animated striped variant="primary">
                  <span> {{ progress1 }} %</span>
                </b-progress-bar>
              </b-progress>
            </div>
            <div class="flex-1">
              <div class="text-center text-sm text-black font-bold pt-1 w-36 bg-yellow-500 rounded-t-2xl">최적신호</div>
              <div
                class="border-4 border-yellow-500"
                :ref="mapIds[1]"
                :id="mapIds[1]"
                :style="{height: '600px'}"
              />
              <b-progress height="1rem" v-if="progress2 >= 0" class="no-border-radius"  >
                <b-progress-bar :value="progress2" animated striped variant="primary">
                  <span> {{ progress2 }} %</span>
                </b-progress-bar>
              </b-progress>
            </div>
          </div>
          <div>
          <div class="mt-1">
            <!-- <div class="pr-2">
              <div class="bg-gray-300 w-max px-2 mx-auto rounded font-bold">{{ selectedNode }}</div>
            </div> -->
            <div class="">
            <div class="flex justify-between pr-3 items-center text-sm text-white text-center- font-bold pl-3 py-1 bg-gray-700 rounded-t-xl">
              기존신호 <span class="bg-indigo-100 rounded text-black text-xs px-1">{{ selectedNode }}</span>
            </div>
            <div class="">
              <div style="height:120px;" ref="phase-reward-ft"></div>
            </div>
          </div>
          <div class="mt-1">
            <div class="pr-3 flex justify-between  items-center text-sm text-black text-center- font-bold pl-3 py-1 bg-yellow-500 rounded-t-xl">
              최적신호 <span class="bg-yellow-200 rounded text-black text-xs px-1">{{ selectedNode }}</span>
            </div>
            <div class="">
              <div style="height:120px;" ref="phase-reward-rl"></div>
            </div>
          </div>
          </div>
          </div>
          <!-- </div> -->
        </div>
        <div class="ml-1">
          <div class="bg-gray-700 w-max px-3 rounded-t-lg font-bold text-white">정보</div>
          <div class="space-between text-white text-sm p-1 bg-gray-700">
            <div class="text-center">{{ simulation.id }} </div>
            <div class="border-gray-600">
            <pre class="p-1 text-light h-48">{{ JSON.stringify(simulation.configuration, false, 2)}}</pre>
          </div>
            <div class="">
              <div>

                <!-- <b-btn @click="updateChart" size="sm" variant="dark">
                  <b-icon icon="bar-chart-fill"/>
                </b-btn>
                <b-btn @click="sidebar = !sidebar" size="sm" variant="dark">
                  <b-icon icon="align-start"/>
                </b-btn> -->
              </div>
            </div>
          </div>

          <div class="mt-1 mb-1">
            <div v-if="status === 'running'" class="animate-pulse bg-indigo-200 text-center px-2 uppercase">
              {{ status }}
              <b-btn variant="dark" size="sm" @click="checkStatus">상태확인</b-btn>
            </div>
            <div v-else class="bg-indigo-200 text-center px-2 uppercase">
              {{ status }}
              <b-btn variant="dark" size="sm" @click="checkStatus">상태확인</b-btn>
            </div>
          </div>
          <div
              v-bind:style="{
                height: mapHeight - 40 + 'px',
                borderRadius: 0,
                overflow: 'auto'
              }"
            >
              <div class="">
                <!----- 보상 그래프 ----->
                <div class="pt-1 text-center text-sm text-white w-24 bg-gray-700 rounded-t-lg">보상그래프</div>
                <div class="p-2 bg-gray-700" >
                  <line-chart
                    :chartData="rewards"
                    :options="lineChartOption({}, chartClicked)"
                    :height="180"
                  />

                  <b-btn variant="secondary" @click.prevent="runTest" size="sm">
                    <span>신호최적화 비교 {{ selectedEpoch }}</span>
                    <b-icon icon="play-fill"/>
                  </b-btn>
                </div>
                <div class="mt-1">
                  <div class="m-0 p-0 text-center text-white w-24 bg-gray-700 rounded-t-lg">
                    <small>평균속도 </small>
                    <!-- <b-icon icon="three-dots" animation="cylon" font-scale="1"></b-icon> -->
                  </div>
                  <div class="bg-gray-700">
                    <line-chart
                      :chartData="chart.currentSpeedChart"
                      :options="lineChartOption({})"
                      :height="120"
                    />
                  </div>
                </div>
                <!--
                <div class="mt-1" bg-variant="dark" text-variant="light">
                  <div class="pt-1 text-center text-sm text-white w-36 bg-gray-700 rounded-t-2xl">
                    평균속도(전체)
                  </div>
                  <div class="bg-gray-700">
                    <line-chart
                      :chartData="chart1.linkSpeeds"
                      :options="lineChartOption({})"
                      :height="120"
                    />
                  </div>
                </div>
                 -->
                <!--
                <div class="mt-1" >
                  <div class="pt-1 text-center text-sm text-white w-36 bg-gray-700 rounded-t-2xl">
                      평균속도(뷰영역)
                  </div>
                  <div class="bg-gray-700">
                    <line-chart :chartData="chart.currentSpeedInViewChart" :options="lineChartOption({})" :height="120"/>
                  </div>
                </div> -->
                <!--
                <div class="mt-1" >
                  <div class="pt-1 text-center text-sm text-white w-36 bg-gray-700 rounded-t-2xl">
                    선택 교차로
                  </div>
                  <div class="bg-gray-700">
                    <line-chart
                      :chartData="chart.junctionSpeeds"
                      :options="lineChartOption({})"
                      :height="120"
                    />
                  </div>
                </div> -->

                <b-card
                  class="mt-1 p-1"
                  bg-variant="dark"
                  text-variant="light"
                  no-body
                >
                  <div class="flex flex-wrap">
                    <div
                      v-for="reward of rewards.labels"
                      :key="reward"
                      class="ml-1 bg-indigo-500 text-xs rounded text-black px-1 cursor-pointer hover:bg-indigo-200"
                      @click="selectedEpoch = reward"
                    >
                      {{ reward }}
                    </div>
                  </div>
                </b-card>
              </div>
            </div>
        </div>
      </div>
      <!--
      <transition name="bounce">
        <div v-if="!showEpoch" class="" >
          <div style="font-size: 20rem">
            {{ selectedEpoch }}
          </div>
        </div>
      </transition>
      -->
    </div>
    <b-sidebar title="UNIQ-VIS" v-model="sidebar" bg-variant="dark" text-variant="white" shadow right >
      <pre class="text-light h-48">{{ JSON.stringify(simulation, false, 2)}}</pre>
      <div class="bg-gray-800 p-1 text-white text-center">
        기존신호
      <!-- <b-card text-variant="light" bg-variant="dark" class="mt-1" no-body> -->
        <!-- <b-card-text class="m-0 p-2 text-center">
          신호비교
        </b-card-text> -->
        <!-- <bar-chart
          :chartData="phaseFixed"
          :options="barChartOption()"
          :height="120"
        /> -->
      <!-- </b-card> -->
        <div>
          <div class="text-center text-sm">속도분포</div>
          <histogram-chart :chartData="chart1.histogramData" :height="120" />
        </div>
        <div>
          <div class="text-center  text-sm">속도분포(스텝)</div>
          <histogram-chart :chartData="chart1.histogramDataStep" :height="120" />
        </div>
      </div>
      <div class="bg-gray-800 p-1 text-white text-center">
        <!-- <b-card text-variant="light" bg-variant="dark" class="mt-1" no-body> -->
          <!-- <b-card-text class="m-0 p-2 text-center">
            신호비교
          </b-card-text> -->
          <!-- <bar-chart
            :chartData="phaseTest"
            :options="barChartOption()"
            :height="120"
          /> -->
        <!-- </b-card> -->
        <!-- <div class="text-center">속도분포</div> -->
        <div>
          <div class="text-center text-sm">속도분포(테스트)</div>
          <histogram-chart :chartData="chart2.histogramData" :height="120" />
        </div>
        <div>
          <div class="text-center text-sm">속도분포(스텝)(테스트)</div>
          <histogram-chart :chartData="chart2.histogramDataStep" :height="120" class="mt-1"/>
        </div>
      </div>
      <!-- Stepper -->
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
    </b-sidebar>
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
