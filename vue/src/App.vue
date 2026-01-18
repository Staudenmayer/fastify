<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  //instanciate this here for otel to load properly
  import '@/composables/otel.ts';
</script>
