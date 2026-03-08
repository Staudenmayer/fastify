<template>
  <v-app>
    <v-main>
			<component :is="layoutsPerPath[$route.path] ?? defaultLayout">
			  <router-view />
			</component>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
//import '@/composables/otel.ts';
import defaultLayout from '@/layouts/defaultLayout.vue';
import blank from '@/layouts/blank.vue';
import { ref, type Component } from 'vue';
import { publicPaths } from '@/middleware/global';

const layoutsPerPath = ref<{ [key: string]: Component }>({});
for (const publicPath of publicPaths) {
	layoutsPerPath.value[publicPath] = blank;
}
</script>
