<template>
	<v-card class="p-2 pointer-events-auto w-[25rem]">
		<v-autocomplete
			v-model="selected"
			v-model:search="search"
			:items="results"
			item-title="display_name"
			return-object
			label="Search"
			variant="outlined"
			hide-details
			no-filter
		>
		<template v-if="!results.length" #no-data>
			<div></div>
		</template>
	</v-autocomplete>
	</v-card>
</template>

<script setup lang="ts">
import { getSearch, type NominatimSearchResponse } from '@/apis/nominatim';
import { watch, ref } from 'vue';

const search = defineModel<string>('search', { default: '' });
const selected = defineModel<NominatimSearchResponse | null>('selected');

const results = ref<NominatimSearchResponse[]>([]);

watch(search, async (newVal) => {
	if (!newVal) {
		results.value = [];
		return;
	}

	results.value = await getSearch({ q: newVal });
});
</script>
