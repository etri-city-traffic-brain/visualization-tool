<template>
  <div class="space-y-2 bg-gray-600 p-3 rounded-lg mb-1">
    <div class="text-white font-bold">기본정보</div>
    <div class="p-1 space-y-1 grid grid-cols-2">
      <div class="flex space-x-2 text-white items-center">
        <div class="p-1 w-40 text-black bg-gray-300 rounded uppercase font-bold">아이디</div>
        <input class="p-1 flex-1 border rounded px-1 text-black w-full" autofocus id="id" v-model="id" focus select />
      </div>
      <div>
        &nbsp;
      </div>
      <div class="flex space-x-2 text-white items-center">
        <div class="p-1 w-40 text-black bg-gray-300 rounded uppercase font-bold">설명</div>
        <input class="flex-1 border rounded p-1 text-black w-full" id="description" v-model="description" />
      </div>
      <div>&nbsp;</div>
      <div class="flex space-x-2 text-white items-center">
        <div class="p-1 w-40 text-black bg-gray-300 rounded uppercase font-bold">대상지역</div>
        <div class="flex w-32">
          <b-form-select v-model="region" :options="regionOptions" size="sm"></b-form-select>
        </div>
      </div>
    </div>

    <div :ref="mapId" :id="mapId" class="map" :style="{
        height: '500px'

      }"></div>

    <div class="p-2 space-y-2">
      <div class="text-white font-bold ">
        환경변수
        <button v-if="isEnvShow" @click="isEnvShow = !isEnvShow">-</button>
        <button v-else @click="isEnvShow = !isEnvShow">+</button>
      </div>
      <div class="grid grid-cols-2 gap-1" v-if="isEnvShow">
        <div v-for="key of Object.keys(env)" :key="key" class="flex space-x-2">
          <div class="px-1 w-40 text-black bg-gray-300 rounded uppercase font-bold">{{  key }}</div>
          <input v-model="env[key]" class="flex-1 border rounded px-1 w-max" />
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
