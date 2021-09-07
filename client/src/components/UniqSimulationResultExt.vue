<template>

<div>
  <div class="bg-gray-500 rounded-lg p-2 m-2">
    <b-badge variant="dark">{{ configuration.fromTime }}</b-badge> ~
    <b-badge variant="dark">{{ configuration.toTime }}</b-badge>
    <b-badge variant="dark">스크립트: {{ configuration.script }}</b-badge>
    <b-badge variant="dark"> {{ period / 60}} 분</b-badge>
  </div>
</div>
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
