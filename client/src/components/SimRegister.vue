<template>
  <div class="">
    <div class="space-y-2 bg-gray-600 p-3 rounded-lg mb-1">
      <!-- <div class="flex space-x-2 text-white"> -->
      <div class="flex space-x-2 text-white">
        <div class="w-28 text-right">아이디</div>
        <input
          autofocus
          id="id"
          v-model="id"
          focus
          select
          class="border rounded px-1 text-black"
        />
      </div>
      <!-- </div> -->
      <div class="flex space-x-2 text-white">
        <div class="flex-none w-28 text-right">설명</div>
        <input
          id="description"
          v-model="description"
          class="border rounded px-1 text-black w-full"
        />
      </div>

      <div class="flex space-x-2">
        <div class="flex space-x-2 text-white items-center">
          <div class="text-sm w-28 text-right">시작</div>
          <div class="flex space-x-2-">
            <!-- <div class="text-black">
              <input
                v-model="fromDate"
                type="date"
                class="border rounded px-1"
              />
            </div> -->
            <div class="text-black">
              <input
                v-model="fromTime"
                type="time"
                class="border rounded px-1"
              />
            </div>
          </div>
        </div>
        <div class="flex space-x-2 text-white items-center">
          <div class="text-sm">종료</div>
          <!-- <div class="text-black">
            <input v-model="toDate" type="date" class="border rounded px-1" />
          </div> -->
          <div class="text-black">
            <input v-model="toTime" type="time" class="border rounded px-1" />
          </div>
        </div>
      </div>

      <div class="flex space-x-2">
        <div class="flex text-white space-x-2 items-center">
          <div class="flex-none text-sm w-28 text-right">통계주기</div>
          <b-form-select
            class=""
            v-model="periodSelected"
            :options="periodOptions"
            size="sm"
          />
        </div>
        <div class="flex text-white space-x-2 items-center">
          <div class="flex-none text-sm">가시화주기</div>
          <b-form-select
            v-model="intervalSelected"
            :options="intervalOptions"
            size="sm"
          />
        </div>
      </div>

      <div class="flex text-white space-x-2 items-center">
        <div class="flex-none text-sm w-28 text-right">대상지역</div>
        <div class="flex">
          <b-form-select
            v-model="areaType"
            :options="areaTypeOptions"
            size="sm"
          ></b-form-select>
        </div>
        <div v-if="areaType === 'region'">
          <b-form-select
            v-model="regionSelected"
            :options="regionOptions"
            size="sm"
          />
        </div>
        <div v-else>지도에서 선택하세요</div>
      </div>

      <div class="flex text-white space-x-2 items-center">
        <div class="flex-none text-sm w-28 text-right">시뮬레이션 타입</div>
        <b-form-select
          v-model="simulationTypeSelected"
          :options="simulationTypeOptions"
          size="sm"
        />
      </div>

      <div class="flex space-x-2 items-center">
        <div class="flex-none text-white text-sm w-28 text-right">이미지</div>
        <b-form-select
          v-model="dockerImage"
          :options="getDockerImage()"
          size="sm"
        />
        <!-- <b-form-input v-model="dockerImage" type="text" size="sm" class="w-max"/> -->
      </div>
    </div>

    <!-- Select Micro Simulation Area -->
    <!-- :style="{ height: simulationTypeSelected === 'multi' ? '500px' : '0px' }" -->
    <div
      class="mt-2 bg-gray-600 rounded-lg p-2"
      :style="{
        height:
          areaType === 'area' || simulationTypeSelected === 'multi'
            ? '500px'
            : '1px'
      }"
    >
      <div class="text-white font-bold p-2 flex items-center space-x-1">
        <!-- <div> 마이크로 시뮬레이션 지역 선택 </div> -->
        <!-- <button @click="setMesoRegion" class="bg-yellow-500 rounded text-sm text-black px-1" > Meso 영역선택 </button> -->
        <!-- <button @click="setMicroRegion" class="bg-yellow-500 rounded text-sm text-black px-1" > 마이크로 영역선택 </button> -->
      </div>
      <!-- :style="{ height: simulationTypeSelected === 'multi' ? '500px' : '1px' }" -->
      <div
        :ref="mapId"
        :id="mapId"
        class="map"
        :style="{
          height:
            areaType === 'area' || simulationTypeSelected === 'multi'
              ? '500px'
              : '1px'
        }"
      ></div>
    </div>

    <b-card
      bg-variant="dark"
      text-variant="light"
      border-variant="dark"
      class="mt-1"
    >
      <b-card-text class="text-right">
        <b-button class="mr-1" @click="openInfobox" variant="primary">
          설정보기
        </b-button>
        <b-button class="mr-1" @click="save" variant="primary">
          저장 <b-spinner small label="Spinning" v-if="loading"></b-spinner>
        </b-button>
        <b-button class="mr-1" @click="hide" variant="secondary">
          닫기
        </b-button>
      </b-card-text>
    </b-card>

    <b-modal title="설정정보" ref="config-info" size="xl">
      <pre class="">{{ currentConfig }}</pre>
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
