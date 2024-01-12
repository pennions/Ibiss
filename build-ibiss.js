/** Simple build pipeline to do all the magic instead of polluting the entire package.json */
const { version } = require('./package.json');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const path = require('path');

function build() {

    fs.rmdir('./dist', { recursive: true }, () => {
        console.log('cleaning done');

        const rocketJsCommands = [
            "npx rollup --config rollup.config.js",
            `npx uglifyjs --compress --mangle --output dist/rocketjs-v${version}/rocket.min.js dist/rocketjs-v${version}/rocket.js`,
        ];

        const avianCssCommands = [
            `node ./node_modules/less/bin/lessc aviancss/aviancss.less dist/aviancss-v${version}/avian.css`,
            `npx postcss ./dist/aviancss-v${version}/avian.css > ./dist/aviancss-v${version}/avian.min.css`,
        ];

        const buildCommands = [...rocketJsCommands, ...avianCssCommands];

        for (const command of buildCommands) {
            execSync(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${error}`);
                    return;
                }
            });
        }
    });
}

build();