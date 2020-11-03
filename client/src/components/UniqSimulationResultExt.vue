<template>
  <b-card
    text-variant="light"
    bg-variant="dark"
    border-variant="dark"
    no-body
  >
  <b-card-body class="pb-1">
    <b-card-title>
      {{ simulation.id }}
    </b-card-title>
    <ul>
      <li>주기: {{ period / 60}}분</li>
      <li>시작: {{ configuration.fromDate }} {{ configuration.fromTime }}</li>
      <li>종료: {{ configuration.toDate }} {{ configuration.toTime }}</li>
    </ul>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  name: 'uniq-simulation-result-ext',
  props: {
    simulation: Object,
  },
  computed: {
    period() {
      return this.simulation.configuration.period
    },
    configuration() {
      return this.simulation.configuration
    }
  }
}
</script>
