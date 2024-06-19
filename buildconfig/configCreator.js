import { version, htmx_plugin_version, rocketjs_version, flightkit_version } from '../package.json';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [commonjs()];

export const configCreator = function (inputFile, name, packageName) {
    const pkg = packageName ? packageName : name;

    let fileVersion;

    switch (name) {
        case 'htmx-ibiss-ui': {
            fileVersion = htmx_plugin_version;
            break;
        }
        case 'rocket': {
            fileVersion = rocketjs_version;
            break;
        }
        case 'flightkit': {
            fileVersion = flightkit_version;
            break;
        }
        default:
            fileVersion = version;
    }

    return [
        {
            input: inputFile,
            output: {
                name: pkg,
                file: `dist/${pkg}-v${fileVersion}/${name}.js`,
                format: 'umd'
            },
            plugins
        },
        {
            input: inputFile,
            output: {
                name: pkg,
                file: `dist/${pkg}-v${fileVersion}/${name}.es.js`,
                format: 'es'
            },
            plugins
        }
    ];

};