<template>
  <div>
    <div class="fixed z-50 h-16 left-20 top-20 space-y-1">
      <div class="bg-gray-600 text-white text-center font-bold py-1">
        {{ id }}
      </div>
      <div class="bg-indigo-50">
        <b-btn @click="toggleTod">T-OD <input type="checkbox" v-model="showTod"/></b-btn>
        <b-btn @click="toggleLinksFrom">TRIP 출발링크 <input type="checkbox" v-model="showLinkFrom"/> </b-btn>
        <b-btn @click="toggleLinksTo">TRIP 도착링크 <input type="checkbox" v-model="showLinkTo"/> </b-btn>
        <b-btn @click="startTripVisualization">트립가시화</b-btn>

      </div>
      <div class="flex space-x-1 items-center">
        <b-form-input type="range" max="24" :value="currentStep" @change="onStepChanged" @input="onInput"></b-form-input>
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

<style></style>
