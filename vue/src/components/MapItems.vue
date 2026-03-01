<template>
	<div class="map-items d-flex flex-column h-100">
		<div class="map-items__header d-flex flex-column ga-2">
			<div class="d-flex ga-2">
				<v-btn
					icon="mdi-chevron-left"
					variant="elevated"
					size="large"
					class="rounded-lg pa-2"
					color="primary"
					@click="emit('close')"
				></v-btn>
				<v-select
					:model-value="selectedLayer"
					:items="layers"
					item-value="value"
					item-title="label"
					label="Select Google Maps Layer"
					density="compact"
					hide-details
					class="flex-grow-1"
					@update:model-value="emit('update:selectedLayer', $event as string)"
				></v-select>
				<v-btn
					icon="mdi-compass"
					variant="elevated"
					size="large"
					class="rounded-lg pa-2"
					color="primary"
					@click="emit('click:reset-position')"
				></v-btn>
			</div>
			<v-text-field
				v-model="search"
				label="Search"
				variant="outlined"
				class="flex-grow-1"
			></v-text-field>
		</div>
		<v-expansion-panels
			v-model="panel"
			multiple
			class="map-items__groups"
		>
			<v-expansion-panel
				v-for="panel in panels"
				:key="panel.value"
				:value="panel.value"
			>
				<template #title>
					<v-switch
						v-if="panel.value === 'cameras'"
						:model-value="webcamsEnabled"
						color="primary"
						hide-details
						@click.stop
						@mousedown.stop
						@keydown.stop
						@update:model-value="emit('update:webcamsEnabled', $event as boolean)"
					></v-switch>
					<v-icon class="pl-5">{{ panel.icon }}</v-icon>
					<div class="pl-5">{{ panel.title }}</div>
				</template>
				<template #text>
					<div
						v-if="panel.value === 'cameras' && panel.items.length === 0"
						class="text-medium-emphasis"
					>
						No cameras found in the current map view.
					</div>
					<div
						v-for="item in panel.items"
						:key="item.webcamId"
						class="d-flex align-center justify-space-between py-2"
					>
						<div class="text-body-2 text-truncate pr-2">
							{{ item.title || `Camera ${item.webcamId ?? ''}` }}
						</div>
						<v-btn
							icon="mdi-crosshairs-gps"
							variant="text"
							size="small"
							@click.stop="emit('click:focus-camera', item)"
						></v-btn>
					</div>
				</template>
			</v-expansion-panel>
		</v-expansion-panels>
	</div>
</template>
<script setup lang="ts">
type CameraItem = {
	webcamId?: number;
	title?: string;
	[key: string]: unknown;
};

const props = defineProps<{
	layers: { label: string; value: string }[];
	selectedLayer: string;
	webcamsEnabled: boolean;
	cameraItems: CameraItem[];
}>();
const emit = defineEmits<{
	(e: 'close'): void;
	(e: 'update:selectedLayer', value: string): void;
	(e: 'update:webcamsEnabled', value: boolean): void;
	(e: 'click:reset-position'): void;
	(e: 'click:focus-camera', value: CameraItem): void;
}>();

type Panel = {
	title: string;
	value: string;
	icon: string;
	items: CameraItem[];
};

const search = ref('');
const panel = ref([]);
const panels = computed<Panel[]>(() => [
	{
		title: 'Cameras',
		value: 'cameras',
		icon: 'mdi-camera',
		items: props.cameraItems,
	},
	{
		title: 'Planes',
		value: 'planes',
		icon: 'mdi-airplane',
		items: [],
	},
]);
</script>

<style scoped>
.map-items {
	min-height: 0;
}

.map-items__header {
	position: sticky;
	top: 0;
	z-index: 1;
	background-color: rgb(var(--v-theme-surface));
	padding-bottom: 8px;
}

.map-items__groups {
	flex: 1 1 auto;
	min-height: 0;
	overflow-y: auto;
}
</style>
