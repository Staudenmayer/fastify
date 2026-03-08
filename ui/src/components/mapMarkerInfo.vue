<template>
	<v-card
		v-if="selectedCameraInfo"
		class="absolute right-0 top-0 m-4"
		style="z-index: 11; width: 20dvw"
	>
		<v-card-title class="flex items-center justify-between">
			<span class="truncate">{{ selectedCameraInfo.title || selectedCameraInfo.name }}</span>
			<div class="flex gap-1">
				<v-btn
					icon="mdi-crosshairs-gps"
					variant="text"
					size="small"
					@click="$emit('focus')"
				/>
				<v-btn
					icon="mdi-close"
					variant="text"
					size="small"
					@click="$emit('close')"
				/>
			</div>
		</v-card-title>
		<v-card-text>
			<div>Webcam ID: {{ selectedCameraInfo.webcamId }}</div>
			<div>{{ selectedCameraInfo.location?.city }}, {{ selectedCameraInfo.location?.region }}</div>
			<div>{{ selectedCameraInfo.location?.country }}</div>
			<div>Lat: {{ selectedCameraInfo.location?.latitude }}</div>
			<div>Lon: {{ selectedCameraInfo.location?.longitude }}</div>
			<div class="pt-5"></div>
			<v-img
				v-if="selectedCameraInfo.images?.current.preview && !selectedPlayerUrl"
				:src="selectedPreviewUrl"
				class="border-0 rounded"
			></v-img>
			<iframe
				v-if="selectedPlayerUrl"
				:src="selectedPlayerUrl"
				title="Camera player"
				class="w-full mt-3 border-0 rounded"
				height="220"
				allowfullscreen
			></iframe>
		</v-card-text>
	</v-card>
</template>

<script setup lang="ts">
type SelectedCameraInfo = {
	id: string;
	name?: string;
	webcamId?: number;
	title?: string;
	location?: {
		city?: string;
		region?: string;
		country?: string;
		latitude?: number;
		longitude?: number;
	};
	images?: {
		current: {
			preview: string;
		};
	};
	[key: string]: unknown;
};

defineProps<{
	selectedCameraInfo: SelectedCameraInfo | null;
	selectedPreviewUrl?: string;
	selectedPlayerUrl?: string;
}>();

defineEmits<{
	focus: [];
	close: [];
}>();
</script>
