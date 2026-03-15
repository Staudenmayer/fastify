<template>
	<v-card class="p-2 pointer-events-auto w-[25rem]">
		<v-text-field v-model="search" label="Search" variant="outlined" hide-details></v-text-field>
	</v-card>
</template>
<script setup lang="ts">
const search = defineModel<string>('search', { default: '' });
</script>
