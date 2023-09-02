<template>
  <div class="relative">
    <div :ref="mapId" :id="mapId" :style="{ height: mapHeight + 'px' }" class="map" />

    <div class="absolute right-2 top-16 bg-indigo-300 w-48 rounded px-1" v-if="groupSelection">
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
        <button @click.prevent="finishTlSelection" class="bg-blue-300 text-white rounded px-2 hover:bg-blue-500">
          선택완료
        </button>
      </div>
    </div>

    <div class="absolute left-2 top-2 bg-gray-700 p-1 rounded-lg text-black text-sm" style="max-width:660px">
      <div class="text-right px-1 p-2 font-bold ">
        <button class="bg-indigo-200 rounded px-1 hover:bg-indigo-500 hover:text-white font-bold" @click="hide = !hide"
          v-if="!hide">
          X
        </button>
        <button class="bg-indigo-200 rounded px-1  hover:bg-indigo-500 hover:text-white" @click="hide = !hide" v-else>
          교차로 조회
        </button>
      </div>
      <div v-if="!hide">
        <div class="p-0 flex items-center space-x-1">
          <select type="select" v-model="type" class="border" style="height:34px">
            <option v-for="o in typeOptions" :key="o.value" :value="o.value">
              {{ o.text }}
            </option>
          </select>
          <select type="select" v-model="nodeId" class="border" style="height:34px" v-if="type === 'group'">
            <option v-for="c of groupOptions" :key="c" :value="c">{{
              c
            }}</option>
          </select>
          <input @keyup.enter="getTL(nodeId)" v-model="nodeId" class="px-2 border" style="height:34px" />
          <select type="select" v-model="color" class="p-1 border" style="height:34px">
            <option v-for="c of colorOptions" :key="c.value" :value="c.value">
              <span>{{ c.text }}</span>
            </option>
          </select>
          <!-- <button
            @click="addNode(nodeId)"
            class="px-1 bg-blue-300 text-black"
            style="height:34px"
          >
            추가
          </button> -->
          <button @click="getTL(nodeId)" class="px-2 bg-blue-400 text-white font-bold" style="height:34px">
            조회
          </button>
        </div>

        <div class="p-2 overflow-auto text-white" style="max-height:calc(80vh)">
          <div v-for="v of selected" :key="v.id" class="flex space-x-1 justify-between mb-1">
            <div :class="'bg-' + v.color + '-200 text-black'" class="rounded w-16 px-1">
              {{ v.groupId || "" }}
            </div>

            <div class="w-40 truncate" :title="v.id">{{ v.id }}</div>
            <div class="w-40 truncate">{{ v.name }}</div>
            <button class="px-1 text-black text-sm rounded bg-gray-300" @click="del(v.id, v.groupId)"
              :style_="{ 'background-color': '#' + v.color }">
              X
            </button>
            <button class="px-1 text-sm rounded" @click="animate(v.id)" :style="{ 'background-color': '#' + v.color }">
              위치확인
            </button>
            <button class="px-1 text-black text-sm rounded bg-gray-200" @click="addTlGroup(v.groupId)">
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./junction-view.js"></script>
