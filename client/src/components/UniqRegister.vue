<template>
  <div class="">
    <div
      class="grid- grid-cols-2 gap-2 p-3 bg-gray-600 text-white font-bold space-y-1"
    >
      <div class="flex space-x-2 items-center">
        <div class="flex-none w-40 text-right">ID</div>
        <b-form-input
          autofocus
          id="envName"
          v-model="envName"
          focus
          select
          size="sm"
        ></b-form-input>
      </div>
      <!-- <div class="flex space-x-2 items-center">
        <div class="flex-none w-40 text-right">아이디</div>
        <b-form-input autofocus id="id" v-model="id" size="sm"></b-form-input>
      </div> -->
      <div class="flex space-x-2 items-center">
        <div class="flex-none w-40 text-right">설명</div>
        <b-form-input
          id="description"
          v-model="description"
          size="sm"
        ></b-form-input>
      </div>
      <div class="flex space-x-2">
        <div class="flex-none w-40 text-right">시뮬레이션 시간</div>
        <!-- <div class="flex items-center space-x-2"> -->
        <!-- <div class="flex-none text-white font-bold">시작</div> -->
        <b-input-group>
          <b-form-input v-model="fromDate" type="date" size="sm" />
          <b-form-input v-model="fromTime" type="time" size="sm" />
        </b-input-group>
        <!-- </div> -->
        <!-- <div class="flex items-center space-x-2"> -->
        <!-- <div class="flex-none text-white font-bold">종료</div> -->
        <b-input-group>
          <b-form-input v-model="toDate" type="date" size="sm" />
          <b-form-input v-model="toTime" type="time" size="sm" />
        </b-input-group>
        <!-- </div> -->
      </div>

      <div class="flex space-x-2 items-center">
        <div class="flex-none w-40 text-right">지역</div>
        <b-input-group>
          <b-form-select
            v-model="areaSelected"
            :options="areaOptions"
            size="sm"
            @change="regionChanged(areaSelected)"
          />
        </b-input-group>
      </div>
      <div class="flex space-x-2 items-center" v-if="intersectionField">
        <div class="flex-none w-40 text-right">대상 교차로</div>
        <b-input-group>
          <b-form-input
            id="junctionId"
            v-model="junctionId"
            size="sm"
          ></b-form-input>
          <b-input-group-append>
            <b-btn
              :pressed="showMap"
              variant="primary"
              class="ml-1"
              @click="showMap = !showMap"
              size="sm"
              >선택</b-btn
            >
          </b-input-group-append>
        </b-input-group>
      </div>

      <div class="flex space-x-2 items-center">
        <div class="flex-none w-40 text-right">도커 이미지</div>
        <b-form-select v-model="dockerImage" :options="imageOptions" />
      </div>
      <div class="flex space-x-2 items-center">
        <div class="flex-none w-40 text-right">Center</div>
        <div>
          {{ center }}
        </div>
      </div>
    </div>
    <transition name="slide-fade-">
      <div v-if="showMap">
        <!-- <signal-map
          :region="areaSelected"
          v-on:junction:select="selectJunction"
          @selection:finished="selectionFinished"
        >
        </signal-map> -->
        <junction
          class=""
          @selection:finished="selectionFinished"
          :height="600"
          groupSelection="true"
        />
      </div>
    </transition>

    <div class="bg-gray-600 mt-2 text-white p-2">
      <div class="grid grid-cols-4 gap-2 p-2">
        <div class="bg-gray-700 rounded text-center p-1">
          통계주기
          <b-form-select
            v-model="periodSelected"
            :options="periodOptions"
            class=""
            size="sm"
          />
        </div>

        <div class="bg-gray-700 rounded text-center p-1">
          가시화주기
          <b-form-select
            v-model="intervalSelected"
            :options="intervalOptions"
            class=""
            size="sm"
          />
        </div>

        <div v-if="epochField" class="bg-gray-700 rounded text-center p-1">
          에포크
          <b-form-input v-model="epoch" type="number" size="sm"></b-form-input>
        </div>
        <div v-if="epochField" class="bg-gray-700 rounded text-center p-1">
          모델저장주기
          <b-form-input
            v-model="modelSavePeriod"
            type="number"
            min="1"
            size="sm"
          ></b-form-input>
        </div>
        <div class="bg-gray-700 rounded text-center p-1">
          모델
          <b-form-select
            v-model="methodOptionSelected"
            :options="methodOptions"
            class=""
            size="sm"
          />
        </div>
        <div class="bg-gray-700 rounded text-center p-1">
          상태
          <b-form-select
            v-model="stateOptionSelected"
            :options="stateOptions"
            class=""
            size="sm"
          />
        </div>

        <div class="bg-gray-700 rounded text-center p-1">
          액션
          <b-form-select
            v-model="actionOptionSelected"
            :options="actionOptions"
            class=""
            size="sm"
          />
        </div>

        <div class="bg-gray-700 rounded text-center p-1">
          보상함수
          <b-form-select
            v-model="rewardFuncOptionSelected"
            :options="rewardFuncOptions"
            class=""
            size="sm"
          />
        </div>
      </div>
    </div>

    <b-card
      bg-variant="dark"
      text-variant="light"
      border-variant="dark"
      class="mt-1"
    >
      <b-card-text class="text-right">
        <b-button class="mr-1" @click="register" variant="primary">
          저장 <b-spinner small label="Spinning" v-if="loading"></b-spinner>
        </b-button>
        <b-button class="mr-1" @click="hide" variant="secondary">
          닫기
        </b-button>
      </b-card-text>
    </b-card>

    <b-modal
      title="최적화 등록"
      id="create-simulation-modal"
      ref="signal-map"
      size="xl"
      header-border-variant="dark"
      header-bg-variant="dark"
      header-text-variant="light"
      body-bg-variant="dark"
      body-text-variant="ligth"
      body-border-variant="dark"
      header-class="pt-2 pb-0"
      hide-footer
      style="border-radius:0"
    >
      <!-- <SignalEditor v-on:junction:select="selectJunction"/> -->
    </b-modal>
  </div>
</template>

<script src="./uniq-register"></script>

<style scoped>
.no-border-radius {
  border-radius: 10px;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to

/* .slide-fade-leave-active below version 2.1.8 */
 {
  transform: translateX(10px);
  opacity: 0;
}
</style>
