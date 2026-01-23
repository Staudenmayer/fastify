<template>
  <v-card variant="tonal">
    <highcharts :options="chartOptions" />
  </v-card>
</template>

<script lang="ts" setup>
  import { setThemeWatcher } from '@/helpers/highcharts'

  setThemeWatcher()

  const chartOptions = ref({

    title: {
      text: 'U.S Solar Employment Growth',
      align: 'left',
    },

    subtitle: {
      text: 'By Job Category. Source: <a href="https://irecusa.org/programs/solar-jobs-census/" target="_blank">IREC</a>.',
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
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointStart: 2010,
      },
    },

    series: [{
      name: 'Installation & Developers',
      data: [
        43_934, 48_656, 65_165, 81_827, 112_143, 142_383,
        171_533, 165_174, 155_157, 161_454, 154_610, 168_960, 171_558,
      ],
    }, {
      name: 'Manufacturing',
      data: [
        24_916, 37_941, 29_742, 29_851, 32_490, 30_282,
        38_121, 36_885, 33_726, 34_243, 31_050, 33_099, 33_473,
      ],
    }, {
      name: 'Sales & Distribution',
      data: [
        11_744, 30_000, 16_005, 19_771, 20_185, 24_377,
        32_147, 30_912, 29_243, 29_213, 25_663, 28_978, 30_618,
      ],
    }, {
      name: 'Operations & Maintenance',
      data: [
        null, null, null, null, null, null, null,
        null, 11_164, 11_218, 10_077, 12_530, 16_585,
      ],
    }, {
      name: 'Other',
      data: [
        21_908, 5548, 8105, 11_248, 8989, 11_816, 18_274,
        17_300, 13_053, 11_906, 10_073, 11_471, 11_648,
      ],
    }],

    responsive: {
      rules: [{
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
      }],
    },
  })
</script>
