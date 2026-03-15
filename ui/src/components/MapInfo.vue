<template>
	<v-card class="p-2 pointer-events-auto w-[25rem]" :variant="visible ? 'elevated' : 'plain'">
	</v-card>
</template>
<script setup lang="ts">
const visible = defineModel<boolean>('visible', { default: false });
</script>
