<template>
  <div>
    <v-btn @click="count++">Count {{ count }}</v-btn>
  </div>
</template>

<script setup lang="ts">
  const count = ref(0)
</script>
