<template>
  <div class="bg-gray-600 relative min-h-screen- opt-container-" style="height: calc(100vh - 50px)">
    <div v-if="!simulation" class="w-80 mx-auto text-center">
      <div class="font-bold text-lg">We're sorry!!</div>
      <div class="font-bold text-sm">
        시뮬레이션 정보를 읽어오는데 실패하였습니다.
      </div>
    </div>
    <div v-else>
      <div class="text-white p-1 px-2 border-b border-gray-500 flex justify-between items-center bg-gray-700">
        <div class="font-bold">신호최적화: {{ simulation.id }}</div>
        <div>
          <div class="flex items-center space-x-1">
            <select v-model="selectedEpoch" size="sm" class="text-black rounded py-1 px-2" style="height:30px">
              <option v-for="(reward, idx) in epochList" :key="reward.epoch" :value="reward.epoch">
                <!-- 모델:{{ reward }} 보상({{ rewards.datasets[0].data[idx]}}) -->
                <div class="font-bold text-sm">
                  모델:[{{ reward.epoch }}], 보상:[{{ Number(reward.rewardAvg).toFixed(2) }}],
                  <span v-if="reward.checked">Tested</span>
                  <span v-else>Not Tested</span>
                </div>
              </option>
            </select>
            <button
              @click.prevent="runTest"
              class="bg-indigo-500 py-1 px-2 text-sm rounded flex-none h-8 hover:bg-indigo-200 hover:text-black"
            >
              모델 {{ selectedEpoch }} 실행 <b-icon icon="play-fill" />
            </button>
            <b-btn @click="stopTest" variant="secondary" size="sm" class="flex-none">
              중지 <b-icon icon="stop-fill"></b-icon>
            </b-btn>
            <b-btn @click="checkStatus" variant="secondary" size="sm">
            상태 확인
          </b-btn>
          </div>
        </div>
      </div>
      <div class="text-white p-1 pt-2 flex justify-between bg-gray-700">
        <div class="flex space-x-1 items-center">
          <span class="font-bold text-indigo-100 px-1 ">{{ config.regionName }}</span>
          <span>|</span>
          <span class="font-bold text-indigo-100 px-1 ">{{ config.fromTime }} ~ {{ config.toTime }}</span>
          <span>|</span>
          <span class="font-bold text-indigo-100 px-1 ">{{ simulation.configuration.junctionId }}</span>
          <span>|</span>
          <span class="font-bold text-indigo-100">{{ getActionName(config.action)}}</span>
        </div>
        <div class="mx-2">
          <button @click="showModal" class="px-2 text-white bg-indigo-500 px-1 rounded hover:bg-blue-400 hover:text-white">
            <b-icon icon="table"></b-icon> 결과비교
          </button>
        </div>
      </div>

      <!-- 메인 레이아웃 START -->
      <div class="relative min-w-max">
        <!-- 지도 레이아웃 START -->
        <div class="grid grid-cols-4 gap-1 p-1">
          <div class="col-span-3">
            <div class="grid grid-cols-2 gap-1">
              <div class="">
                <div class="flex justify-between">
                  <div class="w-60 bg-gray-700 p-1 px-2 rounded-t-lg">
                    <div class="tracking-wide text-white text-center font-bold ">
                      <b-icon icon="file-earmark-check"></b-icon> 기존신호
                    </div>

                  </div>
                  <!-- <div class="w-max-">
                    <div class="flex space-x-1 justify-end">
                      <div
                        class="bg-gray-500 px-2 text-center text-2xl font-bold text-gray-100 flex items-center justify-center space-x-2 rounded-lg">
                        <div class="text-xs">평균속도</div>
                        <div>
                          <span>{{ animated.chart1_avgSpeedJunction.toFixed(2) }}</span>
                          <span class="text-sm">km</span>
                        </div>
                      </div>
                      <div
                        class="bg-gray-500 px-2 text-center text-2xl font-bold bg-gray-500- text-gray-100  flex items-center justify-center space-x-2 rounded-lg">
                        <div class="text-xs">통과시간</div>
                        <div>
                          <span>{{ animated.chart1_travelTimeJunction.toFixed(2) }}</span>
                          <span class="text-sm">초</span>
                        </div>
                      </div>
                    </div>
                  </div> -->
                </div>
                <div class="border-2 border-gray-700">
                  <div class="relative">
                    <div :ref="mapIdFt" :id="mapIdFt" :style="{ height: mapHeight + 'px' }" />
                    <div class="absolute top-0 w-full">
                      <b-progress height="1rem" class="no-border-radius" show-progress  v-if="chart1.progress != 0">
                        <b-progress-bar :value="chart1.progress" variant="primary">
                          <span> {{ chart1.progress }} %</span>
                        </b-progress-bar>
                      </b-progress>
                    </div>

                    <div class="absolute top-4 right-1 w-60">
                      <div class="grid grid-cols-2 gap-1 text-white font-bold">
                        <div class="bg-gray-600 p-2 text-center text-2xl rounded-lg">
                          <div class="text-xs">평균속도</div>
                          <div>
                            <span>{{ animated.chart1_avgSpeedJunction.toFixed(2) }}</span>
                            <span class="text-sm">km</span>
                          </div>
                        </div>
                        <div class="bg-gray-600 p-2 text-center text-2xl rounded-lg">
                          <div class="text-xs">통과시간</div>
                          <div>
                            <span>{{ animated.chart1_travelTimeJunction.toFixed(2) }}</span>
                            <span class="text-sm">초</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 최적신호 결과 패널 -->
              <div class="">
                <div class="flex justify-between">
                  <div class="w-60 p-1 bg-yellow-300 rounded-t-lg">
                    <div class="text-black text-center font-bold tracking-wide ">
                      <b-icon icon="file-earmark-code"></b-icon> 최적신호
                    </div>
                  </div>
                  <!-- <div class="w-max">
                    <div class="flex space-x-1 justify-end">
                      <div
                        class="bg-yellow-200 px-2 text-center text-2xl font-bold flex items-center justify-center space-x-2 rounded-lg">
                        <div class="text-xs">평균속도</div>
                        <div class="flex justify-center space-x-2">
                          <div>
                            <span> {{ animated.chart2_avgSpeedJunction.toFixed(2) }} </span>
                            <span class="text-sm">km</span>
                          </div>
                        </div>
                      </div>
                      <div class="bg-yellow-200 px-2 text-center text-2xl font-bold flex items-center justify-center space-x-2 rounded-lg">
                        <div class="text-xs">통과시간</div>
                        <div class="flex justify-center space-x-2">
                          <div>
                            <span>{{ animated.chart2_travelTimeJunction.toFixed(2) }}</span>
                            <span class="text-sm">초</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> -->
                </div>

                <div class="border-2 border-yellow-300">
                  <div class="relative">
                    <div :ref="mapIdRl" :id="mapIdRl" :style="{ height: mapHeight + 'px' }"></div>
                    <div class="absolute top-0 w-full">
                      <b-progress height="1rem" class="no-border-radius" show-progress v-if="chart2.progress != 0">
                        <b-progress-bar :value="chart2.progress" variant="progress">
                          <span> {{ chart2.progress }} %</span>
                        </b-progress-bar>
                      </b-progress>
                    </div>

                    <div class="absolute top-4 right-1 w-60">
                      <div class="grid grid-cols-2 gap-1 text-black font-bold">
                        <div class="bg-yellow-200 p-2 text-center text-2xl rounded-lg">
                          <div class="text-xs">평균속도</div>
                          <div>
                            <span>{{ animated.chart2_avgSpeedJunction.toFixed(2) }}</span>
                            <span class="text-sm">km</span>
                          </div>
                        </div>
                        <div class="bg-yellow-200 p-2 text-center text-2xl rounded-lg">
                          <div class="text-xs">통과시간</div>
                          <div>
                            <span>{{ animated.chart2_travelTimeJunction.toFixed(2) }}</span>
                            <span class="text-sm">초</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="absolute -left-40 top-24 w-76 bg-gray-600 p-0 text-white" v-if="testResult">
                      <div class="flex justify-between bg-gray-500 py-1 px-2">
                        <div class="font-bold">
                          <b-icon icon="stoplights"></b-icon> {{ crossNameSelected }}
                        </div>
                        <div>
                          <button @click="testResult=null">X</button>
                        </div>
                      </div>
                      <div class="p-2 text-sm space-y-1">
                        <div class="flex space-x-1">
                          <div class="px-1 w-28 text-right rounded">
                            &nbsp;
                          </div>
                          <div class="px-1 w-20 text-center bg-gray-500 rounded">
                            기존신호
                          </div>
                          <div class="px-1 w-20 text-center bg-yellow-300 rounded text-black">
                            최적신호
                          </div>
                        </div>
                        <div class="flex space-x-1">
                          <div class="px-1 w-28 text-right bg-gray-500 rounded">
                            평균속도
                          </div>
                          <div class="px-1 w-20 text-right bg-gray-500 rounded">
                            {{ testResult.simulate.avg_speed }} km
                          </div>
                          <div class="px-1 w-20 text-right bg-yellow-300 rounded text-black">
                            {{ testResult.test.avg_speed }} km
                          </div>
                        </div>
                        <div class="flex space-x-1">
                          <div class="px-1 w-28 text-right bg-gray-500 rounded">
                            통과차량수
                          </div>
                          <div class="px-1 w-20 text-right bg-gray-500 rounded">
                            {{ testResult.simulate.sum_passed}} 대
                          </div>
                          <div class="px-1 w-20 text-right bg-yellow-300 rounded text-black">
                            {{ testResult.test.sum_passed}} 대
                          </div>
                        </div>
                        <div class="flex space-x-1">
                          <div class="px-1 w-28 text-right bg-gray-500 rounded">
                            통과시간
                          </div>
                          <div class="px-1 w-20 text-right bg-gray-500 rounded">
                            {{ testResult.simulate.travel_time }} 초
                          </div>
                          <div class="px-1 w-20 text-right bg-yellow-300 rounded text-black">
                            {{ testResult.test.travel_time }} 초
                          </div>
                        </div>
                        <div class="flex space-x-1">
                          <div class="px-1 w-28 text-right bg-gray-500 rounded flex-none">
                            통과시간 향상률
                          </div>
                          <div class="px-1 w-full text-center bg-gray-500 rounded font-bold" :style="{'color': colorScale(animated.improvement_rate.toFixed(2))}">
                            {{ testResult.improvement_rate }} %
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="max-w-84 flex flex-column">
            <div class="mx-1">
              <div class="p-3 bg-gray-700 font-bold rounded-lg space-y-1" >
                <div class="text-white">
                  통과시간 향상률(%)
                </div>
                <div class="text-5xl text-center flex justify-center items-baseline space-x-1" :style="{'color': colorScale(animated.improvement_rate.toFixed(2))}">
                  <span>
                    {{ animated.improvement_rate.toFixed(2) }}
                  </span>
                  <span class="text-3xl">%</span>
                </div>
              </div>
            </div>

            <!-- 교차로별 통과시간 향상률 테이블 START -->
            <div class="m-1 space-y-1 flex-1 overflow-auto">
              <div class="p-1 pb-2 bg-gray-700 text-sm rounded h-8- h-max">
                <!-- <div class="text-white text-center pb-1">평균 통과시간 향상률</div> -->

                <!-- <div class="p-1">
                  <div class="text-white font-bold grid grid-cols-6 gap-1 text-center">
                    <div class="bg-gray-500 col-span-3">교차로</div>
                    <div class="bg-gray-500">기존</div>
                    <div class="bg-gray-500">최적</div>
                    <div class="bg-gray-500">향상률</div>
                  </div>
                  <div v-for="(r, idx) of optTestResult" :key="idx" class="grid grid-cols-6" :style="{
                    color: getColorForImprovedRate(r.improvedRate)
                  }">
                    <div class="border-b col-span-3">
                      <button  @click="selectCrossName(r.name)">
                        {{ r.name.toUpperCase() }}
                      </button>
                    </div>
                    <div class="border-b text-right">{{ r.ftAvgTravelTime }}</div>
                    <div class="border-b text-right">{{ r.rlAvgTravelTime }}</div>
                    <div class="border-b text-right">{{ r.improvedRate }}</div>
                  </div>
                </div> -->

                <div class="text-sm">
                  <div v-if="Object.keys(chart.travelTimePerJunction || {}).length > 0">
                    <div class="text-white font-bold grid grid-cols-6 gap-1 text-center text-xs">
                      <div class="py-1 bg-gray-500 col-span-3">교차로</div>
                      <div class="py-1 bg-gray-500">기존(초)</div>
                      <div class="py-1 bg-gray-500">최적(초)</div>
                      <div class="py-1 bg-gray-500">향상률(%)</div>
                    </div>

                    <div
                      v-for="v of Object.entries(chart.travelTimePerJunction)"
                      :key="v[0]"
                      class="text-white- grid grid-cols-6 px-1"
                      :style="{
                        color: getColorForImprovedRate(v[1].improvement_rate)
                      }"
                    >
                      <div class="border-b col-span-3">
                        <button @click="selectCrossName(v[0])" class="hover:text-blue-200">
                        {{ v[0] }}
                        </button>
                      </div>
                      <div class="border-b text-right">
                        {{ v[1].simulate.travel_time }}
                      </div>
                      <div class="border-b text-right">
                        {{ v[1].test.travel_time }}
                      </div>
                      <div class="border-b text-right">
                        {{ v[1].improvement_rate }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="p-5">
                    <div class="text-white flex items-center justify-center">
                      <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                    </div>
                    <div class="text-white text-center mt-2">
                      로딩중...
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 교차로별 통과시간 향상률 테이블 END -->
          </div>
        </div>
        <!-- 지도 레이아웃 END -->

        <!-- 평균 통과시간 그래프 START -->
        <div class="absolute bottom-0 w-full">
          <transition name="fade">
            <div class="px-1 min-w-fit" v-if="isShowAvgTravelChart">
              <div class="tracking-wide px-2 font-bold text-center text-white flex justify-between items-center">
                <div class="flex space-x-1 text-sm">
                  <div class="bg-gray-800 p-1 px-3 rounded-t-lg" >
                    <button @click.prevent="currentTab = 'total'">
                      전체교차로
                    </button>
                  </div>
                  <div class="bg-gray-500 font-bold p-1 px-3 rounded-t-lg">
                    <button @click.prevent="currentTab = ''; selectCrossName(crossNameSelected);">
                      {{ crossNameSelected }}
                    </button>
                  </div>
                </div>
                <div class="bg-gray-700 px-2 rounded hover:bg-blue-400 text-white hover:text-black">
                  <button @click="isShowAvgTravelChart = !isShowAvgTravelChart">
                    <b-icon icon="x"></b-icon>
                  </button>
                </div>
              </div>

              <div v-if="currentTab === 'total'" class="bg-gray-800">

                <div class="text-white p-1 grid grid-cols-2 gap-1" v-if="chart.travelTimeChartInView">
                  <div class="bg-gray-700 rounded h-64 pt-1">
                    <div class="text-center tracking-wider ">순간통과시간</div>
                    <line-chart
                      :chartData="chart.travelTimeChartInView"
                      :options="lineChartOption"
                      :height="220"
                    />
                  </div>
                  <div class="bg-gray-700 rounded pt-1">
                    <div class="text-center tracking-wider">누적통과시간</div>
                    <line-chart
                      :chartData="chart.travelTimeChartInViewAcc"
                      :options="lineChartOption"
                      :height="220"
                    />
                  </div>
                </div>
                <div class="text-white bg-gray-700 p-5 font-bold" v-else>
                  <div class="flex items-center">
                    <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                      </circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    <div class="text-white pl-3">
                      로딩중...
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="bg-gray-500">
                <div class="p-1 grid grid-cols-4 gap-1">
                  <div class="col-span-3">
                    <div class="text-center text-white">
                      <div class="text-white h-64 grid grid-cols-2 gap-1" v-if="chart.travelTimeJunctionChart">
                        <div class="bg-gray-700 rounded pt-1">
                          <div class="text-center tracking-wider">순간통과시간</div>
                          <line-chart
                            :chartData="chart.travelTimeJunctionChart"
                            :options="lineChartOption"
                            :height="220"
                          />
                        </div>
                        <div class="bg-gray-700 rounded pt-1">
                          <div class="text-center tracking-wider">누적통과시간</div>
                          <line-chart
                            :chartData="chart.travelTimeJunctionChartAcc"
                            :options="lineChartOption"
                            :height="220"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="relative">
                    <div class="text-white items-center bg-gray-700 flex-none">
                      <div ref="actionvis" class="mx-auto w-80 h-64 p-2 max-w-xs"></div>
                    </div>
                    <!-- <div class="absolute top-2 left-2">
                      <div class="text-white text-sm">
                        {{ crossNameSelected }}
                      </div>
                    </div> -->
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
        <!-- 평균 통과시간 그래프 END -->

        <div class="absolute bottom-0 right-2 bg-blue-400 px-2 rounded" v-if="!isShowAvgTravelChart">
          <button @click="isShowAvgTravelChart = true; updateSignalExplain()" class="text-sm text-white font-bold">
            평균통과시간 차트
          </button>
        </div>

        <div v-if="showWaitingMsg" class="absolute top-24 w-full left-auto">
          <div class="flex justify-center">
            <div
              class="border rounded text-center bg-blue-300 p-5 text-xl font-bold flex items-center space-x-1 justify-center w-92">
              <svg class="animate-spin h-16 w-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <div>
                <div class="p-2">
                  시뮬레이션 준비중입니다. 잠시 기다리세요.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showWaitingMsg2" class="absolute top-24 w-full left-auto">
          <div class="flex justify-center">
            <div
              class="border rounded text-center bg-indigo-300 p-5 text-xl font-bold flex items-center space-x-1 justify-center w-92">
              <svg class="animate-spin h-16 w-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <div>
                <div class="p-2">
                  결과 분석중 입니다. 잠시 기다리세요.
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- <div v-if="status === 'error'" class="absolute top-24 w-full">
          <div class="flex justify-center">
            <div
              class="border rounded-xl text-center bg-red-400 p-5 text-xl font-bold w-92"
            >
              <div class="text-white">
                결과파일이 준비되지 않았습니다.
              </div>
              <div class="text-white text-sm">
                모델 선택 후 실행 하세요.
              </div>
              <div class="text-sm">
                {{ statusText }}
              </div>
            </div>
          </div>
        </div> -->
      </div>
      <!-- 메인 레이아웃 END -->
    </div>
    <!-- BOTTOM STATUS TEXT -->
    <div class="flex justify-between bg-gray-700 items-center p-1 mx-1">
      <div class="text-center text-white px-2 text-xs">
        <span class="text-gray-200">UNIQ-VIS</span>
        <span class="text-yellow-200">{{ simulation.id }}</span>
        <span class="text-blue-200">{{ statusText }}</span>
        <span class="text-blue-200">Learning Rate: {{ simulation.configuration.lr }}</span>
        <span class="text-blue-200">Memory Length: {{ simulation.configuration.memLen }}</span>
      </div>
      <div class="flex space-x-1 items-center text-xs text-white">
        <div v-if="status === 'running'" class="text-center px-3 uppercase w-full flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <div class="text-blue-200">실행중...</div>
        </div>
        <div v-else class="px-2 uppercase w-full text-white">
          <span class="text-blue-200">상태: {{ status }}</span>
        </div>
      </div>
    </div>

    <!-- MODAL WINDOW -->
    <b-modal
      size="xl"
      :title="simulation.id"
      ref="optenvmodal"
      header-border-variant="dark"
      header-bg-variant-="dark"
      header-text-variant="light"
      body-bg-variant-="dark"
      body-text-variant="light"
      body-border-variant="dark"
      footer-bg-variant="dark"
      hide-footer
      header-class="pt-1 pb-0 rounded-0 bg-gray-700"
      body-class="p-2 bg-gray-700"
    >
      <div class="text-white text-sm min-w-max">
        <div class="grid grid-cols-2 bg-gray-800 p-1 rounded">
          <div class="space-y-1 p-2 rounded">
            <div class="flex space-x-1">
              <div class="w-32 text-right bg-gray-500 px-1 rounded">지역</div>
              <div class="">{{ config.regionName }}</div>
            </div>

            <div class="flex space-x-1">
              <div class="w-32 text-right bg-gray-500 px-1 rounded">
                대상 교차로 그룹
              </div>
              <div>{{ simulation.configuration.junctionId }}</div>
            </div>
            <div class="flex space-x-1">
              <div class="w-32 text-right bg-gray-500 px-1 rounded">시간</div>
              <div>{{ config.fromTime }} ~ {{ config.toTime }}</div>
            </div>
            <div class="flex space-x-1">
              <div class="w-32 text-right bg-gray-500 px-1 rounded">모델 저장주기</div>
              <div>{{ config.modelSavePeriod }}</div>
            </div>
            <div class="flex space-x-1 items-center">
              <div class="w-32 text-right bg-gray-500 px-1 rounded">
                실행이미지
              </div>
              <div class="">{{ simulation.configuration.dockerImage }}</div>
            </div>
          </div>
          <div class="bg-gray-800 p-2 rounded">
            <div class="">
              <div class="space-y-1">
                <div class="flex space-x-1">
                  <div class="w-32 text-right bg-gray-500 px-1 rounded">보상함수</div>
                  <div class="">{{getRewardFunctionName(config.rewardFunc)}} </div>

                </div>
                <div class="flex space-x-1">
                    <div class="w-32 text-right bg-gray-500 px-1 rounded">메소드</div>
                  <div class="">{{ config.method }}</div>
                </div>
                <div class="flex space-x-1">
                  <div class="w-32 text-right bg-gray-500 px-1 rounded">액션</div>
                  <div class="">{{ getActionName(config.action)}}</div>
                </div>
                <div class="flex space-x-1">
                  <div class="w-32 text-right bg-gray-500 px-1 rounded">학습속도</div>
                  <div class="">{{ config.lr}}</div>
                </div>
                <div class="flex space-x-1">
                  <div class="w-32 text-right bg-gray-500 px-1 rounded">메모리 길이</div>
                  <div class="">{{ config.memLen}}</div>
                </div>

              </div>

            </div>
          </div>

        </div>

        <div class="grid grid-cols-12 rounded p-2  bg-gray-800 mt-2">
          <div class="col-span-5">
            <div class="h-8 flex items-center space-x-1 justify-center">
              <select
                v-model="optTestResult.first.epoch"
                class="text-black rounded px-2 w-full mx-1"
                style="height:28px"
                @change="loadTestResult('first', optTestResult.first.epoch)"
              >
                <option v-for="(reward, idx) in epochList" :key="reward.epoch" :value="reward.epoch" v-if="reward.checked">
                  <!-- 모델:{{ reward }} 보상({{ rewards.datasets[0].data[idx]}}) -->
                  <div class="font-bold text-sm">
                    모델:{{ reward.epoch }} 보상({{ reward.rewardAvg }})
                  </div>
                </option>
              </select>
            </div>

            <div class="p-1">
              <div class="text-white font-bold grid grid-cols-6 gap-1 text-center">
                <div class="p-1 bg-gray-500 col-span-3">교차로</div>
                <div class="p-1 bg-gray-500">기존(s)</div>
                <div class="p-1 bg-gray-500">최적(s)</div>
                <div class="p-1 bg-gray-500">향상률(%)</div>
              </div>
              <div
                v-if="optTestResult.first.result.length === 0"
                class="text-center p-4"
              >
                모델을 선택하세요.
              </div>
              <div
                v-for="(r, idx) in optTestResult.first.result"
                :key="idx"
                class="grid grid-cols-6"
                :style="{
                  color: getColorForImprovedRate(r.improvedRate)
                }"
              >
                <div class="border-b col-span-3">
                  <button>
                      <!-- <svg v-if="r.improvedRate > 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                      </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-4 h-4 inline-block">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                      </svg> -->
                    {{ r.name.toUpperCase() }}
                  </button>
                </div>
                <div class="border-b text-right">{{ r.ftAvgTravelTime }}</div>
                <div class="border-b text-right">{{ r.rlAvgTravelTime }}</div>
                <div class="border-b text-right">{{ r.improvedRate }}</div>
              </div>
            </div>
          </div>

          <div class="col-span-2">
            <div class="h-8">
            </div>
            <div class="p-1">
              <div class="text-white font-bold grid grid-cols-1 text-center">
                <div class="p-1 bg-gray-500">통과시간 향상률(%)</div>
              </div>
              <div
                v-if="optTestResult.first.result.length === optTestResult.second.result.length"
                v-for="(r, idx) in optTestResult.first.result"
                :key="idx"
                class="grid grid-cols-1"
                :style="{
                  color: getColorForImprovedRate(r.improvedRate)
                }"
              >
                <div class="border-b text-center grid grid-cols-2 items-center justify-center">
                  <div class="bg-yellow-400">
                    <b-progress-bar
                      v-if="getEff(idx) > 0"
                      :value="100 - Math.abs(getEff(idx))"
                      style="background-color: rgba(31,41,55)"
                    >
                      <span>
                        <strong>
                          {{ Math.abs(getEff(idx)) }} %
                          <svg v-if="getEff(idx) != 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </strong>
                      </span>
                    </b-progress-bar>
                  </div>
                  <div>
                    <b-progress-bar v-if="getEff(idx) < 0" :value="Math.abs(getEff(idx))" variant="success">
                      <span>
                        <strong>
                          <svg v-if="getEff(idx) != 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                          </svg>
                          {{ Math.abs(getEff(idx)) }} %
                        </strong>
                      </span>
                    </b-progress-bar>
                    <div v-else> &nbsp;</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-span-5">
            <div class="h-8 flex items-center space-x-1 justify-center">
              <select
                v-model="optTestResult.second.epoch"
                class="text-black rounded py-1 px-2  w-full mx-1"
                style="height:28px"
                @change="loadTestResult('second', optTestResult.second.epoch)"
              >
                <option v-for="(reward, idx) in epochList" :key="reward.epoch" :value="reward.epoch" v-if="reward.checked">
                  <!-- 모델:{{ reward }} 보상({{ rewards.datasets[0].data[idx]}}) -->
                  <div class="font-bold text-sm">
                    모델:{{ reward.epoch }} 보상({{ reward.rewardAvg }})
                  </div>
                </option>
              </select>
            </div>

            <div class="p-1">
              <div class="text-white font-bold grid grid-cols-6 gap-1 text-center">
                <div class="p-1 bg-gray-500 col-span-3">교차로</div>
                <div class="p-1 bg-gray-500">기존(s)</div>
                <div class="p-1 bg-gray-500">최적(s)</div>
                <div class="p-1 bg-gray-500">향상률(%)</div>
              </div>

              <div
                v-if="optTestResult.second.result.length === 0"
                class="text-center p-4"
              >
                모델을 선택하세요.
              </div>

              <div v-for="(r, idx) in optTestResult.second.result" :key="idx" class="grid grid-cols-6" :style="{
                color: getColorForImprovedRate(r.improvedRate)
              }">
                <div class="border-b col-span-3">
                  <button>
                    <!-- <svg v-if="r.improvedRate > 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-4 h-4 inline-block">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                      </svg> -->
                    {{ r.name.toUpperCase() }}
                  </button>
                </div>
                <div class="border-b text-right">{{ r.ftAvgTravelTime }}</div>
                <div class="border-b text-right">{{ r.rlAvgTravelTime }}</div>
                <div class="border-b text-right">{{ r.improvedRate }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>

    <b-modal ref="compare">
      info
    </b-modal>
  </div>
</template>

<script src="./optimization-result-comparison-map.js"></script>

<style>
.opt-container {
  height: calc(100vh) - 100;
}

.no-border-radius {
  border-radius: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
