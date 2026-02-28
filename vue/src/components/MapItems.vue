<template>
	<v-text-field
		v-model="search"
		label="Search"
		variant="outlined"
	></v-text-field>
	<v-expansion-panels
		v-model="panel"
		multiple
	>
		<v-expansion-panel
			v-for="panel in panels"
			:key="panel.value"
			:value="panel.value"
		>
			<template #title>
				<v-icon>{{ panel.icon }}</v-icon>
				<div class="pl-5">{{ panel.title }}</div>
			</template>
			<template #text>
				<div
					v-for="item in panel.items"
					:key="item.webcamId"
				>
					{{ item.title }}
					<br />
					<br />
				</div>
			</template>
		</v-expansion-panel>
	</v-expansion-panels>
</template>
<script setup lang="ts">
import { useCameraData, type Camera } from '@/stores/cameras';
const cameraStore = useCameraData();

interface PanelItem extends Camera {}

type Panel = {
	title: string;
	value: string;
	icon: string;
	items: PanelItem[];
};

const search = ref('');
const panel = ref([]);
const panels = reactive<Panel[]>([
	{
		title: 'Cameras',
		value: 'cameras',
		icon: 'mdi-camera',
		items: [],
	},
	{
		title: 'Planes',
		value: 'planes',
		icon: 'mdi-airplane',
		items: [],
	},
]);

onMounted(async () => {
	await cameraStore.getWebcams();
	panels[0]?.items.push(...cameraStore.cameras);
});
</script>
