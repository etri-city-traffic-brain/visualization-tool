<template>
  <div class="space-y-2 bg-gray-600 p-3 rounded-lg mb-1">
    <div class="p-1 space-y-1">
      <div class="flex space-x-2 text-white">
        <div class="w-28 text-right">아이디</div>
        <input autofocus id="id" v-model="id" focus select class="border rounded px-1 text-black" />
      </div>
      <div class="flex space-x-2 text-white">
        <div class="flex-none w-28 text-right">설명</div>
        <input id="description" v-model="description" class="border rounded px-1 text-black w-full" />
      </div>
    </div>

    <!-- <div class="flex space-x-2">
      <div class="flex space-x-2 text-white items-center">
        <div class="text-sm w-28 text-right">시작</div>
        <div class="flex space-x-2-">
          <div class="text-black">
            <input v-model="fromTime" type="time" class="border rounded px-1" />
          </div>
        </div>
      </div>
      <div class="flex space-x-2 text-white items-center">
        <div class="text-sm">종료</div>
        <div class="text-black">
          <input v-model="toTime" type="time" class="border rounded px-1" />
        </div>
      </div>
    </div> -->

    <div class="p-2 space-y-2">
      <div class="text-white font-bold">환경변수</div>
      <div class="grid grid-cols-2 gap-1">
        <div v-for="[key, value] in Object.entries(env)" :key="key" class="flex space-x-2">
          <div class="px-1 text-black w-40 bg-gray-300 rounded uppercase font-bold">{{  key }}</div>
          <input v-model="value" class="border rounded px-1 w-full" />
        </div>
      </div>
    </div>

    <div class="mt-1">
      <div class="text-right">
        <b-button class="mr-1" @click="save" variant="primary">
          저장 <b-spinner small label="Spinning" v-if="loading"></b-spinner>
        </b-button>
        <b-button class="mr-1" @click="hide" variant="secondary">
          닫기
        </b-button>
      </div>
    </div>
  </div>
</template>

<script src="./route-register"></script>

<style scoped>

</style>
