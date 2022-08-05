<template>
  <div class="bg-gray-600 relative min-h-screen">

    <div class="fixed z-50 inset-auto h-full " v-if="showWaitingMsg">
    <!-- <div class="fixed top-32 z-50 inset-auto h-full " v-if="true"> -->
      <div class="w-screen">
        <div class="animate-pulse mx-auto text-center bg-blue-300 p-5 text-xl font-bold">
          실행 준비 중입니다. 잠시후 실행 됩니다.
        </div>
      </div>
    </div>

    <div v-if="!simulation" class="w-80 mx-auto text-center">
      <div class="font-bold text-lg">We're sorry!!</div>
      <div class="font-bold text-sm">시뮬레이션 정보를 읽어오는데 실패하였습니다.</div>
    </div>
    <div v-else>
      <div class="text-white p-2 border-b flex justify-between items-center">
        <div class="font-bold">
          신호최적화: {{ simulation.id }}
        </div>
        <div>

        <div class="flex items-center space-x-1">
          <select v-model="selectedEpoch" size="sm" class="text-black rounded py-1 px-1">
            <option
              v-for="(reward, idx) of rewards.labels.filter((v,i)=> (i % simulation.configuration.modelSavePeriod) == 0)" :key="reward"
              :value="reward"
            >
            모델:{{ reward }} 보상({{ rewards.datasets[0].data[idx]}})
            </option>
          </select>
          <b-btn @click.prevent="runTest" variant="primary" size="sm" class="flex-none">
            모델 {{selectedEpoch}} 실행 <b-icon icon="play-fill"/>
          </b-btn>
          <b-btn @click="stopTest" variant="secondary" size="sm" class="flex-none">
            중지 <b-icon icon="stop-fill"></b-icon>
          </b-btn>

          <div class="flex space-x-1 items-center text-sm text-white flex-none">
            <div v-if="status === 'running'" class="text-center px-3 uppercase w-full">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div v-else class="px-2 uppercase w-full text-white">
              {{ status }}
            </div>
            <div class="flex-shrink-0">
              <b-btn @click="checkStatus" size="sm">상태 확인</b-btn>
            </div>
          </div>
        </div>
      </div>



      </div>
      <div class="text-white p-2 flex justify-between border-b border-gray-200">
        <div class="space-x-2">
          <span class="font-bold bg-gray-700 p-1 rounded">지역:</span> {{ getRegionName(config.region) }}
          <span class="font-bold bg-gray-700 p-1 rounded">시간:</span> {{ config.fromTime }} ~ {{ config.toTime }}
          <span class="font-bold bg-gray-700 p-1 rounded">대상교차로:</span> {{ simulation.configuration.junctionId }}
        </div>
        <div>
          <button @click="showModal"><b-icon icon="gear-fill"></b-icon></button>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-0 p-1">
        <div class="col-span-3">
          <div class="grid grid-cols-2">
            <div class="bg-gray-700 rounded-lg">
              <div class="grid grid-cols-3 gap-1 m-1 items-center">
                <div class="text-white text-center p-2 text-xl font-bold">기존신호</div>
                <div class="text-center text-2xl font-bold p-2 bg-gray-500 text-gray-300 flex items-center justify-center space-x-2 rounded-lg">
                  <div class="text-xs">평균속도</div>
                  <div>
                    {{chart1.avgSpeedJunction }}<span class="text-sm">km</span>
                  </div>
                </div>
                <div class="text-center text-2xl font-bold p-2 bg-gray-500 text-gray-300  flex items-center justify-center space-x-2 rounded-lg">
                  <div class="text-xs">통과시간</div>
                  <div>
                    {{chart1.travelTimeJunction.toFixed(2) }}<span class="text-sm"></span>
                  </div>
                </div>
                <!-- <div class="text-center text-2xl font-bold border- p-2 bg-indigo-500">
                  <div class="text-xs">교차로 평균속도</div>
                  <div>{{chart1.avgSpeedInView}}<span class="text-sm">km</span></div>
                </div> -->
              </div>
              <div class="border-2 border-gray-700" >
                <div :ref="mapIds[0]" :id="mapIds[0]" :style="{height: '600px'}" />

                <b-progress height="1rem" class="no-border-radius">
                  <b-progress-bar :value="chart1.progress" variant="secondary">
                    <span> {{ chart1.progress }} %</span>
                  </b-progress-bar>
                </b-progress>
              </div>
            </div>
            <div class="bg-yellow-400 rounded-lg">
              <div class="grid grid-cols-3 gap-1 text-black m-1 items-center">
                <div class="text-black text-center bg-yellow-300 p-2 text-xl font-bold">최적신호</div>
                <div class="text-center text-2xl font-bold p-2 bg-yellow-200  flex items-center justify-center space-x-2 rounded-lg">
                  <div class="text-xs">평균속도</div>
                  <div class="flex justify-center space-x-2">
                    <div>{{chart2.avgSpeedJunction }}<span class="text-sm">km</span> </div>
                    <!-- <div class="bg-yellow-100 rounded-xl px-2">{{chart2.effSpeed}}<span class="text-xs">%</span></div> -->
                  </div>
                </div>
                <div class="text-center text-2xl font-bold p-2 bg-yellow-200  flex items-center justify-center space-x-2 rounded-lg">
                  <div class="text-xs">통과시간</div>
                  <div class="flex justify-center space-x-2">
                    <div>{{chart2.travelTimeJunction.toFixed(2) }}<span class="text-sm"></span></div>
                    <!-- <div class="bg-yellow-100 rounded-xl px-2">{{chart2.effTravelTime}}<span class="text-xs">%</span></div> -->
                  </div>
                </div>
              </div>

              <div class="border-2 border-yellow-400">
                <div :ref="mapIds[1]" :id="mapIds[1]" :style="{height: '600px'}" />
                <b-progress height="1rem" class="no-border-radius" show-progress >
                  <b-progress-bar :value="chart2.progress" variant="secondary">
                    <span> {{ chart2.progress }} %</span>
                  </b-progress-bar>
                </b-progress>
              </div>

            </div>
          </div>
          <!-- </div> -->

        </div>
        <div class="ml-1">
          <div class="m-1">
            <div class="p-3 bg-yellow-100 text-center font-bold rounded-xl">
              <div class="">
                통과시간 향상률
              </div>
              <div class="text-5xl">
                {{chart2.effTravelTime.toFixed(2)}}<span class="text-xs">%</span>
              </div>
            </div>
          </div>

          <div class="mt-1 mb-1 p-1 bg-gray-700 space-y-1">
            <div class="p-1 bg-gray-800 overflow-auto text-sm" style="height:555px">
              <div v-for="(s, i) of statusMessage" :key="i" class="bg-gray-800 text-xs text-white">
                {{ s }}
              </div>

              <div content-class="mt-3" v-if="Object.keys(travelTimePerJunction).length > 0">
                <!-- <div class="text-right">
                  <button @click="toggleView" class="bg-indigo-200 rounded text-black px-1 mb-1">
                    <span v-if="speedView">통과시간 보기</span>
                    <span v-else>평균속도 보기</span>
                  </button>
                </div> -->
                <div title="평균통과시간" class="text-white" v-if="!speedView">
                  <div class="bg-blue-400 mb-1 p-1 text-center">평균통과시간</div>
                  <div class="text-white grid grid-cols-6 gap-1 text-center">
                    <div class="py-1 bg-blue-400 col-span-3">교차로 </div>
                    <div class="py-1 bg-blue-400">기존 </div>
                    <div class="py-1 bg-blue-400">모델</div>
                    <div class="py-1 bg-blue-400">향상률</div>
                  </div>
                  <div v-for="v of Object.entries(travelTimePerJunction)" class="text-white grid grid-cols-6">
                    <div class="border-b col-span-3">{{ v[0] }} </div>
                    <div class="border-b text-right">{{ Number(v[1][0]).toFixed(2) }} </div>
                    <div class="border-b text-right">{{ Number(v[1][1]).toFixed(2)}}</div>
                    <!-- <div class="border-b" v-if="Number(v[1][0]) !== 0">{{ (100 * (Number(v[1][0]) - Number(v[1][1])) / ((Number(v[1][1]) + Number(v[1][0])) / 2)).toFixed(2) }}</div> -->
                    <div class="border-b text-right" v-if="Number(v[1][0]) !== 0">
                    {{ (((Number(v[1][0]) - Number(v[1][1])) / Number(v[1][0])) * 100).toFixed(2) }}
                    </div>
                    <div class="border-b" v-else>0 </div>
                  </div>
                </div>
                <!-- <div title="평균속도" class="text-white mt-1" v-else>
                  <div class="bg-blue-400 mb-1 p-1 text-center">평균속도</div>
                  <div class="mt-1">
                    <div class="text-white grid grid-cols-6 gap-1 text-center">
                      <div class="py-1 bg-blue-400 col-span-3">교차로 </div>
                      <div class="py-1 bg-blue-400">기존 </div>
                      <div class="py-1 bg-blue-400">모델</div>
                      <div class="py-1 bg-blue-400">향상률</div>
                    </div>
                    <div v-for="v of Object.entries(speedsPerJunction)" class="text-white grid grid-cols-6">
                      <div class="border-b col-span-3">{{ v[0] }} </div>
                      <div class="border-b text-right">{{ Number(v[1][0]).toFixed(2) }} </div>
                      <div class="border-b text-right">{{ Number(v[1][1]).toFixed(2)}}</div>
                      <div class="border-b text-right">{{ (100 * (Number(v[1][1]) - Number(v[1][0])) / ((Number(v[1][1]) + Number(v[1][0])) / 2)).toFixed(2) }} </div>
                    </div>
                  </div>
                </div> -->
              </div>
              <div v-else class=" p-5">
                <div class="text-4xl text-white animate-pulse">Waiting...</div>
                <div class="text-md text-white pl-3">데이터가 확인중...</div>
                <div class="text-md text-white pl-3"> {{ statusText }}</div>
              </div>
            </div>
          </div>
          <!----- 보상 그래프 ----->
          <!-- <div class="px-2 pt-2 text-sm text-white bg-gray-800 rounded-t-lg font-bold">
            보상 그래프
            <div class="p-2" >
              <line-chart
                :chartData="rewards"
                :options="lineChartOption({}, ()=>{})"
                :height="180"
              />
            </div>
          </div> -->

          <!-- <div class="pt-1 text-center text-sm text-white w-24 bg-gray-700 rounded-t-lg mt-1">모델 선택</div> -->
          <!-- <div class="bg-gray-800 p-2 space-y-1 mt-1 rounded">
          </div> -->
          <!-- <div class="bg-gray-200">
            <div style="height:120px;width:100%;" ref="chart-avg-speed-junction"></div>
          </div> -->
        </div>
      </div>
      <div class="grid grid-cols-4 gap-1 ml-1">
        <div class="col-span-3">
          <div content-class="" active-nav-item-class="" >
            <div title="평균통과시간" title-item-class="font-bold bg-gray-500 " v-if="!speedView">
              <div class="bg-blue-400 mb-1 p-1 text-center text-white">평균통과시간</div>
              <div class="text-white bg-gray-800 p-1 text-sm font-bold">
                <line-chart :chartData="chart.travelTimeChartInView" :options="lineChartOption({})" :height="150" />
              </div>
            </div>
            <!-- <div title="평균속도" title-item-class="font-bold bg-gray-500" v-else>
              <div class="bg-blue-400 mb-1 p-1 text-center">평균속도</div>
              <div class="text-white bg-gray-800 p-1 text-sm font-bold mt-1">
                <line-chart :chartData="chart.avgSpeedChartInView" :options="lineChartOption({})" :height="165" />
              </div>
            </div> -->
          </div>
        </div>
        <div class="text-white items-center">
          <div class="bg-blue-400 mb-1 p-1 text-center">신호시스템</div>
          <div class="text-center bg-gray-800">{{ selectedNode }}</div>
          <!-- <div>{{ actionForOpt[0].action }}</div> -->
          <!-- <div>{{ actionForOpt[1].action }}</div> -->

          <div ref="actionvis" class="w-84 h-96 bg-gray-800 p-3">

          </div>

        </div>
      </div>
    </div>

    <!-- BOTTOM STATUS TEXT -->
    <div class="flex my-1 p-1 justify-between bg-gray-700">
      <div class="text-center text-white px-2 ">
        {{ statusText }}
      </div>
      <div class="flex space-x-1 items-center text-sm text-white">
        <div v-if="status === 'running'" class="text-center px-3 uppercase w-full">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div v-else class="px-2 uppercase w-full text-white">
          상태: {{ status }}
        </div>
        <div class="flex-shrink-0">
          <button @click="checkStatus" class="bg-indigo-500 px-2 rounded">실행상태 확인</button>
        </div>
      </div>
    </div>

    <b-modal title="신호 최적화 정보" ref="optenvmodal">
      <div class="text-white text-sm p-2 bg-gray-700 min-w-max">
        <div class="border-blue-600 space-y-1">
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-blue-500 px-1 rounded">아이디</div> <div>{{ simulation.id }} </div>
          </div>
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-blue-500 px-1 rounded">지역</div>
            <div class="w-12"> {{ config.region }}</div>


          </div>
          <div class="flex space-x-1">
            <!-- <div class="w-24 text-center bg-blue-500 px-1 rounded ">모델 저장주기</div> <div>{{ config.modelSavePeriod }}</div> -->
            <div class="w-20 text-center bg-blue-500 px-1 rounded">보상함수</div> <div>{{ config.rewardFunc }}</div>
            <div class="w-20 text-center bg-blue-500 px-1 rounded">통계주기</div> <div>{{ config.period / 60 }}<span>분</span></div>
          </div>
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-blue-500 px-1 rounded">Method</div>
            <div class="w-12">{{ config.method }}</div>
            <div class="w-20 text-center bg-blue-500 px-1 rounded">Action</div>
            <div>{{ config.action }}</div>

          </div>
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-blue-500 px-1 rounded">시간</div>
            <div>{{ config.fromTime }} ~ {{ config.toTime }}</div>
          </div>
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-blue-500 px-1 rounded">대상교차로</div>
            <div>{{ simulation.configuration.junctionId }}</div>
          </div>
          <!-- <div class="space-y-1 items-center">
            <div class="w-20 text-center bg-blue-500 px-1 rounded">실행이미지</div>
            <div class="">{{ simulation.configuration.dockerImage }} </div>
          </div> -->
        </div>
      </div>
    </b-modal>
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
