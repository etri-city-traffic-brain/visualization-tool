<template>
  <div class="p-3">
    <div class="border-2 border-gray-500 mt-2 p-2 rounded-lg min-w-max">
      <div class="p-1 flex justify-between space-x-1">
        <button
          v-b-modal.create-route-modal
          class="px-2 py-1 bg-gray-700 hover:text-indigo-200 rounded font-bold text-gray-100 flex space-x-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v12m6-6H6"
            />
          </svg>
          <div>
            수요생성 등록
          </div>
        </button>
        <div>
          <button
            class="px-2 py-1 bg-gray-700 hover:text-white rounded font-bold text-gray-100"
            @click.stop="updateTable"
          >
            새로고침
          </button>
        </div>
      </div>
      <b-table
        hover
        small
        striped
        ref="simulations-table"
        table-variant="dark"
        head-variant="dark"
        foot-variant="dark"
        :items="items"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        class="mt-1"
      >
        <template v-slot:cell(tools)="row">
           <!-- <button class="bg-gray-500 text-white rounded px-2 hover:bg-gray-700">
            수요생성
           </button> -->
          <router-link :to="{ name: 'RouteVis', params: { id: row.item.id } }">
            <button class="bg-gray-500 text-white rounded px-2 hover:bg-gray-700">
              수요생성
            </button>
          </router-link>

          <button class="bg-gray-500 rounded hover:bg-gray-700 px-1" @click.stop="remove(row.item.id)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-4 h-4 inline">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </template>
      </b-table>
    </div>

    <b-modal
      title="수요생성"
      id="create-route-modal"
      ref="create-route-modal"
      size="lg"
      header-border-variant="dark"
      header-bg-variant="dark"
      header-text-variant="light"
      body-bg-variant="dark"
      body-text-variant="ligth"
      body-border-variant="dark"
      header-class="pt-2 pb-0 no-border-round"
      body-class="p-2"
      hide-footer
    >
      <RouteRegister modalName="create-route-modal" @save="save" />
    </b-modal>
  </div>
</template>

<script src="./route-list.js"></script>
