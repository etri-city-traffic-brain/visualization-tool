<template>
  <div
    class="bg-gray-600 relative min-h-screen- opt-container-"
    style="height: calc(100vh - 50px)"
  >
    <div v-if="!simulation" class="w-80 mx-auto text-center">
      <div class="font-bold text-lg">We're sorry!!</div>
      <div class="font-bold text-sm">
        시뮬레이션 정보를 읽어오는데 실패하였습니다.
      </div>
    </div>
    <div v-else>
      <div class="text-white p-2 border-b flex justify-between items-center">
        <div class="font-bold">신호최적화: {{ simulation.id }}</div>
        <div>
          <div class="flex items-center space-x-1">
            <select
              v-model="selectedEpoch"
              size="sm"
              class="text-black rounded py-1 px-2"
              style="height:30px"
            >
              <option
                v-for="(reward, idx) of rewards.labels.filter(
                  (v, i) => i % simulation.configuration.modelSavePeriod == 0
                )"
                :key="reward"
                :value="reward"
              >
                <!-- 모델:{{ reward }} 보상({{ rewards.datasets[0].data[idx]}}) -->
                모델:{{ reward }} 보상({{ rewards.values[idx] }})
              </option>
            </select>
            <b-btn
              @click.prevent="runTest"
              variant="secondary"
              size="sm"
              class="flex-none"
            >
              모델 {{ selectedEpoch }} 실행 <b-icon icon="play-fill" />
            </b-btn>
            <b-btn
              @click="stopTest"
              variant="secondary"
              size="sm"
              class="flex-none"
            >
              중지 <b-icon icon="stop-fill"></b-icon>
            </b-btn>
          </div>
        </div>
      </div>
      <div
        class="text-white p-1 pt-2 flex justify-between border-b- border-gray-200"
      >
        <div class="space-x-1-">
          <span class="font-bold text-indigo-100 px-1 p-1 rounded">{{
            getRegionName(config.region)
          }}</span>
          |
          <span class="font-bold text-indigo-100 px-1 p-1 rounded"
            >{{ config.fromTime }} ~ {{ config.toTime }}</span
          >
          |
          <span class="font-bold text-indigo-100 px-1 p-1 rounded">{{
            simulation.configuration.junctionId
          }}</span>
        </div>
        <div class="flex pr-2 space-x-2 text-sm items-center text-white">
          <!-- <div> {{  status }}</div> -->
          <!-- <div>{{ statusText }}</div> -->
          <button
            @click="showModal"
            class="bg-gray-400 px-1 text-black rounded hover:bg-blue-400"
          >
            정보
          </button>
          <button
            @click="checkStatus"
            class="bg-gray-400 px-1 text-black rounded hover:bg-blue-400"
          >
            상태 확인
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
                <div class="">
                  <div
                    class="w-full tracking-wide text-white text-center text-xl font-bold bg-gray-700 p-1 rounded-t-lg"
                  >
                    기존신호
                  </div>
                </div>
                <div class="border-2 border-gray-700">
                  <div class="relative">
                    <div
                      :ref="mapIds[0]"
                      :id="mapIds[0]"
                      :style="{ height: mapHeight + 'px' }"
                    />
                    <div class="absolute top-0 w-full">
                      <b-progress height="1rem">
                        <b-progress-bar
                          :value="chart1.progress"
                          variant="secondary"
                        >
                          <span> {{ chart1.progress }} %</span>
                        </b-progress-bar>
                      </b-progress>
                    </div>

                    <div class="absolute top-4 w-full">
                      <div class="flex space-x-1 justify-end border">
                        <div
                          class="bg-gray-500 px-2 text-center text-2xl font-bold text-gray-100 flex items-center justify-center space-x-2 rounded-lg"
                        >
                          <div class="text-xs">평균속도</div>
                          <div>
                            {{ animated.chart1_avgSpeedJunction.toFixed(2)
                            }}<span class="text-sm">km</span>
                          </div>
                        </div>
                        <div
                          class="bg-gray-500 px-2 text-center text-2xl font-bold bg-gray-500- text-gray-100  flex items-center justify-center space-x-2 rounded-lg"
                        >
                          <div class="text-xs">통과시간</div>
                          <div>
                            {{ animated.chart1_travelTimeJunction.toFixed(2)
                            }}<span class="text-sm">sec</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-yellow-300 rounded-lg">
                <div class="">
                  <div
                    class="w-full tracking-wide text-black text-center text-xl font-bold bg-yellow-300 p-1 rounded-t-lg"
                  >
                    최적신호
                  </div>
                </div>

                <div class="border-2 border-yellow-300">
                  <!-- <div :ref="mapIds[1]" :id="mapIds[1]" :style="{height: '600px'}" /> -->
                  <div class="relative">
                    <div
                      :ref="mapIds[1]"
                      :id="mapIds[1]"
                      :style="{ height: mapHeight + 'px' }"
                    />
                    <div class="absolute top-0 w-full">
                      <b-progress
                        height="1rem"
                        class="no-border-radius"
                        show-progress
                      >
                        <b-progress-bar
                          :value="chart2.progress"
                          variant="secondary"
                        >
                          <span> {{ chart2.progress }} %</span>
                        </b-progress-bar>
                      </b-progress>
                    </div>

                    <div class="absolute top-4 w-full">
                      <div class="flex space-x-1 justify-end border">
                        <div
                          class="bg-yellow-300 px-2 text-center text-2xl font-bold flex items-center justify-center space-x-2 rounded-lg"
                        >
                          <div class="text-xs">평균속도</div>
                          <div class="flex justify-center space-x-2">
                            <div>
                              {{ animated.chart2_avgSpeedJunction.toFixed(2)
                              }}<span class="text-sm">km</span>
                            </div>
                            <!-- <div class="bg-yellow-100 rounded-xl px-2">{{chart2.effSpeed}}<span class="text-xs">%</span></div> -->
                          </div>
                        </div>
                        <div
                          class="bg-yellow-300 px-2 text-center text-2xl font-bold flex items-center justify-center space-x-2 rounded-lg"
                        >
                          <div class="text-xs">통과시간</div>
                          <div class="flex justify-center space-x-2">
                            <div>
                              {{ animated.chart2_travelTimeJunction.toFixed(2)
                              }}<span class="text-sm">sec</span>
                            </div>
                            <!-- <div class="bg-yellow-100 rounded-xl px-2">{{chart2.effTravelTime}}<span class="text-xs">%</span></div> -->
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- </div> -->
          </div>
          <div class="max-w-84 flex flex-column">
            <div class="mx-1">
              <div class="p-3 bg-green-200 text-center font-bold rounded-lg">
                <div class="">
                  통과시간 향상률
                </div>
                <div class="text-6xl">
                  {{ animated.improvement_rate.toFixed(2)
                  }}<span class="text-lg">%</span>
                </div>
                <!-- {{chart.improvement_rate.toFixed(2)}}<span class="text-lg">%</span> -->
              </div>
            </div>

            <!-- 교차로별 통과시간 향상률 테이블 START -->
            <div class="m-1 space-y-1 flex-1 overflow-auto">
              <div class="p-1 pb-2 bg-gray-800 text-sm rounded h-64">
                <div class="text-sm bg-gray-800">
                  <div
                    v-if="
                      Object.keys(chart.travelTimePerJunction || {}).length > 0
                    "
                  >
                    <div
                      class="text-white font-bold grid grid-cols-6 gap-1 text-center"
                    >
                      <div class="bg-gray-500 col-span-3">교차로</div>
                      <div class="bg-gray-500">기존</div>
                      <div class="bg-gray-500">최적</div>
                      <div class="bg-gray-500">향상률</div>
                    </div>

                    <div
                      v-for="v of Object.entries(chart.travelTimePerJunction)"
                      :key="v[0]"
                      class="text-white grid grid-cols-6 px-1"
                    >
                      <div class="border-b col-span-3">
                        <button
                          @click="selectCrossName(v[0])"
                          class="hover:text-blue-200"
                        >
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
                      <svg
                        class="animate-spin h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
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
              <div class="">
                <div>
                  <div
                    class="tracking-wide px-2 font-bold text-center text-white flex justify-between items-center"
                  >
                    <div class="flex space-x-1 text-sm">
                      <div class="bg-gray-800 p-1 px-2">
                        <button @click.prevent="currentTab = 'total'">
                          전체 평균통과시간
                        </button>
                      </div>
                      <div class="bg-gray-600 p-1 px-2">
                        <button
                          @click.prevent="
                            currentTab = '';
                            selectCrossName(selectedNode);
                          "
                        >
                          {{ selectedNode }}
                        </button>
                      </div>
                    </div>
                    <div class="bg-gray-700 px-2">
                      <button
                        @click="isShowAvgTravelChart = !isShowAvgTravelChart"
                        class="text-sm"
                      >
                        닫기
                      </button>
                    </div>
                  </div>

                  <div v-if="currentTab === 'total'" class="">
                    <div
                      class="text-white bg-gray-800 p-1"
                      v-if="chart.travelTimeChartInView"
                    >
                      <line-chart
                        :chartData="chart.travelTimeChartInView"
                        :options="lineChartOption({})"
                        :height="220"
                      />
                    </div>
                    <div class="text-white bg-gray-700 p-5 font-bold" v-else>
                      <div class="flex items-center">
                        <svg
                          class="animate-spin h-8 w-8 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <!-- <div class="text-md text-white pl-3">데이터 확인중...</div> -->
                      </div>
                    </div>
                  </div>
                  <div v-else class="bg-gray-600">
                    <div class="grid grid-cols-4 gap-1">
                      <div class="col-span-3 py-1">
                        <div class="bg-gray-700 text-center text-white">
                          <div
                            class="text-white p-1 h-60"
                            v-if="chart.travelTimeJunctionChart"
                          >
                            <line-chart
                              :chartData="chart.travelTimeJunctionChart"
                              :options="lineChartOption({})"
                              :height="220"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="relative py-1">
                        <div
                          class="text-white items-center bg-gray-700 flex-none"
                        >
                          <div
                            ref="actionvis"
                            class="mx-auto w-80 h-60  p-2 max-w-xs"
                          ></div>
                        </div>
                        <div class="absolute top-2 left-2">
                          <div class="text-white text-sm">
                            {{ selectedNode }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- <div class="text-white items-center">
              <div class="bg-gray-500 mb-1 p-1 text-center">신호시스템</div>
              <div class="text-center bg-gray-800">{{ selectedNode || '교차로를 선택하세요' }}</div>
              <div ref="actionvis" class="w-84 h-96 bg-gray-800 p-3">
              </div>
            </div> -->
            </div>
          </transition>
        </div>
        <!-- 평균 통과시간 그래프 END -->

        <div
          class="absolute bottom-0 right-2 bg-gray-700 px-2"
          v-if="!isShowAvgTravelChart"
        >
          <button
            @click="isShowAvgTravelChart = true"
            class="text-sm text-white"
          >
            그래프
          </button>
        </div>

        <div v-if="showWaitingMsg" class="absolute top-24 w-full">
          <div class="flex justify-center">
            <div
              class="border rounded text-center bg-blue-300 p-5 text-xl font-bold flex items-center space-x-1 justify-center w-92"
            >
              <svg
                class="animate-spin h-16 w-16 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div>
                실행 준비 중입니다. 잠시후 실행 됩니다.
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
    <div class="flex justify-between bg-gray-800 items-center p-1">
      <div class="text-center text-white px-2 text-xs">
        <span class="text-yellow-200">{{ simulation.id }}</span>
        <span class="text-blue-200">{{ statusText }}</span>
      </div>
      <div class="flex space-x-1 items-center text-xs text-white">
        <div
          v-if="status === 'running'"
          class="text-center px-3 uppercase w-full"
        >
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <div v-else class="px-2 uppercase w-full text-white">
          <span class="text-blue-200">상태: {{ status }}</span>
        </div>
      </div>
    </div>

    <!-- MODAL WINDOW -->
    <b-modal
      size="md"
      :title="simulation.id"
      ref="optenvmodal"
      header-border-variant="dark"
      header-bg-variant="dark"
      header-text-variant="light"
      body-bg-variant="dark"
      body-text-variant="light"
      body-border-variant="dark"
      footer-bg-variant="dark"
      hide-footer
      header-class="pt-1 pb-0 rounded-0"
    >
      <div class="text-white text-sm p-2 min-w-max">
        <div class="border-blue-600 space-y-1">
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-gray-500 px-1 rounded">지역</div>
            <div class="w-20">{{ config.region }}</div>
          </div>
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-gray-500 px-1 rounded">
              보상함수
            </div>
            <div class="w-40">{{ config.rewardFunc }}</div>
            <div class="w-20 text-center bg-gray-500 px-1 rounded">
              통계주기
            </div>
            <div>{{ config.period }}<span>초</span></div>
          </div>
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-gray-500 px-1 rounded">Method</div>
            <div class="w-40">{{ config.method }}</div>
            <div class="w-20 text-center bg-gray-500 px-1 rounded">Action</div>
            <div>{{ config.action }}</div>
          </div>
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-gray-500 px-1 rounded">
              대상교차로
            </div>
            <div>{{ simulation.configuration.junctionId }}</div>
          </div>
          <div class="flex space-x-1">
            <div class="w-20 text-center bg-gray-500 px-1 rounded">시간</div>
            <div>{{ config.fromTime }} ~ {{ config.toTime }}</div>
          </div>
          <div class="flex space-x-1 items-center">
            <div class="w-20 text-center bg-gray-500 px-1 rounded">
              실행이미지
            </div>
            <div class="">{{ simulation.configuration.dockerImage }}</div>
          </div>
        </div>
      </div>
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
