import commonjs from '@rollup/plugin-commonjs';

export default [{
    input: 'rocketjs/rocket.js',
    output: {
        name: 'rocket',
        file: 'dist/rocket.js',
        format: 'umd'
    },
    plugins: [commonjs()]
},
{
    input: 'rocketjs/rocket.js',
    output: {
        name: 'rocket',
        file: 'dist/rocket.es.js',
        format: 'es'
    },
    plugins: [commonjs()]
}];