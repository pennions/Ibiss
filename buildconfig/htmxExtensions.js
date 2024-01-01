import commonjs from '@rollup/plugin-commonjs';

const input = 'htmx-extensions/ibiss-ui/htmx-ibiss-ui.js';
const name = 'htmx-ibiss-ui';
const plugins = [commonjs()];

export const htmxExtensionsConfig = [
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
