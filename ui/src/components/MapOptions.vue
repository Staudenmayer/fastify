<template>
	<v-card class="p-2 pointer-events-auto w-[25rem]">
		<v-select
			v-model="selectedLayer"
			:items="layers"
			item-value="value"
			item-title="label"
			label="Select Google Maps Layer"
			hide-details
		></v-select>
	</v-card>
</template>
<script setup lang="ts">
const selectedLayer = defineModel<string>('layer', { default: '3d' });

const layers = [
	{ label: 'Roadmap', value: 'm' },
	{ label: 'Satellite', value: 's' },
	{ label: 'Hybrid', value: 'y' },
	{ label: '3D-Satellite', value: '3d' },
];
</script>
