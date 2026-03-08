<template>
				<v-btn
				:icon="current.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
				size="x-large"
				variant="text"
				@click="toggleTheme"
			/>
</template>
<script setup lang="ts">
import { useTheme } from 'vuetify';

const { toggle, current } = useTheme();

function toggleTheme() {
	toggle();
}
</script>
