<template>
  <b-modal
    title="시뮬레이션 등록"
    id="create-simulation-modal"
    ref="create-simulation-modal"
    size="lg"
    header-border-variant="dark"
    header-bg-variant="dark"
    header-text-variant="light"
    body-bg-variant="dark"
    body-text-variant="ligth"
    body-border-variant="dark"
    hide-footer
    header-class="pt-2 pb-0"
  >
    <b-card class="p-0 m-0" >
      <b-form-group label-cols-sm="3" label="User ID" label-class="text-sm-right" label-for="userId">
        <b-form-input autofocus id="userId" v-model="userId" disabled></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="Simulation ID" label-class="text-sm-right" label-for="id">
        <b-form-input autofocus id="id" v-model="id"></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="Description" label-class="text-sm-right" label-for="description">
        <b-form-input id="description" v-model="description"></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="Region" label-class="text-sm-right">
        <b-input-group>
        <b-form-select v-model="areaSelected" :options="areaOptions" @change="selectArea" />
      <!-- </b-form-group>
      <b-form-group label-cols-sm="3" label="파티션" label-class="text-sm-right"> -->
        <b-form-select v-model="partitionSelected" :options="partitionOptions" class="ml-2"></b-form-select>
        </b-input-group>
      </b-form-group>
      <b-form-group
        label="From"
        label-cols-sm="3"
        label-class="text-sm-right"
        label-for="date"
      >
        <b-input-group>
          <b-form-input v-model="fromDate" type="date"/>
          <b-form-input v-model="fromTime" type="time" class="ml-2"/>
        </b-input-group>
      </b-form-group>
      <b-form-group
        label="To"
        label-cols-sm="3"
        label-class="text-sm-right"
        label-for="begineHour"
      >
        <b-input-group>
          <b-form-input v-model="toDate" type="date"/>
          <b-form-input v-model="toTime" type="time" class="ml-2"/>
        </b-input-group>
      </b-form-group>

      <b-form-group label-cols-sm="3" label="Period" label-class="text-sm-right" label-for="Period">
        <b-form-select v-model="periodSelected" :options="periodOptions" class="mb-3" />
      </b-form-group>

      <b-form-group label-cols-sm="6" label-class="text-sm-right" label-for="Period" v-if="status === 'ready'">
        <b-button class="mr-1" @click="save" variant="dark" >
          시뮬레이션 등록
        </b-button>
        <b-button class="mr-1" @click="hide" variant="dark" >
          닫기
        </b-button>
      </b-form-group>
      </b-card>
    <!-- </b-card> -->
    <b-alert
      :variant="variant"
      class="mt-1 text-center"
      :show="status === 'running' || status === 'error'"
    >
      <b-spinner small />
      {{ msg.toUpperCase() }}
    </b-alert>
  </b-modal>
</template>

<script src="./simulation-creation">

</script>

<style scoped>
 .no-border-radius {
   border-radius: 10px;
 }
</style>
