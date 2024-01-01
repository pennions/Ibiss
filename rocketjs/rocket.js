/**
 * A Readable, Clean, Easy Templating engine, created by Jelmer Veen 2022
 */
import { RocketLoop } from './functions/RocketLoop';
import { RocketPartial } from './functions/RocketPartial';
import { RocketWrapper } from './functions/RocketWrapper';
import { RocketConditional } from './functions/RocketConditional';
import { RocketInterpolation } from './functions/RocketInterpolation';

export default class Rocket {

    /**
     * 
     * @param {string} template a string with a Rocket Template
     * @param {{object | object[]}  viewmodel The JSON object or Array that need to be used in the Rocket Template.
     * @returns the template that has been filled out with all the correct paths so it can be filled in with interpolateTemplate()
     */
    static buildTemplate(template, viewmodel) {
        let newTemplate = RocketPartial.resolvePartials(template, viewmodel);
        newTemplate = RocketWrapper.resolveWrapper(newTemplate);
        newTemplate = RocketLoop.resolveLoop(newTemplate, viewmodel);
        newTemplate = RocketConditional.resolveConditional(newTemplate, viewmodel);
        return newTemplate;
    }
    /**
     * 
     * @param {string} template a string with a Rocket Template
     * @param {object | object[]} viewmodel The JSON object or Array that need to be used in the Rocket Template.
     * @returns the template with all values filled in
     */
    static interpolateTemplate(compiledTemplate, viewmodel) {
        return RocketInterpolation.interpolateTemplate(compiledTemplate, viewmodel);
    }

    /**
     * 
     * @param {string} template a string with a Rocket Template
     * @param {object | object[]} viewmodel The JSON object or Array that need to be used in the Rocket Template.
     * @returns build the template and fill in all the values.
     */
    static render(template, viewmodel) {
        const compiledTemplate = Rocket.buildTemplate(template, viewmodel);
        return Rocket.interpolateTemplate(compiledTemplate, viewmodel);
    }
}
