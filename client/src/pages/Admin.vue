<template>
  <div class="container space-y-1">
    <div class="text-center text-white text-xl p-2">
      UNIQ-VIS 관리
    </div>

    <div class="bg-gray-700 p-5 text-white space-y-1" v-if="!isLoggedIn">
      <div>
        <div>ID</div>
        <div><input class="text-black rounded" type="text" v-model="auth.id"/></div>
      </div>
      <div>
        <div>비밀번호</div>
        <div><input  class="text-black rounded" type="password" v-model="auth.password"/></div>
      </div>
      <div>
        <button @click="login" class="bg-blue-300 p-1 rounded text-black">로그인</button>
      </div>
    </div>
    <div v-else class="space-y-2">
      <div class="bg-indigo-100 rounded p-2">
        <div class="flex space-x-1">
          <div>시뮬레이션 이미지 관리</div>
          <div>+</div>
        </div>
        <div v-for="img of simulation.images" class="flex space-x-1">
          <div class="pl-2">
            - {{ img }}
          </div>
          <a href="#" class="px-1 rounded-full hover:bg-red-500 hover:text-white">x</a>
        </div>
      </div>

      <div class="bg-indigo-100 rounded p-2">
        <div class="flex space-x-1">
          <div>신호최적화 이미지 관리</div>
          <div>+</div>
        </div>
        <div v-for="img of optimization.images" class="flex space-x-1 items-center">
          <div class="pl-2">
            - {{ img }}
          </div>
          <a href="#" class="px-1 rounded-full hover:bg-red-500 hover:text-white">x</a>

        </div>
      </div>

      <div class="bg-gray-700 rounded p-2">
        <div class="flex space-x-1 text-white">
          <div>수요파일 관리</div>
          <div><a href="#" class="px-1 rounded-lg hover:bg-blue-300" @click="showRoutesDialog">+</a></div>
        </div>
        <div class="grid gap-3 p-4 text-sm sm:grid-cols-2 md:grid-cols-3">
          <div v-for="img of routes" class="flex justify-between space-x-1 items-center bg-blue-100 p-2 rounded-lg">
            <div class="">
              <div>{{ img.name }}({{ img.day }})</div>
              <div>{{ img.startTime }} ~ {{ img.endTime }}</div>
            </div>
            <a href="#" class="flex items-center justify-center text-center rounded-full bg-blue-400 text-white hover:bg-yellow-200 hover:pointer hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </a>

          </div>
          <div class="text-white">
            <div>
              <a href="#" @click="showRoutesDialog" class="hover:border-blue-500 hover:border-solid hover:bg-white hover:text-blue-500 group w-full flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-sm leading-6 text-slate-900 font-medium py-3">
                <svg class="group-hover:text-blue-500 mb-1 text-slate-400" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1Z" />
                </svg>
                수요파일 등록
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-700 rounded p-2 text-white">
        <div class="flex space-x-1">
          <div>교통시뮬레이션 시나리오 관리</div>
          <div>+</div>
        </div>
        <div>
          <ul class="text-black bg-slate-50 p-4 sm:px-8 sm:pt-6 sm:pb-8 lg:p-4 xl:px-8 xl:pt-6 xl:pb-8 grid grid-cols-4 gap-4 text-sm leading-6">
            <li class="flex flex-col bg-blue-50 p-2 justify-center rounded-lg" v-for="s in simulation.scenario">
              <div class="">
                지역: {{ s.region }}
              </div>
              <div>
                {{ s.startTime }} ~ {{ s.endTime }}
              </div>
            </li>
            <li class="flex">
              <a href="#" class="hover:border-blue-500 hover:border-solid hover:bg-white hover:text-blue-500 group w-full flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-sm leading-6 text-slate-900 font-medium py-3">
                <svg class="group-hover:text-blue-500 mb-1 text-slate-400" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1Z" />
                </svg>
                시나리오 등록
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-gray-700 rounded p-2 text-white">
        <div class="flex space-x-1">
          <div>신호최적화 시나리오 관리</div>
          <div>+</div>
        </div>
        <div>
          <ul class="bg-slate-50 p-4 sm:px-8 sm:pt-6 sm:pb-8 lg:p-4 xl:px-8 xl:pt-6 xl:pb-8 grid grid-cols-4 gap-4 text-sm leading-6">
            <li class="text-black flex flex-col bg-blue-50 p-2 justify-center rounded-lg" v-for="s in optimization.scenario">
              <div class="">
                지역: {{ s.region }}
              </div>
              <div>
                {{ s.startTime }} ~ {{ s.endTime }}
              </div>
            </li>
            <li class="flex">
              <a href="#" class="hover:border-blue-500 hover:border-solid hover:bg-white hover:text-blue-500 group w-full flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-sm leading-6 text-slate-900 font-medium py-3">
                <svg class="group-hover:text-blue-500 mb-1 text-slate-400" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1Z" />
                </svg>
                시나리오 등록
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <b-modal title="수요파일 등록" ref="reg-routes" header-border-variant="dark"
      header-bg-variant="dark"
      header-text-variant="light"
      body-bg-variant="dark"
      body-text-variant="ligth"
      body-border-variant="dark"
      header-class="pt-2 pb-0 no-border-round"
      size="lg"
      hide-footer
    >
      <div class="space-y-1 bg-gray-700- mx-1 bg-gray-50 rounded p-3">
        <div class="space-y-1">
          <div class="">이름: <input class="border rounded" v-model="cRoute.name"/></div>
          <div>시간: <input class="border rounded" type="time" v-model="cRoute.startTime"/> ~ <input class="border rounded" type="time" v-model="cRoute.endTime"/></div>
          <div>파일: <input type="file"/></div>
        </div>
      </div>

      <div class="flex justify-end p-1 space-x-1">
        <b-btn @click="hideDialog('reg-routes')">취소</b-btn>
        <b-btn>저장</b-btn>
      </div>
    </b-modal>
  </div>
</template>

<script src="./admin.js"></script>
