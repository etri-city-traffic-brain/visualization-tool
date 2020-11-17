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
      <li>주기: {{ period / 60}} 분</li>
      <li>시작: {{ configuration.begin }} ({{ configuration.fromTime }})</li>
      <li>종료: {{ configuration.end }} ({{ configuration.toTime }})</li>
      <li>주기: {{ configuration.period }} sec</li>
      <li>Epoch: {{ configuration.epoch }} 회</li>
      <li>JunctionId: {{ configuration.junctionId }} 회</li>
      <li>스크립트: {{ configuration.script }} 회</li>
      <li>시각화주기: {{ configuration.interval }} step</li>


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
