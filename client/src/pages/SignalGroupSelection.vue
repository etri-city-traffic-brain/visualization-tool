<template>
  <div class="relative">
    <div :ref="mapId" :id="mapId" :style="{ height: mapHeight + 'px' }" class="map" />

    <div class="absolute left-2 top-1 w-full " v-if="!isReady">
      <div class=" rounded flex items-center justify-center">
        <div class="w-max text-center bg-blue-500 text-4xl text-white rounded p-2 px-4">
          Loading...
        </div>
      </div>
    </div>

    <div class="absolute left-2 top-1 w-48 rounded px-1 bg-gray-400" v-if="isReady">
      <div class="overflow-auto"  :style="{ height: mapHeight-30 + 'px' }">
        <button v-for="group in signalGroups" :key="group"
        @click="animate(group)"
        class="w-20 text-white text-sm p-1 rounded m-1 border"
        :style="{'background-color': getGroupColor(group)}"
        v-if="getGroupColor(group)"
        >

          <span v-if="isAdded(group)" class="flex items-center justify-center" >
            {{ group }} <input type="checkbox" checked class="ml-1"  @click.stop="delTlGroup(group)">
          </span>
          <span v-else class="flex items-center justify-center space-x-1">{{ group }}
            <input type="checkbox" class="ml-1" @click.stop="addTlGroup(group)"></span>

          </button>
      </div>
    </div>

    <div class="absolute right-2 top-32 bg-indigo-300 w-48 rounded px-1" v-if="groupSelection">
      <div class="font-bold bg-indigo-300 p-1">신호그룹 선택</div>
      <div class="bg-white rounded-lg space-y-1">
        <div v-if="targetGroups.length === 0" class="px-1">선택없음</div>
        <div v-for="g in targetGroups" :key="g">
          <div class="flex space-x-1 px-2 bg-indigo-200">
            <div class="w-40" :title="g">{{ g }}</div>
            <button @click="delTlGroup(g)" class="px-1 text-sm hover:text-white">
              X
            </button>
          </div>
        </div>
      </div>
      <div class="bg-gray-100 mt-1 text-center">
        <button class="px-2 bg-blue-300 text-white mt-1 hover:bg-blue-500 rounded text-sm " @click="showCenter">
          설정 아이콘 찾기
        </button>
        <div class="text-sm">
          신호 최적화 화면에서 기본으로 설정할 위치를 반드시 설정하세요.
        </div>
      </div>

      <div class="text-center m-2">
        <button @click.prevent="finishTlSelection" class="bg-blue-600 text-white rounded px-2 hover:bg-blue-500">
          선택완료
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./signal-group-selection.js"></script>
