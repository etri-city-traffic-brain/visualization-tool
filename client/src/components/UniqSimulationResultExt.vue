<template>
  <b-card
    text-variant="light"
    bg-variant="dark"
    border-variant="dark"
    no-body
  >
    <b-card-body>
      <!-- <b-card-title>{{ simulation.id }}</b-card-title> -->
      <b-card-sub-title class="mb-2"> &nbsp;</b-card-sub-title>
      <b-card-text>
        시뮬레이션 기간: {{ configuration.fromTime }} ~ {{ configuration.toTime }}
      </b-card-text>
      <b-card-text>
        {{ simulation.description }}
      </b-card-text>
      <b-card-text>
        스크립트: {{ configuration.script }}
      </b-card-text>
      <b-card-text>
        주기: {{ period / 60}} 분
      </b-card-text>
      <b-card-text>
        시각화 주기: {{ configuration.interval }} step
      </b-card-text>
      <b-card-text class="small text-muted">
        {{ simulation.started }} ~ {{ simulation.ended }}
      </b-card-text>
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
