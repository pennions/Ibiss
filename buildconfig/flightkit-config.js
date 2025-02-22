import { flightkit_version } from '../package.json';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const plugins = [commonjs(), nodeResolve()];
const name = 'flightkit';
const pkg = 'flightkit';

export const flightkitConfig = [
    {
        input: 'flightkit/main.js',
        output: {
            file: `dist/${pkg}-v${flightkit_version}/${name}.js`,
            format: 'iife'
        },
        plugins
    },
];
