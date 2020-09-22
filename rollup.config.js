import typescript from 'rollup-plugin-typescript2'
import nodeResolve from '@rollup/plugin-node-resolve'
import scss from 'rollup-plugin-scss'
import replace from '@rollup/plugin-replace'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import copy from 'rollup-plugin-copy'
import {cleandir} from 'rollup-plugin-cleandir'
import generateHtml from './lib/generate-html'
import {terser} from 'rollup-plugin-terser'


const HTML_TITLE = 'VoteDoc'
const DEST = './dist'

const production = !process.env.ROLLUP_WATCH

export default {
    input: './src/index.tsx',
    output: {
        dir: DEST,
        format: 'iife',
        entryFileNames: production ? 'app.[hash].js' : 'app.js',
        sourcemap: production ? false : 'inline'
    },
    external: [],
    plugins: [
        replace({
            values: {
                'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
                'process.env.PUBLIC_URL': JSON.stringify('https://example.com')
            },
            preventAssignment: true
        }),
        scss({
            output: (style) => global.generatedStyle = style,
            outputStyle: production ? 'compressed' : 'nested',
            watch: 'src/sass'
        }),
        production && cleandir(DEST),
        nodeResolve({
            modules: true,
            jsnext: true
        }),
        typescript(),
        copy({
            targets: [
                {src: 'src/assets/*', dest: 'dist/'},
                {src: 'src/static/*', dest: 'dist/static/'},
                //{src: 'src/html/index.html', dest: 'dist/'}
            ]
        }),
        generateHtml('src/html/index.html', 'index.html', { htmlTitle: HTML_TITLE }),
        terser(),
        !production &&
        (serve({
            contentBase: DEST,
            open: false,
            host: 'localhost',
            port: 3000,
        }), livereload({
            watch: 'dist',
        }))
    ]
}
