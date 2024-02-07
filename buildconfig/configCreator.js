import { version } from '../package.json';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [commonjs()];

export const configCreator = function (inputFile, name, packageName) {
    const pkg = packageName ? packageName : name;

    return [
        {
            input: inputFile,
            output: {
                name: pkg,
                file: `dist/${pkg}-v${version}/${name}.js`,
                format: 'umd'
            },
            plugins
        },
        {
            input: inputFile,
            output: {
                name: pkg,
                file: `dist/${pkg}-v${version}/${name}.es.js`,
                format: 'es'
            },
            plugins
        }
    ];

};