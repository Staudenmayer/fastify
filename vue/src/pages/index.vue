<template>
	<v-container
		fluid
		class="pa-4"
	>
		<!-- Stats Row -->
		<v-row>
			<v-col
				v-for="stat in stats"
				:key="stat.title"
				cols="12"
				sm="6"
				md="4"
				lg="3"
			>
				<v-card
					class="pa-4 stat-card elevation-4"
					rounded="lg"
				>
					<v-card-title class="headline mb-2">
						{{ stat.title }}
					</v-card-title>
					<v-card-text class="text-h2 font-weight-bold text-primary">
						{{ stat.value }}
					</v-card-text>
					<v-card-subtitle class="text-caption text--secondary"> {{ stat.change }} from last month </v-card-subtitle>
				</v-card>
			</v-col>
		</v-row>

		<!-- Charts Row -->
		<v-row class="mt-6">
			<v-col
				cols="12"
				md="6"
				lg="8"
			>
				<v-card
					class="pa-6 elevation-4"
					rounded="lg"
				>
					<v-card-title> Sales Overview </v-card-title>
					<v-card-text class="text-h2 font-weight-bold text-primary pt-6">
						<Highcharts :options="chartOptions" />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col
				cols="12"
				md="6"
				lg="4"
			>
				<v-card
					class="pa-6 elevation-4 mb-6 mb-md-0"
					rounded="lg"
				>
					<v-card-title>User Growth</v-card-title>
					<v-card-text class="text-h2 font-weight-bold text-primary pt-6">
						<Highcharts :options="pieChartOptions" />
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang="ts" setup>
const stats = reactive([
	{
		title: 'Total Revenue',
		value: '$45,230',
		change: '+12.5%',
	},
	{
		title: 'Active Users',
		value: '12,450',
		change: '+8.3%',
	},
	{
		title: 'Orders Today',
		value: '1,234',
		change: '+3.2%',
	},
	{
		title: 'Conversion Rate',
		value: '4.7%',
		change: '+0.8%',
	},
]);

const chartOptions = ref<Highcharts.Options>({
	title: {
		text: undefined,
		align: 'left',
	},

	subtitle: {
		text: undefined,
		align: 'left',
	},

	yAxis: {
		title: {
			text: 'Number of Employees',
		},
	},

	xAxis: {
		accessibility: {
			rangeDescription: 'Range: 2010 to 2022',
		},
	},

	legend: {
		layout: 'horizontal',
		align: 'center',
		verticalAlign: 'bottom',
	},

	plotOptions: {
		series: {
			label: {
				connectorAllowed: false,
			},
			pointStart: 2010,
		},
	},

	series: [
		{
			name: 'Installation & Developers',
			data: [
				43_934, 48_656, 65_165, 81_827, 112_143, 142_383, 171_533, 165_174, 155_157, 161_454, 154_610, 168_960, 171_558,
			],
		},
		{
			name: 'Manufacturing',
			data: [24_916, 37_941, 29_742, 29_851, 32_490, 30_282, 38_121, 36_885, 33_726, 34_243, 31_050, 33_099, 33_473],
		},
		{
			name: 'Sales & Distribution',
			data: [11_744, 30_000, 16_005, 19_771, 20_185, 24_377, 32_147, 30_912, 29_243, 29_213, 25_663, 28_978, 30_618],
		},
		{
			name: 'Operations & Maintenance',
			data: [null, null, null, null, null, null, null, null, 11_164, 11_218, 10_077, 12_530, 16_585],
		},
		{
			name: 'Other',
			data: [21_908, 5548, 8105, 11_248, 8989, 11_816, 18_274, 17_300, 13_053, 11_906, 10_073, 11_471, 11_648],
		},
	],

	responsive: {
		rules: [
			{
				condition: {
					maxWidth: 500,
				},
				chartOptions: {
					legend: {
						layout: 'horizontal',
						align: 'center',
						verticalAlign: 'bottom',
					},
				},
			},
		],
	},
});

const pieChartOptions = ref<Highcharts.Options>({
	chart: {
		type: 'pie',
	},
	title: {
		text: undefined,
	},
	subtitle: {
		text: undefined,
	},
	legend: {
		layout: 'horizontal',
		align: 'center',
		verticalAlign: 'bottom',
		itemStyle: {
			fontSize: '12px',
		},
	},
	tooltip: {
		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})',
	},
	plotOptions: {
		pie: {
			allowPointSelect: true,
			cursor: 'pointer',
			dataLabels: {
				enabled: true,
				format: '{point.name}: {point.percentage:.1f}%',
				style: {
					fontWeight: 'bold',
					textOutline: '0px',
				},
			},
			showInLegend: true,
		},
	},
	series: [
		{
			name: 'User Demographics',
			colorByPoint: true,
			data: [
				{
					name: 'Desktop Users',
					y: 45,
					sliced: true,
					selected: true,
				},
				{
					name: 'Mobile Users',
					y: 35,
				},
				{
					name: 'Tablet Users',
					y: 12,
				},
				{
					name: 'Other Devices',
					y: 8,
				},
			],
		},
	],
	responsive: {
		rules: [
			{
				condition: {
					maxWidth: 500,
				},
				chartOptions: {
					legend: {
						layout: 'horizontal',
						align: 'center',
						verticalAlign: 'bottom',
					},
				},
			},
		],
	},
});
</script>
