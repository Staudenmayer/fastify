import * as Highcharts from 'highcharts';
import { type ThemeDefinition, useTheme } from 'vuetify'; // or inject it where appropriate

export function applyHighchartsVuetifyTheme(current: ThemeDefinition) {
	const theme = current;
	if (!theme.colors) {
		return;
	}
	const colors = theme.colors;

	const primary = colors.primary;
	const surface = colors.background;
	const onSurface = colors['surface-variant'];
	const border = colors['on-surface-variant'];

	const chartOptions = {
		chart: {
			backgroundColor: surface,
			plotBackgroundColor: surface,
			plotBorderColor: border,
			style: {
				fontFamily: 'Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
			},
		},
		plotOptions: {
			series: {
				borderColor: surface,
			},
			column: {
				borderColor: surface,
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
			gridLineColor: border,
			labels: { style: { color: onSurface } },
			title: { style: { color: onSurface } },
		},
		legend: {
			itemStyle: { color: onSurface },
		},
		colors: [primary!, colors.success!, colors.warning!, colors.error!],
		credits: {
			enabled: false,
		},
	};

	Highcharts.setOptions(chartOptions);

	for (const chart of Highcharts.charts) {
		if (!chart) {
			continue;
		}
		chart.update(chartOptions, true); // second arg = redraw
	}
}

export function setThemeWatcher() {
	const { current } = useTheme();
	applyHighchartsVuetifyTheme(current.value);
	watch(current, (value) => {
		applyHighchartsVuetifyTheme(value);
	});
}
