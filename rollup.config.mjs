import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss';
import banner from 'rollup-plugin-banner2';
import { createGenerateScopedName } from 'hash-css-selector';
import pkg from './package.json' assert {type: 'json'}

export default {
    input: 'src/index.ts',
    treeshake: true,
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: false,
            strict: false
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: false,
        },
    ],
    plugins: [
        filesize(),
        typescript({
            tsconfig: './tsconfig.json',
            exclude: ["**/__tests__", "**/*.stories.*"]
        }),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env', '@babel/preset-react'],
            extensions: ['.js'],
            exclude: 'node_modules/**',
        }),
        postcss({
            extract: true,
            modules: { generateScopedName: createGenerateScopedName('me') },
            minimize: true,
        }),
        banner((chunk) => {
            if (chunk.fileName !== 'index.js' && chunk.fileName !== 'index.mjs') {
                return "'use client';\n";
            }

            return undefined;
        }),
        resolve({
            extensions: ['.js', '.jsx', '.ts', '.tsx']
        }),
    ],
    external: [
        'react',
        'react-dom',
        'prop-types',
        'xlsx',
        'zod',
        '@tabler/icons-react',
        '@mantine/dropzone',
        '@mantine/core',
        '@mantine/hooks'
    ]
}