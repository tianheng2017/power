import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const postcssPlugin = [autoprefixer(), tailwindcss()]

export default defineConfig({
    plugins: [
		uni(),
		Components({
			resolvers: [
				VantResolver()
			],
		}),
	],
    css: {
        postcss: {
            plugins: postcssPlugin
        }
    },
    resolve: {
        alias: {
            process: "process/browser",
            stream: "stream-browserify",
            zlib: "browserify-zlib",
            util: 'util'
        }
    },
})
