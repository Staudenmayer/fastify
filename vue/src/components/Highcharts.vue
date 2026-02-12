<template>
	<highcharts
		class="h-100"
		:options="$props.options"
	/>
</template>

<script lang="ts" setup>
import { setThemeWatcher } from '@/helpers/highcharts';

setThemeWatcher();

defineProps<{
	options: Highcharts.Options;
}>();
</script>
