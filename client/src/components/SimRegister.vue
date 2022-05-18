<template>
  <div class="">
    <div class="space-y-2 bg-gray-600 p-2 rounded-lg mb-1">
      <div class="flex space-x-2 text-white">
        <div class="">
          <div class=""> 시뮬레이션 ID: </div>
          <input autofocus id="id" v-model="id" focus select class="border rounded px-1 text-black">
        </div>
        <div class="">
          <div class="">설명:</div>
          <input id="description" v-model="description" class="border rounded px-1 text-black">
        </div>
      </div>
      <div class="flex space-x-2 text-white">
        <div class="">
          <div class="">시작날짜:</div>
          <div class="text-black">
            <input v-model="fromDate" type="date" class="border rounded px-1"/>
          </div>
        </div>
        <div class="">
          <div class="">시작시간:</div>
          <div class="text-black">
            <input v-model="fromTime" type="time" class="border rounded px-1"/>
          </div>
        </div>
        <div class="">
          <div class="">종료날짜:</div>
          <div class="text-black">
            <input v-model="toDate" type="date" class="border rounded px-1"/>
          </div>
        </div>
        <div class="">
          <div class="">종료시간:</div>
          <div class="text-black">
            <input v-model="toTime" type="time" class="border rounded px-1"/>
          </div>
        </div>
      </div>
      <div class="flex text-white space-x-2">
        <div class="">
          <div class=""> 통계주기 </div>
          <b-form-select class="" v-model="periodSelected" :options="periodOptions" size="sm"/>
        </div>
        <div class="">
          <div class="">가시화주기</div>
          <b-form-select v-model="intervalSelected" :options="intervalOptions" size="sm"/>
        </div>
        <div class="flex-grow">
          <div>이미지</div>
          <b-form-input v-model="dockerImage" type="text" size="sm" class="w-max"/>
        </div>
      </div>
    </div>
    <div class="mt-2 bg-gray-600 rounded-lg p-2">
      <div class="text-white font-bold p-2">
        시뮬레이션 지역 선택
        <button @click="selectRegion" class="bg-yellow-500 rounded text-sm text-black px-1">선택도구</button>
        <button @click="checkExtent" class="bg-yellow-500 rounded text-sm text-black px-1">확인</button>
      </div>
      <div
        :ref="mapId"
        :id="mapId"
        :style="{height: '500px'}"
        class="map"
      />
    </div>

    <b-card bg-variant="dark" text-variant="light" border-variant="dark" class="mt-1">
      <b-card-text class="text-right">
        <b-button class="mr-1" @click="register" variant="primary">
          저장 <b-spinner small label="Spinning" v-if="loading"></b-spinner>
        </b-button>
        <b-button class="mr-1" @click="hide" variant="secondary">
          닫기
        </b-button>
      </b-card-text>
    </b-card>

    <b-modal title="최적화 등록" id="create-simulation-modal" ref="signal-map" size="xl" header-border-variant="dark"
      header-bg-variant="dark" header-text-variant="light" body-bg-variant="dark" body-text-variant="ligth"
      body-border-variant="dark" header-class="pt-2 pb-0" hide-footer style="border-radius:0">
      <!-- <SignalEditor v-on:junction:select="selectJunction"/> -->
    </b-modal>

  </div>
</template>

<script src="./sim-register"></script>

<style scoped>
.map {
    width: 100%;
  }

.no-border-radius {
  border-radius: 10px;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter,
.slide-fade-leave-to

/* .slide-fade-leave-active below version 2.1.8 */
  {
  transform: translateX(10px);
  opacity: 0;
}
</style>
