// vite.config.js
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		copyPublicDir: false, // else vite.svg comes along
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			// name: 'ibiss-components', // this is the name that will be bound on window in browser
			fileName: 'ibiss-components'

		},
		rollupOptions: {
			// If we want to publish standalone components we don't externalize lit,
			// if you are going to use lit in your own project, you can make it a dep instead.
			//external: /^lit/, //<-- comment this line
		},
	},
});