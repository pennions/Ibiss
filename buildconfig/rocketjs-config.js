import commonjs from '@rollup/plugin-commonjs';

const input = 'rocketjs/rocket.js';
const name = 'rocket';
const plugins = [commonjs()];

export const rocketjsConfig = [
    {
        input,
        output: {
            name,
            file: `dist/${name}.js`,
            format: 'umd'
        },
        plugins
    },
    {
        input,
        output: {
            name,
            file: `dist/${name}.es.js`,
            format: 'es'
        },
        plugins
    }
];
