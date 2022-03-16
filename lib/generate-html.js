import {readFileSync} from "fs"
import {minify} from 'html-minifier'

const MINIFY_OPTIONS = {
    collapseWhitespace: true,
    removeOptionalTags: true
}

export default function generateHtml(inPath, outFile, env = {}) {
    return {
        name: 'generate-html',
        generateBundle(_, bundle) {
            env.jsFileName = Object.values(bundle)[0].fileName
            env.styleSheet = global.generatedStyle
            const template = readFileSync(inPath).toString()
            const output = Function(`"use strict"; return \`${template}\``).call(env)
            this.emitFile({
                type: 'asset',
                fileName: outFile,
                source: minify(output, MINIFY_OPTIONS)
            })
        }
    }
}
