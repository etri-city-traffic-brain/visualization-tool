<template>
  <div>
    <div class="fixed z-50 h-16 right-2 top-12 space-y-1 w-max">
      <div class="text-white text-center font-bold p-1 px-2 bg-gray-500 rounded-b-xl">
        <div>{{ id }}</div>
      </div>
    </div>

    <!-- <div class="fixed z-50 h-16 left-2 top-12 space-y-1 w-full ">
      <div class="w-96 bg-indigo-50 p-5 m-auto">
        {{  status }}
      </div>
    </div> -->

    <div class="fixed z-50 h-16 left-10 top-18 space-y-1 w-max p-3">
      <div class="">
        <div class="grid grid-cols-1">
          <div class="p-1 flex items-center" v-for="(s,i) in statuses" :key="s.value">
            <div class="w-8 h-8 bg-gray-400 flex items-center justify-center text-sm font-bold">
              {{ i }}
            </div>
            <div
              class="w-40 h-8 text-sm p-1 flex items-center justify-between"
              :class="s.value === status ? 'bg-blue-200' : 'bg-gray-500 text-white'"
            >
              <div class="flex space-x-1 items-center">
                <div v-if="s.value === status" class="text-center w-full  ">
                  <span v-if="!['finished', 'ready'].includes(status)" class="animate__animated animate__flash animate__infinite">{{ s.label }}</span>
                  <span v-else>{{ s.label }}</span>
                </div>
                <div v-else>
                  {{ s.label }}
                </div>
                <div v-if="s.value === status">
                  <b-icon v-if="!['finished', 'ready'].includes(status)" icon="arrow-clockwise" animation="spin-pulse" font-scale="1.5"></b-icon>
                </div>

              </div>
              <div v-if="s.value === 'ready'" class="text-center">
                <button class="text-sm bg-blue-400 rounded text-white px-1" @click="generateRoute">수요생성</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- control bar -->
    <div v-if="status==='finished'">
    <div class="fixed z-50 left-2 bottom-4 w-full flex justify-center">
      <div class="flex items-center justify-end space-x-2 bg-gray-700 p-2 w-max rounded min-w-max">
        <div class="w-max">
          <button class="bg-gray-500 text-white px-1 rounded" @click="toggleTod">TOD <input type="checkbox"
              v-model="showTod" /></button>
          <button class="bg-blue-600 text-white px-1 rounded" @click="toggleLinksFrom">TRIP 출발 <input type="checkbox"
              v-model="showLinkFrom" /> </button>
          <button class="bg-red-600 text-white px-1 rounded" @click="toggleLinksTo">TRIP 도착 <input type="checkbox"
              v-model="showLinkTo" /> </button>
        </div>
        <div class="flex space-x-1 items-center w-96">
          <input type="range" max="24" :value="currentStep" @change="onStepChanged" @input="onInput"></input>
          <div class="text-lg font-bold bg-indigo-100 rounded-lg px-1">{{ currentStep.toString().padStart(2, '0') }}:00
          </div>
        </div>
        <div>
          <b-btn size="sm" @click="previous">이전</b-btn>
          <b-btn size="sm" @click="next">다음</b-btn>
          <b-btn size="sm" variant="primary" @click="startTripVisualization">가시화 시작</b-btn>
        </div>
      </div>

    </div>
    </div>
    <div class="fixed z-50 inset-auto h-full top-60" v-if="showLoading">
      <div class="w-screen p-2 flex justify-center">
        <div class="flex justify-center space-x-2 bg-gray-100- p-5 text-xl font-bold rounded-xl w-92">
          <div>
            <svg class="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
          </div>
          <div>
            <div>
              {{ message }}
            </div>
            <div>
              <button @click="showLoading = false">닫기</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative">
      <div :ref="mapId" :id="mapId" :style="{ height: mapHeight + 'px' }" class="">
      </div>
    </div>
  </div>
</template>

<script src="./route-vis.js"></script>

<style scoped>
/********** Range Input Styles **********/
/*Range Reset*/
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
}

/* Removes default focus */
input[type="range"]:focus {
  outline: none;
}

/***** Chrome, Safari, Opera and Edge Chromium styles *****/
/* slider track */
input[type="range"]::-webkit-slider-runnable-track {
  background-color: #5588ac;
  border-radius: 0.5rem;
  height: 0.5rem;
}

/* slider thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* Override default look */
  appearance: none;
  margin-top: -12px;
  /* Centers thumb on the track */

  /*custom styles*/
  background-color: #5cd5eb;
  height: 2rem;
  width: 1rem;
}

input[type="range"]:focus::-webkit-slider-thumb {
  border: 1px solid #7ea5c2;
  outline: 3px solid #7095af;
  outline-offset: 0.125rem;
}

/******** Firefox styles ********/
/* slider track */
input[type="range"]::-moz-range-track {
  background-color: #053a5f;
  border-radius: 0.5rem;
  height: 0.5rem;
}

/* slider thumb */
input[type="range"]::-moz-range-thumb {
  border: none;
  /*Removes extra border that FF applies*/
  border-radius: 0;
  /*Removes default border-radius that FF applies*/

  /*custom styles*/
  background-color: #5cd5eb;
  height: 3rem;
  width: 1rem;
}

input[type="range"]:focus::-moz-range-thumb {
  border: 1px solid #053a5f;
  outline: 3px solid #053a5f;
  outline-offset: 0.125rem;
}

.box {
  box-sizing: border-box;
  /* width: 400px; */
  /* height: 300px; */
  background-color: #0af;
  overflow: hidden;
  position: relative;
  box-shadow: 2px 2px 5px 0 #A3A3A3;
}
.box::before {
  content:'';
  /* width: 500px; */
  /* height: 300px; */
  opacity: 1;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 40%,
    rgba(255, 255, 255, 0.3) 60%,
    rgba(255, 255, 255, 0) 100%
  );
  transform-origin: center center;
  position: absolute;
  z-index: 10;
  animation-delay: 1s;
  animation-name: mask-ani;
  animation-duration: 5s;
  animation-iteration-count: infinite;
}
.box::after {
  content: '';
  /* width: 500px; */
  /* height: 50px; */
  opacity: 0;
  background-color: #fff;
  transform-origin: center center;
  position: absolute;
  z-index: 1;
  animation-delay: 1s;
  animation-name: mask-border-ani;
  animation-duration: 5s;
  animation-iteration-count: infinite;
}
.box img {
  width: 98%;
  vertical-align: top;
  z-index: 5;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
@keyframes mask-ani {
  0% {
    transform: rotate(-36deg) translate(-40px, -430px);
  }

  70%,
  100% {
    transform: rotate(-36deg) translate(-40px, 378px);
  }
}
@keyframes mask-border-ani {
  0% {
    opacity: 0.8;
    transform: rotate(-36deg) translate(-126px, -190px);
  }

  70%,
  100% {
    opacity: 0.8;
    transform: rotate(-36deg) translate(-126px, 355px);
  }
}
</style>
