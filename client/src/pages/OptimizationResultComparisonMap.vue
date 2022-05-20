<template>
  <div class="bg-gray-600 relative">

    <div class="fixed z-50 inset-auto h-full " v-if="showWaitingMsg">
      <div class="w-screen">
        <div class="animate-pulse mx-auto text-center mt-5 bg-yellow-300 p-5 text-xl font-bold">
          실행 준비 중입니다. 잠시후 실행 됩니다.
        </div>
      </div>
    </div>

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
              <div class="text-center text-sm font-bold text-white w-full pt-1 bg-gray-700 rounded-t-2xl ">
                <div class="tracking-wider">기존신호</div>
              </div>
              <div class="border-2 border-gray-700" >
                <div :ref="mapIds[0]" :id="mapIds[0]" :style="{height: '600px'}" />
                <b-progress height="1rem" v-if="progress1 > 0" class="no-border-radius">
                  <b-progress-bar :value="progress1" variant="secondary">
                    <span> {{ progress1 }} %</span>
                  </b-progress-bar>
                </b-progress>
              </div>
            </div>
            <div class="flex-1">
              <div class="text-center text-sm text-black font-bold pt-1 w-full bg-yellow-300 rounded-t-2xl">
                <div class="tracking-wider">최적신호</div>
              </div>
              <div class="border-2 border-yellow-400">
                <div :ref="mapIds[1]" :id="mapIds[1]" :style="{height: '600px'}" />
                <b-progress height="1rem" v-if="progress2 > 0" class="no-border-radius"  >
                  <b-progress-bar :value="progress2" variant="secondary">
                    <span> {{ progress2 }} %</span>
                  </b-progress-bar>
                </b-progress>
              </div>
            </div>
          </div>
          <div>
          <div class="mt-1">
            <!-- <div class="pr-2">
              <div class="bg-gray-300 w-max px-2 mx-auto rounded font-bold">{{ selectedNode }}</div>
            </div> -->
            <div class="">
            <div class="text-center text-white mt-1 mb-1 bg-gray-800 p-1 rounded-lg">
              {{ selectedNode }}
            </div>
            <div class="flex justify-between pr-3 items-center text-sm text-white text-center- font-bold pl-3 py-1 bg-gray-700 rounded-t-xl">
              기존신호
            </div>
            <div class="border-2 border-gray-800">
              <div style="height:160px;width:100%;" ref="phase-reward-ft"></div>
            </div>
          </div>
          <div class="mt-1">
            <div class="pr-3 flex justify-between items-center text-sm text-black font-bold pl-3 py-1 bg-yellow-400 rounded-t-lg">
              최적신호
            </div>
            <div class="border-2 border-yellow-400">
              <div style="height:160px;width:100%" ref="phase-reward-rl"></div>
            </div>
          </div>
          </div>
          </div>
          <!-- </div> -->
        </div>
        <div class="ml-1">
          <!-- <div class="bg-gray-700 w-max- px-3 py-1 rounded-t-lg font-bold text-white"></div> -->
          <div class="space-between text-white text-sm p-2 bg-gray-700 rounded-t-lg">
            <!-- <div class="text-center"> 최적화 정보 </div> -->
            <div class="border-gray-600 space-y-1">
            <!-- <pre class="p-1 text-light h-48">{{ JSON.stringify(simulation.configuration, false, 2)}}</pre> -->
              <div> <span class="w-24 inline-block text-center bg-blue-500 text-white rounded text-sm px-1 font-bold">ID</span> {{ simulation.id }} </div>
              <div> <span class="w-24 inline-block text-center bg-blue-500 text-white rounded text-sm px-1 font-bold">지역</span> {{ simulation.configuration.region }} </div>
              <div> <span class="w-24 inline-block text-center bg-blue-500 text-white rounded text-sm px-1 font-bold">시간</span> <span class="text-xs">{{ simulation.configuration.fromTime }}({{ simulation.configuration.begin }}) ~
              {{ simulation.configuration.toTime }}({{ simulation.configuration.end }})</span></div>
              <div> <span class="w-24 inline-block text-center bg-green-500 text-white rounded text-sm px-1 font-bold">주기</span> {{ simulation.configuration.period }} (초)</div>
              <div> <span class="w-24 inline-block text-center bg-green-500 text-white rounded text-sm px-1 font-bold">교차로</span> {{ simulation.configuration.junctionId }} </div>
              <div> <span class="w-24 inline-block text-center bg-green-500 text-white rounded text-sm px-1 font-bold">이미지</span> <span class="text-xs">{{ simulation.configuration.dockerImage }} </span></div>
              <div> <span class="w-24 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">스크립트</span> {{ simulation.configuration.script }} </div>
              <div> <span class="w-24 inline-block text-center bg-gray-500 text-white rounded text-sm px-1 font-bold">모델저장주기</span> {{ simulation.configuration.modelSavePeriod }} </div>
            </div>
            <div class="">
              <div>

                <!-- <b-btn @click="updateChart" size="sm" variant="dark">
                  <b-icon icon="bar-chart-fill"/>
                </b-btn> -->
                <!-- <b-btn @click="sidebar = !sidebar" size="sm" variant="dark">
                  <b-icon icon="align-start"/>
                </b-btn> -->
              </div>
            </div>
          </div>

          <div class="mt-1 mb-1 flex items-center justify-between bg-indigo-200">
            <div v-if="status === 'running'" class="animate-pulse bg-indigo-300 text-center px-3 uppercase w-full">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>

              <!-- <b-btn variant="dark" size="sm" @click="checkStatus">상태확인</b-btn> -->
            </div>
            <div v-else class="bg-indigo-300 text-center px-3 uppercase w-full">
              {{ status }}
            </div>
            <div class="flex-shrink-0">
              <button class="bg-gray-800 text-sm text-white px-2" @click="checkStatus">상태확인</button>
            </div>
          </div>
          <div class="">

            <!----- 보상 그래프 ----->
            <div class="pt-1 text-center text-sm text-white w-24 bg-gray-700 rounded-t-lg">보상그래프</div>
            <div class="p-2 bg-gray-700" >
              <line-chart
                :chartData="rewards"
                :options="lineChartOption({}, chartClicked)"
                :height="180"
              />
            </div>

            <div class="pt-1 text-center text-sm text-white w-24 bg-gray-700 rounded-t-lg mt-1">모델 선택</div>
            <div class="p-2 bg-gray-700 max-h-60 overflow-y-auto ">

              <div class="flex flex-wrap">
                <div
                  v-for="reward of rewards.labels.filter((v,i)=> (i % simulation.configuration.modelSavePeriod) == 0)"
                  :key="reward"
                  @click="selectedEpoch = reward"
                  class="ml-1 mb-1 bg-indigo-500 text-xs rounded text-white px-1 cursor-pointer hover:bg-indigo-200"
                >
                  {{ reward }}
                </div>
              </div>
            </div>
            <div class="p-2 mt-1 mb-1 bg-gray-700 rounded flex justify-between">
                <span class="rounded-full bg-yellow-300 text-black px-3">선택모델: <span class="bg-yellow-800 px-2 rounded-full text-white">{{ selectedEpoch }}</span></span>
                <button class="bg-gray-400 text-black rounded px-2 hover:bg-gray-600 hover:text-white" @click.prevent="runTest" >Test <b-icon icon="play-fill"/></button>
            </div>

            <div class="mt-1">
              <div class="m-0 p-0 text-center text-white w-24 bg-blue-800 rounded-t-lg">
                <small>평균속도 </small>
                <!-- <b-icon icon="three-dots" animation="cylon" font-scale="1"></b-icon> -->
              </div>
              <div class="bg-gray-700 border-2 border-blue-800">
                <line-chart
                  :chartData="chart.currentSpeedChart"
                  :options="lineChartOption({})"
                  :height="150"
                />
              </div>
            </div>

            <div>
              <div class="text-xl">{{avgSpeedJunction}}</div>
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
    top: 100px;
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
