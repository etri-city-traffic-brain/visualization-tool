<template>
  <div>
    <div class="fixed z-50 h-16 left-20 top-20 space-y-1">
      <div class="bg-gray-600 text-white text-center font-bold py-1">
        {{ id }}
      </div>
      <div class="">
        <button class="bg-gray-600 text-white px-1 rounded" @click="toggleTod">T-OD <input type="checkbox" v-model="showTod"/></button>
        <button class="bg-blue-600 text-white px-1 rounded" @click="toggleLinksFrom">TRIP 출발 <input type="checkbox" v-model="showLinkFrom"/> </button>
        <button class="bg-red-600 text-white px-1 rounded" @click="toggleLinksTo">TRIP 도착 <input type="checkbox" v-model="showLinkTo"/> </button>
        <button class="bg-gray-600 text-white px-1 rounded" @click="startTripVisualization">가시화 시작</button>

      </div>
      <div class="flex space-x-1 items-center">
        <input type="range" max="24" :value="currentStep" @change="onStepChanged" @input="onInput"></input>
        <div class="text-lg font-bold bg-indigo-100 rounded-lg px-1">{{ currentStep.toString().padStart(2,'0') }}:00</div>
      </div>
      <div>
        <b-btn size="sm" @click="previous">이전</b-btn>
        <b-btn size="sm" @click="next">다음</b-btn>
      </div>
    </div>
    <div class="fixed z-50 inset-auto h-full top-60" v-if="showLoading">
      <div class="w-screen p-2 flex justify-center">
        <div class="flex justify-center space-x-2 bg-gray-100- p-5 text-xl font-bold rounded-xl w-92">
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
            <div>
              {{ message }}
            </div>
            <div>
              <button @click="showLoading=false">닫기</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative">
      <div
        :ref="mapId"
        :id="mapId"
        :style="{ height: mapHeight + 'px' }"
        class=""
      >
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
   background-color: #053a5f;
   border-radius: 0.5rem;
   height: 0.5rem;
}

/* slider thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
   appearance: none;
   margin-top: -12px; /* Centers thumb on the track */

   /*custom styles*/
   background-color: #5cd5eb;
   height: 2rem;
   width: 1rem;
}

input[type="range"]:focus::-webkit-slider-thumb {
  border: 1px solid #053a5f;
  outline: 3px solid #053a5f;
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
   border: none; /*Removes extra border that FF applies*/
   border-radius: 0; /*Removes default border-radius that FF applies*/

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

</style>
