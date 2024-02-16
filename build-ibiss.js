/** Simple build pipeline to do all the magic instead of polluting the entire package.json */
const { version } = require('./package.json');
const fs = require('fs');
const { execSync } = require('child_process');

function build() {

    fs.rmdir('./dist', { recursive: true }, () => {
        console.log('cleaning done');

        const rollupCommands = [
            "npx rollup --config rollup.config.js",
        ];

        const rocketJsCommands = [
            `npx uglifyjs --compress --mangle --output dist/rocketjs-v${version}/rocket.min.js dist/rocketjs-v${version}/rocket.js`,
            `npx uglifyjs --compress --mangle --output documentation/src/assets/js/rocket.min.js dist/rocketjs-v${version}/rocket.min.js`
        ];

        const htmxCommands = [
            `npx uglifyjs --compress --mangle --output dist/htmx-ibiss-ui-v${version}/htmx-ibiss-ui.min.js dist/htmx-ibiss-ui-v${version}/htmx-ibiss-ui.js`
        ];

        const avianCssCommands = [
            `node ./node_modules/less/bin/lessc aviancss/aviancss.less dist/aviancss-v${version}/avian.css`,
            `npx postcss ./dist/aviancss-v${version}/avian.css > ./dist/aviancss-v${version}/avian.min.css`,
            `npx postcss ./dist/aviancss-v${version}/avian.css > ./documentation/src/assets/css/avian.min.css`,
            `npx postcss ./dist/aviancss-v${version}/avian.css > ./flightkit/public/css/avian.min.css`
        ];

        const buildDocumentation = 'npm run build --prefix documentation'
        const buildCommands = [...rollupCommands, ...rocketJsCommands, ...avianCssCommands, ...htmxCommands, buildDocumentation];

        for (const command of buildCommands) {
            execSync(command, (error) => {
                if (error) {
                    console.error(`Error executing command: ${error}`);
                    return;
                }
            });
        }
    });
}

build();