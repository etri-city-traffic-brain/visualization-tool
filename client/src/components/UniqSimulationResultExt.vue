<template>
  <b-card
    bg-variant="secondary"
    text-variant="light"
    class="p-2 ml-1 mr-1"
    no-body
  >
    <h5> <b-badge variant="secondary"> {{ simulation.id }} </b-badge> </h5>
    <h5> <b-badge variant="secondary"> {{ simulation.configuration.period / 60}}분 주기 </b-badge> </h5>
    <h5> <b-badge>시작:</b-badge><b-badge>{{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} </b-badge> </h5>
    <h5> <b-badge>종료:</b-badge><b-badge>{{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }} </b-badge> </h5>
  </b-card>
</template>

<script>
export default {
  name: 'uniq-simulation-result-ext',
  props: {
    simulation: Object,
  },
  data() {
    return {
    }
  }
}
</script>
