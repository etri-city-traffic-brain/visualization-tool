<template>
  <div class="relative">
    <div
      :ref="mapId"
      :id="mapId"
      :style="{ height: mapHeight + 'px' }"
      class="map"
    />
    <div
      class="fixed left-2 top-16 bg-gray-50 text-black "
      style="max-width:600px"
    >
      <div class="bg-indigo-100 text-right px-1 p-2 font-bold">
        <button
          class="bg-indigo-200 rounded px-1 hover:bg-indigo-500 hover:text-white font-bold"
          @click="hide = !hide"
          v-if="!hide"
        >
          교차로 추가
        </button>
        <button
          class="bg-indigo-200 rounded px-1  hover:bg-indigo-500 hover:text-white"
          @click="hide = !hide"
          v-else
        >
          X
        </button>
      </div>
      <div v-if="hide">
        <div class="bg-blue-200 p-2 flex items-center space-x-1">
          <select type="select" v-model="type" class="" style="height:34px">
            <option v-for="o in typeOptions" :key="o.value" :value="o.value">
              {{ o.text }}
            </option>
          </select>
          <select
            type="select"
            v-model="nodeId"
            class="p-1"
            style="height:34px"
            v-if="type === 'group'"
          >
            <option v-for="c of groupOptions" :key="c" :value="c">{{
              c
            }}</option>
          </select>
          <input v-model="nodeId" class="px-2" style="height:34px" />
          <select type="select" v-model="color" class="p-1" style="height:34px">
            <option v-for="c of colorOptions" :key="c.value" :value="c.value">{{
              c.text
            }}</option>
          </select>
          <button
            @click="addNode(nodeId)"
            class="px-1 bg-blue-300 text-black"
            style="height:34px"
          >
            추가
          </button>
        </div>
        <div class="p-2 overflow-auto" style="max-height:calc(80vh)">
          <div
            v-for="v of selected"
            :key="v.id"
            class="flex space-x-1 justify-between mb-1"
          >
            <div
              :class="'bg-' + v.color + '-200 text-black'"
              class="rounded w-16 px-1"
            >
              {{ v.groupId || "" }}
            </div>

            <div class="w-40 truncate" :title="v.id">{{ v.id }}</div>
            <div class="w-40 truncate">{{ v.name }}</div>
            <button
              :class="'bg-' + v.color + '-200 text-black'"
              class="bg-red-300 px-1 text-black text-sm rounded"
              @click="del(v.id, v.groupId)"
            >
              X
            </button>
            <button
              :class="'bg-' + v.color + '-200 text-black'"
              class="bg-red-300 px-1 text-black text-sm rounded"
              @click="animate(v.id)"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./junction-view.js"></script>
