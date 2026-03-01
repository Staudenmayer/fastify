import { resolve } from 'path';
import { defineConfig } from 'electron-vite';
import config from './config';
export default defineConfig({
	main: {
		build: { lib: { entry: resolve('src/electron/main/index.ts') } },
	},
	preload: {
		build: { lib: { entry: resolve('src/electron/preload/index.ts') } },
	},
	renderer: {
		// If your index.html is at project root:
		root: resolve('.'),
		build: {
			rollupOptions: {
				input: resolve('index.html'),
			},
		},

		// Critical for file:// builds:
		base: './',
		...config,
	},
});
