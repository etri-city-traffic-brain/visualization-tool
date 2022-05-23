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
      <div class="grid grid-cols-4 gap-0 p-1">
        <div class="col-span-3">
          <div class="grid grid-cols-2">
            <div class="bg-gray-700">
              <div class="grid grid-cols-3 gap-2 mt-2 text-white">
                <div class="text-center font-bold pt-1 w-full flex flex-col justify-middle justify-center">
                  <div class="tracking-wider text-lg">기존신호</div>
                </div>
                <div class="text-center text-2xl font-bold p-2">
                  <div class="text-xs">뷰영역 평균속도</div>
                  <div>{{chart1.avgSpeedJunction}} <span class="text-sm">km</span></div>
                </div>
                <div class="text-center text-2xl font-bold border- p-2">
                  <div class="text-xs">교차로 평균속도</div>
                  <div>{{chart1.avgSpeedInView}} <span class="text-sm">km</span></div>
                </div>
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
            <div class="bg-yellow-300">
              <div class="grid grid-cols-3 gap-2 mt-2 text-black">
              <div class="text-center text-black font-bold pt-1 w-full flex flex-col justify-middle justify-center">
                <div class="tracking-wider text-lg">최적신호</div>
              </div>
                <div class="text-center text-2xl font-bold p-2">
                  <div class="text-xs">뷰영역 평균속도</div>
                  <div>{{chart2.avgSpeedJunction}} <span class="text-sm">km</span></div>
                </div>
                <div class="text-center text-2xl font-bold border- p-2">
                  <div class="text-xs">교차로 평균속도</div>
                  <div>{{chart2.avgSpeedInView}} <span class="text-sm">km</span></div>
                </div>
              </div>

              <div class="border-2 border-yellow-400">
                <div :ref="mapIds[1]" :id="mapIds[1]" :style="{height: '600px'}" />
                <b-progress height="1rem" class="no-border-radius"  >
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
          <div class="text-white text-sm p-2 bg-gray-700 min-w-max">
            <div class="border-blue-600 space-y-1">
              <div class="flex space-x-1">
                <div class="bg-blue-500 px-1 rounded">아이디</div> <div>{{ simulation.id }} </div>
              </div>
              <div class="flex space-x-1">
                <div class="bg-blue-500 px-1 rounded">지역</div><div> {{ config.region }}</div>
                <div class="bg-blue-500 px-1 rounded">주기</div> <div>{{ config.period }}초</div>
                <div class="bg-blue-500 px-1 rounded ">모델 저장주기</div> <div>{{ config.modelSavePeriod }}</div>
              </div>
              <div class="flex space-x-1">
                <div class="bg-blue-500 px-1 rounded">Method</div> <div>{{ config.method }}</div>
                <div class="bg-blue-500 px-1 rounded">Action</div> <div>{{ config.action }}</div>
                <div class="bg-blue-500 px-1 rounded">보상함수</div> <div>{{ config.rewardFunc }}</div>
              </div>
              <div class="flex space-x-1">
                <div class="bg-blue-500 px-1 rounded">시간</div>
                <div>{{ config.fromTime }} ~ {{ config.toTime }}</div>
              </div>
              <div class="space-y-1">
                <div class="bg-blue-500 px-1 w-max rounded font-bold">대상 교차로</div>
                <div>{{ simulation.configuration.junctionId }}</div>
              </div>
              <div class="space-y-1 items-center">
                <div class="bg-blue-500 px-1 w-max rounded">실행이미지</div>
                <div class="">{{ simulation.configuration.dockerImage }} </div>
              </div>
            </div>
          </div>

          <div class="mt-1 mb-1 p-1 bg-gray-700 space-y-1">
            <div v-if="status === 'running'" class="animate-pulse bg-indigo-300 text-center px-3 uppercase w-full">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div v-else class="bg-indigo-300 px-2 uppercase w-full">
              상태: {{ status }}
            </div>
            <div class="flex-shrink-0">
              <b-btn @click="checkStatus" size="sm">실행상태 확인</b-btn>
              <b-btn @click="stopTest" size="sm">분석 중지</b-btn>
            </div>
            <div class="p-1 bg-gray-800 max-h-32 h-32 overflow-auto">
              <div v-for="(s, i) of statusMessage" :key="i" class="bg-gray-800 text-xs text-white">
                {{ s }}
              </div>
            </div>
          </div>
          <div class="">

            <!----- 보상 그래프 ----->
            <div class="px-2 pt-2 text-sm text-white bg-gray-700 rounded-t-lg">보상 그래프</div>
            <div class="p-2 bg-gray-700" >
              <line-chart
                :chartData="rewards"
                :options="lineChartOption({}, ()=>{})"
                :height="180"
              />
            </div>

            <!-- <div class="pt-1 text-center text-sm text-white w-24 bg-gray-700 rounded-t-lg mt-1">모델 선택</div> -->
            <div class="bg-gray-700 text-white p-2 space-y-1">
              <div class="max-h-60 overflow-y-auto ">
                <div class="grid grid-cols-12 text-center gap">
                  <div
                    v-for="reward of rewards.labels.filter((v,i)=> (i % simulation.configuration.modelSavePeriod) == 0)"
                    :key="reward"
                    @click="selectedEpoch = reward"
                    class="bg-indigo-700 rounded px-1 cursor-pointer hover:bg-indigo-500"
                  >
                    {{ reward }}
                  </div>
                </div>
              </div>
              <div class="">
                <b-btn @click.prevent="runTest" variant="primary" size="sm" class="w-full" >
                모델: <span class="text-white font-bold">{{ selectedEpoch }}</span> 번 테스트 <b-icon icon="play-fill" size="sm"/>
                </b-btn>
              </div>
            </div>
            <!-- <div class="bg-gray-200">
              <div style="height:120px;width:100%;" ref="chart-avg-speed-junction"></div>
            </div> -->
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-1">
        <div class="">
          <div class="bg-gray-700 text-center text-white my-1">
            신호그래프 {{ selectedNode }}
          </div>
          <div class="flex justify-between pr-3 items-center text-sm text-white font-bold pl-3 py-1 bg-gray-700">
            기존신호
          </div>
          <div class="border-2 border-gray-700">
            <div style="height:160px;width:100%;" ref="phase-reward-ft"></div>
          </div>
          <div class="mt-1">
            <div class="pr-3 flex justify-between items-center text-sm text-black font-bold pl-3 py-1 bg-yellow-400">
              최적신호
            </div>
            <div class="border-2 border-yellow-400">
              <div style="height:160px;width:100%" ref="phase-reward-rl"></div>
            </div>
          </div>
        </div>
        <div>
          <div class="mt-1">
            <div class="m-0 p-0 text-center text-white bg-gray-800">
              <small>평균속도 </small>
              <!-- <b-icon icon="three-dots" animation="cylon" font-scale="1"></b-icon> -->
            </div>
            <div class="bg-gray-700 border-2 border-gray-800 p-2">
              <line-chart
                :chartData="chart.avgChartInView"
                :options="lineChartOption({})"
                :height="100"
              />

            </div>
          </div>

            <div class="mt-1">
            <div class="m-0 p-0 text-center text-white bg-blue-800">
              <small>평균속도(교차로) </small>
              <!-- <b-icon icon="three-dots" animation="cylon" font-scale="1"></b-icon> -->
            </div>
            <div class="bg-gray-700 border-2 border-blue-800 p-2">
              <line-chart
                :chartData="chart.avgChartJunctions"
                :options="lineChartOption({})"
                :height="100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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
