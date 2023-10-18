<template>
  <div>
    <div class="fixed z-50 inset-auto h-full top-60" v-if="showWaitingMsg">
      <div class="w-screen p-2">
        <div
          class="flex justify-center space-x-2 bg-green-300 p-5 text-xl font-bold rounded-lg"
        >
          <div>
            <svg
              class="animate-spin h-8 w-8"
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
          <div>
            실행결과 분석 중...
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-600">
      <div class="">
        <div class="flex justify-between items-center p-2 border-b">
          <div class="text-white font-bold">시뮬레이션: {{ simulationId }}</div>
          <div class="text-center flex items-center space-x-1">
            <button
              class="text-sm bg-blue-200 rounded px-2 py-1 font-bold hover:bg-blue-400 hover:text-white"
              @click.stop="startSimulation()"
            >
              시작<b-icon icon="caret-right-fill" />
            </button>
            <button
              class="text-sm bg-blue-200 rounded px-2 py-1 font-bold hover:bg-blue-400 hover:text-white"
              @click="stop"
            >
              중지<b-icon icon="stop-fill" />
            </button>
            <button
              class="text-sm bg-blue-200 rounded px-2 py-1 font-bold hover:bg-blue-400 hover:text-white"
              @click="updateSimulation"
            >
              상태확인
            </button>
            <div class="text-sm bg-blue-400 p-1 rounded-lg">
              <span
                class="text-sm uppercase"
                v-if="simulation.status === 'running'"
              >
                <div class="flex space-x-2 items-center">
                  <svg
                    class="animate-spin h-5 w-5 text-white"
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
                  <div>{{ progress }} %</div>
                </div>
              </span>
              <span
                class="text-sm uppercase font-bold text-white px-2"
                v-else
                >{{ simulation.status }}</span
              >
            </div>
          </div>
        </div>
        <div class="p-2 text-white flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <span class="text-md"> 지역</span>
            <span class="text-md bg-gray-700 px-3 rounded-lg">{{
              getRegionName(config.region) || "사용자지정"
            }}</span>
            <!-- <span class="text-md"> 시간</span> -->
            <span class="text-md bg-gray-700 px-3 rounded-lg"
              >{{ config.fromTime }} ~ {{ config.toTime }}</span
            >
            <!-- <span class="font-bold bg-gray-500 p-1 rounded">실행 상태</span> -->
          </div>
          <div class="flex">
            <button
              class="font-bold bg-blue-300 px-2 rounded text-black hover:bg-blue-400 hover:text-white"
              @click="showModal"
            >
              결과보기
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="pb-1" v-if="simulation.error">
      <div class="break-normal bg-red-200 rounded text-black p-2 w-full">
        <div v-for="line in simulation.error.split(':')" :key="line">
          {{ line }}
        </div>
      </div>
    </div>

    <div class="relative">
      <div
        :ref="mapId"
        :id="mapId"
        :style="{ height: mapHeight + 'px' }"
        class=""
      />
      <div class="w-40 p-1 absolute bottom-2 right-24">
        <UniqCongestionColorBar />
      </div>
      <div class="absolute top-3 bg-gray-700 p-1 ml-1 rounded">
        <uniq-map-changer :map="map" />
        <button
          class="bg-gray-600 text-white text-xs p-1 rounded hover:bg-blue-400 hover:text-black"
          @click="centerTo"
        >
          처음위치
        </button>
      </div>
      <div class="absolute bottom-2 flex justify-center items-center w-full">
        <div class="bg-gray-600 rounded">
          <div class="">
            <div class="" v-if="simulation.status === 'finished'">
              <div class="px-1 flex items-center">
                <div class="w-64 flex items-center px-2">
                  <b-form-input
                    v-if="simulation.status === 'finished'"
                    variant="dark"
                    type="range"
                    min="0"
                    szie="sm"
                    :max="slideMax"
                    :value="currentStep"
                    @change="onChange"
                    @input="onInput"
                  />
                </div>
                <div
                  class="flex justify-center space-x-1 items-center flex-none"
                  v-if="simulation.status === 'finished'"
                >
                  <b-btn size="sm" variant="dark" @click="togglePlay">
                    <b-icon
                      v-if="toggleState() === '시작'"
                      icon="play-fill"
                    ></b-icon>
                    <b-icon v-else icon="stop-fill"></b-icon>
                    {{ toggleState() }}
                  </b-btn>
                  <b-btn size="sm" variant="secondary" @click="stepBackward">
                    <b-icon icon="chevron-compact-left"
                  /></b-btn>
                  <b-btn size="sm" variant="secondary" @click="stepForward">
                    <b-icon icon="chevron-compact-right"
                  /></b-btn>
                  <b-btn size="sm" variant="secondary" disabled>
                    {{ currentStep }}</b-btn
                  >
                  <!-- {{ stepToTime(currentStep, simulation.configuration.fromTime, simulation.configuration.period) }} -->
                </div>
                <!-- <button @click="startReplay">리플레이</button> -->
                <!-- <button @click="stopReplay">리플레이 중지</button> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed left-0 bottom-20 w-full">
      <SimulationDetailsOnRunning
        v-if="simulation.status === 'running'"
        :simulation="simulation"
        :progress="progress"
        :focusData="focusData"
        :simulationId="simulationId"
        :avgSpeed="avgSpeed"
        @connect-web-socket="connectWebSocket"
        @toggle-focus-tool="toggleFocusTool"
        :logs="logs"
      >
      </SimulationDetailsOnRunning>
    </div>

    <!-- CHART OVERLAY -->
    <div v-if="isShowAvgSpeedChart && mapHeight > 500">
      <div
        class="fixed top-48 p-1 opacity-90 space-y-1 w-80"
        v-if="simulation.status === 'finished'"
      >
        <div
          class="text-white min-w-max space-y-2 bg-gray-800 p-2 rounded-lg text-sm "
        >
          <div class=" grid grid-cols-1 gap-1">
            <div class="flex space-x-1 items-center">
              <div
                class="bg-blue-300 text-black text-center font-bold rounded w-20"
              >
                지역
              </div>
              <div class="px-1 rounded">{{ getRegionName(config.region) }}</div>
            </div>
            <div class="flex space-x-1 items-center">
              <div
                class="bg-blue-300 text-black text-center font-bold rounded w-20"
              >
                통계주기
              </div>
              <div class="px-1 rounded">{{ config.period / 60 }}분</div>
              <div class="px-1 rounded">
                {{ Math.ceil((config.end - config.begin) / config.period) }}스텝
              </div>
              <!-- {{ (config.end - config.begin) / 60 }} -->
            </div>
            <div class="flex space-x-1">
              <div
                class="bg-blue-300 text-black text-center font-bold rounded w-20"
              >
                시간
              </div>
              <div class="px-1 rounded">
                {{ config.fromTime }} ~ {{ config.toTime }}
              </div>
            </div>
            <!-- <div class="flex space-x-1">
              <div class="bg-blue-300 text-black font-bold px-1 rounded w-24">대상교차로</div>
              <div class="px-1 rounded"> {{ config.junctionId }}</div>
            </div> -->
            <div class="flex space-x-1">
              <div
                class="bg-blue-300 text-black text-center font-bold rounded w-20"
              >
                이미지
              </div>
              <div class="px-1 rounded">{{ config.dockerImage }}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-1 w-full">
          <div class="bg-gray-800 rounded">
            <div class="text-center text-xs text-white pt-2">
              혼잡 분포
            </div>
            <doughnut
              class="px-2"
              :chartData="chart.pieData"
              style="height:100px"
            />
          </div>

          <div class="bg-gray-800 rounded">
            <div class="text-white text-xs text-center pt-2">
              스텝별 혼잡 분포
            </div>
            <doughnut
              class="px-2"
              :chartData="chart.pieDataStep"
              style="height:100px"
            />
          </div>
        </div>

        <div class="bg-gray-800 rounded mt-2">
          <div class="text-white text-sm text-center pt-2">
            속도분포
          </div>
          <histogram-chart
            class="bar bg-gray-800 p-2"
            :chartData="chart.histogramData"
            :height="200"
          />
        </div>

        <div class="bg-gray-800 rounded">
          <div v-if="chart.histogramDataStep !== null">
            <div class="text-white text-sm text-center pt-2">
              스텝별 속도분포
            </div>
            <histogram-chart
              class="bar bg-gray-800 p-2"
              :chartData="chart.histogramDataStep"
              :height="200"
            />
          </div>
        </div>

        <!-- <div  class="bg-gray-600 rounded h-40">
          <line-chart :chartData="chart.linkMeanSpeeds" :options="defaultOption('시각', '')" :height="220"/>
        </div> -->
      </div>
      <div
        class="fixed top-64 right-1 opacity-90 space-y-1"
        v-if="simulation.status === 'finished'"
      >
        <div class="bg-gray-700 rounded h-52 p-2">
          <line-chart
            :chartData="chart.linkSpeeds"
            :options="defaultOption()"
            :height="220"
          />
        </div>
      </div>
    </div>

    <b-modal
      title="시뮬레이션 정보"
      ref="simmodal"
      header-border-variant="dark"
      header-bg-variant="dark"
      header-text-variant="light"
      body-bg-variant="dark"
      body-text-variant="ligth"
      body-border-variant="dark"
      header-class="pt-2 pb-0 no-border-round"
      size="xl"
      hide-footer
    >
      <div class="space-y-1 bg-gray-700- mx-1">
        <div class="pb-1" v-if="simulation.error">
          <div class="break-normal bg-red-200 rounded text-black p-2 w-full">
            <div v-for="line in simulation.error.split(':')" :key="line">
              {{ line }}
            </div>
          </div>
        </div>
        <div class="text-white min-w-max space-y-2 bg-gray-600 p-2 rounded-lg">
          <div class=" grid grid-cols-2 border-blue-600 space-y-2">
            <div class="flex space-x-1 items-center">
              <div class="bg-blue-300 text-black font-bold px-1 rounded">
                지역
              </div>
              <div class="px-1 rounded">{{ getRegionName(config.region) }}</div>
            </div>
            <div class="flex space-x-1 items-center">
              <div class="bg-blue-300 text-black font-bold px-1 rounded">
                통계주기
              </div>
              <div class="px-1 rounded">{{ config.period / 60 }}분</div>
            </div>
            <div class="flex space-x-1">
              <div class="bg-blue-300 text-black font-bold px-1 rounded">
                시간
              </div>
              <div class="px-1 rounded">
                {{ config.fromTime }} ~ {{ config.toTime }}
              </div>
            </div>
            <div class="flex space-x-1">
              <div class="bg-blue-300 text-black font-bold px-1 rounded">
                스텝
              </div>
              <div class="px-1 rounded">
                {{ Math.ceil((config.end - config.begin) / config.period) }}
              </div>
            </div>
            <!-- <div class="flex space-x-1">
              <div class="bg-blue-300 text-black font-bold px-1 rounded">대상교차로</div>
              <div class="px-1 rounded"> {{ config.junctionId }}</div>
            </div> -->
            <div class="flex space-x-1">
              <div class="bg-blue-300 text-black font-bold px-1 rounded">
                이미지
              </div>
              <div class="px-1 rounded">{{ config.dockerImage }}</div>
            </div>
          </div>
        </div>
        <!-- <div class="flex items-center space-x-1" v-if="simulation.error">
          <div class="max-w-6xl break-normal bg-red-200 rounded text-black p-2">{{simulation.error }}</div>
        </div> -->

        <div
          class="mt-2 p-1 py-2 bg-gray-600 rounded-xl "
          v-if="simulation.status === 'finished'"
        >
          <line-chart
            :chartData="chart.linkMeanSpeeds"
            :options="defaultOption('시각', '')"
            :height="50"
          />
          <SimulationResult :simulationId="simulation.id" />
          <!-- <SimulationDetailsOnFinished
            :simulation="simulation"
            :simulationId="simulation.id"
            :chart="chart"
          /> -->
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script src="./simulation-result-map.js"></script>

<style></style>
