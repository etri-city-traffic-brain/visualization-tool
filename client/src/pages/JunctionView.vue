<template>
  <div>
    <div
      :ref="mapId"
      :id="mapId"
      :style="{height: '640px'}"
      class="map"
    />
    <div class="p-2 flex items-center space-x-1">
      <select type="select" v-model="type" class="" style="height:34px">
        <option v-for="o in typeOptions" :key="o.value" :value="o.value">
          {{ o.text }}
        </option>
      </select>
      <input v-model="nodeId" class="px-2" style="height:34px">
      <select type="select" v-model="color" class="p-1" style="height:34px">
        <option v-for="c of colors" :key="c">{{c}}</option>
      </select>

      <button @click="addNode(nodeId)" class="px-1 bg-indigo-100 text-black" style="height:34px">add</button>
    </div>
    <div class="p-2">
      <div v-for="v of selected" class="text-white">
        <span :class="'bg-' +v.color+ '-200 text-black'">{{ v.groupId || ''}}</span>

        <span>{{ v.id }}</span>
        {{ v.name }}
        <button class="bg-red-300 px-1 text-black text-sm" @click="del(v.id, v.groupId)"> X </button>
        <button class="bg-red-300 px-1 text-black text-sm" @click="animate(v.id)"> 확인 </button>
      </div>
    </div>
  </div>
</template>

<script src="./junction-view.js"> </script>
