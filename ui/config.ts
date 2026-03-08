import VueRouter from 'unplugin-vue-router/vite';
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { UserConfig } from 'vite';

import { viteStaticCopy } from 'vite-plugin-static-copy';
const cesiumSource = 'node_modules/cesium/Build/Cesium';
// This is the base url for static files that CesiumJS needs to load.
// Set to an empty string to place the files at the site's root path
const cesiumBaseUrl = 'cesiumStatic';


export default {
  plugins: [
		VueRouter(),
		tailwindcss(),
		Vue({
  	  template: { transformAssetUrls },
  	}), // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
  	Vuetify({
  	  autoImport: true,
  	  styles: {
  	    configFile: 'src/styles/settings.scss',
  	  },
  	}),
		Fonts({
  	  fontsource: {
  	    families: [
  	      {
  	        name: 'Roboto Mono',
  	        weights: [400, 700],
  	      },
  	      {
  	        name: 'Roboto',
  	        weights: [100, 300, 400, 500, 700, 900],
  	        styles: ['normal', 'italic'],
  	      },
  	    ],
  	  },
  	}),
		viteStaticCopy({
			targets: [
				{ src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
				{ src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
				{ src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
				{ src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl },
			],
		}),
	],
	optimizeDeps: {
		exclude: [
			'vuetify',
			'vue-router',
			'unplugin-vue-router/runtime',
			'unplugin-vue-router/data-loaders',
			'unplugin-vue-router/data-loaders/basic'
		],
		include: [
			'cesium',
			'highcharts',
		]
	},
  define: {
		'process.env': {},
		CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
	},
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:3031',
				changeOrigin: true,
				secure: false,
				ws: false,
				rewrite: (path: string) => path.replace(/^\/api/, ''),
			},
		},
	},
} as UserConfig;
