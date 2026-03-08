<template>
	<highcharts
		class="h-100"
		:options="$props.options"
	/>
</template>

<script lang="ts" setup>
import * as HighchartsLib from 'highcharts';
import type { Options as HighchartsOptions } from 'highcharts';
import { watch } from 'vue';
import { type ThemeDefinition, useTheme } from 'vuetify';

function applyHighchartsVuetifyTheme(current: ThemeDefinition) {
	const theme = current;
	if (!theme.colors) {
		return;
	}

	const colors = theme.colors;
	const primary = colors.primary as string;
	const surface = colors.surface as string;
	const onSurface = colors['surface-variant'] as string;
	const border = colors['on-surface-variant'] as string;
	const surfaceLight = colors['surface-light'] as string;
	const success = colors.success as string;
	const warning = colors.warning as string;
	const error = colors.error as string;

	const chartOptions: HighchartsOptions = {
		chart: {
			backgroundColor: undefined,
			plotBackgroundColor: undefined,
			plotBorderColor: undefined,
			plotShadow: undefined,
			style: {
				fontFamily:
					'Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
			},
		},
		plotOptions: {
			series: {
				borderColor: surface,
			},
			column: {
				borderColor: surface,
			},
			pie: {
				dataLabels: {
					style: {
						color: onSurface,
						textOutline: 'none',
						fontWeight: '500',
					},
				},
			},
		},
		title: {
			style: {
				color: onSurface,
				fontWeight: '500',
			},
		},
		xAxis: {
			lineColor: border,
			labels: { style: { color: onSurface } },
		},
		yAxis: {
			gridLineColor: surfaceLight,
			labels: { style: { color: onSurface } },
			title: { style: { color: onSurface } },
		},
		legend: {
			itemStyle: { color: onSurface },
		},
		colors: [primary, success, warning, error],
		credits: {
			enabled: false,
		},
	};

	HighchartsLib.setOptions(chartOptions);

	for (const chart of HighchartsLib.charts) {
		if (!chart) {
			continue;
		}

		chart.update(chartOptions, true);
	}
}

const { current } = useTheme();
applyHighchartsVuetifyTheme(current.value);
watch(current, (value) => {
	applyHighchartsVuetifyTheme(value);
});

defineProps<{
	options: HighchartsOptions;
}>();
</script>
