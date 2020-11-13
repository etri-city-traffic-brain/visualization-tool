<template>
  <b-card
    bg-variant="dark"
    text-variant="light"
    border-variant="dark"
    no-body
    class="mt-1"
  >
    <b-card-body class="p-2">
      <b-card-text class="text-center">{{ title }} </b-card-text>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  props: ['title']
}
</script>
