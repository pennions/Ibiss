/** Simple build pipeline to do all the magic instead of polluting the entire package.json */
const { version, avian_version, flightkit_version, htmx_plugin_version, rocketjs_version } = require('./package.json');

const fs = require('fs');
const { execSync } = require('child_process');

function build() {

    /** check if the ibiss cdn directory exists */
    const ibissCdnDir = `documentation/public/cdn/ibiss-v${version}`;
    if (!fs.existsSync(ibissCdnDir)) {
        fs.mkdirSync(ibissCdnDir);
    } else {
        let rebuild = process.argv.slice(2);
        if (rebuild.length === 0) {
            console.log('Already built!');
            return;
        }
    }

    fs.rm('./dist', { recursive: true }, () => {
        console.log('cleaning done');
        const rollupCommands = [
            "npx rollup --config rollup.config.js",
        ];

        const rocketJsCommands = [
            `npx uglifyjs --compress --mangle --output dist/rocketjs-v${rocketjs_version}/rocket.min.js dist/rocketjs-v${rocketjs_version}/rocket.js`,
            `npx uglifyjs --compress --mangle --output documentation/src/assets/js/rocket.min.js dist/rocketjs-v${rocketjs_version}/rocket.js`,
            `npx uglifyjs --compress --mangle --output ${ibissCdnDir}/rocket.min.js dist/rocketjs-v${rocketjs_version}/rocket.js`,
        ];

        const flightkitJsCommands = [
            `npx uglifyjs --compress --mangle --output dist/flightkit-v${flightkit_version}/flightkit.min.js dist/flightkit-v${flightkit_version}/flightkit.js`,
            `npx uglifyjs --compress --mangle --output documentation/public/js/flightkit.min.js dist/flightkit-v${flightkit_version}/flightkit.js`,
            `npx uglifyjs --compress --mangle --output ${ibissCdnDir}/flightkit.min.js dist/flightkit-v${flightkit_version}/flightkit.js`
        ];

        const htmxCommands = [
            `npx uglifyjs --compress --mangle --output dist/htmx-ibiss-ui-v${htmx_plugin_version}/htmx-ibiss-ui.min.js dist/htmx-ibiss-ui-v${htmx_plugin_version}/htmx-ibiss-ui.js`,
            `npx uglifyjs --compress --mangle --output  ${ibissCdnDir}/htmx-ibiss-ui.min.js dist/htmx-ibiss-ui-v${htmx_plugin_version}/htmx-ibiss-ui.js`
        ];

        const avianCssCommands = [
            `node ./node_modules/less/bin/lessc aviancss/aviancss.less dist/aviancss-v${avian_version}/avian.css`,
            `npx postcss dist/aviancss-v${avian_version}/avian.css > dist/aviancss-v${avian_version}/avian.min.css`,
            `npx postcss dist/aviancss-v${avian_version}/avian.css > documentation/public/css/avian.min.css`,
            `npx postcss dist/aviancss-v${avian_version}/avian.css > flightkit/public/css/avian.min.css`,
            `npx postcss dist/aviancss-v${avian_version}/avian.css > ${ibissCdnDir}/avian.min.css`
        ];

        const buildDocumentation = 'npm run build --prefix documentation';
        const buildCommands = [...rollupCommands, ...rocketJsCommands, ...avianCssCommands, ...htmxCommands, ...flightkitJsCommands, buildDocumentation];

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