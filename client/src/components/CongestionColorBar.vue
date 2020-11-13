<template>
  <b-button-group>
    <b-button
      v-for="(value, id) in congestionColor.domain()"
      v-bind:key="id"
      :style="{'background-color': congestionColor(value),}"
      size="sm"
    >
      {{ value }}
    </b-button>

    <!-- <b-button size="sm" variant="danger" class="ml-1">막힘(~15km)</b-button> -->
    <!-- <b-button size="sm" variant="warning">정체(16~30km)</b-button> -->
    <!-- <b-button size="sm" variant="success">워활(31km~)</b-button> -->

  </b-button-group>
</template>

<script>
import congestionColor from '@/utils/colors';
export default {
  name: 'uniq-congestion-color-bar',
  props: {
    size: 'small'
  },
  data() {
    return {
      congestionColor,
    }
  }
}
</script>
