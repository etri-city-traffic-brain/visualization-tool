<template>
  <div class="">
    <b-card bg-variant="secondary" text-variant="light" no-body class="pr-2 pt-2">
      <b-form-group v-if="showEnv" label-cols-sm="3" label="환경명" label-class="text-sm-right" label-for="envName">
        <b-form-input autofocus id="envName" v-model="envName" focus select></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="시뮬레이션 ID" label-class="text-sm-right" label-for="id">
        <b-form-input autofocus id="id" v-model="id" focus select></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="설명" label-class="text-sm-right" label-for="description">
        <b-form-input id="description" v-model="description"></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="지역" label-class="text-sm-right">
        <b-input-group>
          <b-form-select v-model="areaSelected" :options="areaOptions" />
        </b-input-group>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="교차로" label-class="text-sm-right" label-for="id" v-if="intersectionField">
        <b-input-group>
          <b-form-input id="junctionId" v-model="junctionId"></b-form-input>
          <b-input-group-append>
            <!-- <b-btn variant="dark" class="ml-1" @click="openSignalMap">선택</b-btn> -->
            <b-btn :pressed="showMap" variant="success" class="ml-1" @click="showMap = !showMap">선택</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
    </b-card>
    <transition name="slide-fade">
      <div v-if="showMap">
        <signal-map v-on:junction:select="selectJunction" @selection:finished="selectionFinished">
        </signal-map>
      </div>
    </transition>
    <b-card bg-variant="secondary" border-variant="dark" text-variant="light" no-body class="pr-2 pt-3 mt-1">
      <b-form-group label="시뮬레이션 시작" label-cols-sm="3" label-class="text-sm-right" label-for="date">
        <b-input-group>
          <b-form-input v-model="fromDate" type="date" />
          <b-form-input v-model="fromTime" type="time" class="ml-2" />
        </b-input-group>
      </b-form-group>
      <b-form-group label="시뮬레이션 종료" label-cols-sm="3" label-class="text-sm-right" label-for="begineHour">
        <b-input-group>
          <b-form-input v-model="toDate" type="date" />
          <b-form-input v-model="toTime" type="time" class="ml-2" />
        </b-input-group>
      </b-form-group>

    </b-card>

    <div class="bg-gray-500 pr-2 pt-2 mt-1 text-white pb-2">
      <div class="grid grid-cols-5 space-x-1 pl-5 mb-2">
        <div label-cols-sm="4" label="스크립트" label-class="">
          <!-- 스크립트 -->
          <!-- <b-form-select v-model="scriptSelected" :options="scriptOptions" /> -->
        </div>
        <div>
          통계주기
          <b-form-select v-model="periodSelected" :options="periodOptions" class="" />
        </div>

        <div>
          가시화주기
          <b-form-select v-model="intervalSelected" :options="intervalOptions" class="" />
        </div>

        <div v-if="epochField">
          Epoch(*)
          <b-form-input v-model="epoch" type="number"></b-form-input>
        </div>
        <div v-if="epochField">
          모델저장주기(*)
          <b-form-input v-model="modelSavePeriod" type="number" min="1"></b-form-input>
        </div>
      </div>

      <div class="flex space-x-1 mt-1 pl-5 mb-2 items-center">
        <div class="flex-shrink-0 w-36 text-right">이미지</div>
        <b-form-input v-model="dockerImage" type="text" class="ml-1" />
      </div>
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

<script src="./uniq-register">

</script>

<style scoped>
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
