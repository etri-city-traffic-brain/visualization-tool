<template>
  <div>
    <div class="fixed z-50 inset-auto h-full top-60" v-if="showWaitingMsg">
      <div class="w-screen p-2 flex justify-center">
        <div class="flex justify-center space-x-2 bg-blue-300 p-5 text-xl font-bold rounded-lg w-92">
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
