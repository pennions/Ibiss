import { rocketjsConfig } from './buildconfig/rocketjs-config.js';
import { htmxExtensionsConfig } from './buildconfig/htmxExtensions.js';
import { flightkitConfig } from './buildconfig/flightkit-config.js';

export default [...rocketjsConfig, ...htmxExtensionsConfig, ...flightkitConfig];