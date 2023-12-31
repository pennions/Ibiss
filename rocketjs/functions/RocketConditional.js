import { RocketEngine } from './RocketEngine';

export class RocketConditional {
    /** a conditional statement must be terminated by a \n a <, { and }, where that is an interpolation or another template */
    static resolveConditional(template, object) {
        let resolvedConditionalTemplate = template;
        const allConditionalTemplates = RocketEngine.getTemplates(template, "{{~", "~}}");

        for (const conditionalTemplate of allConditionalTemplates) {
            const conditionalParameters = RocketEngine.getConditionalLogic(conditionalTemplate);

            const propToValidate = conditionalParameters.property;
            const logiclessTemplate = conditionalParameters.logiclessTemplate;
            const truthyCheck = conditionalParameters.truthy;
            const falsyCheck = !conditionalParameters.truthy;
            let comparisonValue = '';

            if (conditionalParameters.comparison) {
                comparisonValue = conditionalParameters.comparison;
            }

            let replacement = '';
            let propertyValue = RocketEngine.getPropertyValue(propToValidate, object);

            // use case insensitive now, could make it an option
            if (propertyValue) {
                propertyValue = Array.isArray(propertyValue) ? propertyValue : propertyValue.toString().trim().toLocaleLowerCase();
                comparisonValue = conditionalParameters.comparison ? conditionalParameters.comparison.toLocaleLowerCase() : null;
            }

            // maybe nice to expand to other comparisons > < >= <= :)

            if (comparisonValue) {
                if (truthyCheck) {
                    replacement = propertyValue === comparisonValue ? logiclessTemplate : '';
                }

                if (falsyCheck) {
                    replacement = propertyValue !== comparisonValue ? logiclessTemplate : '';
                }
            } else {
                /** treat as truthy check aka it must exist and not be 0. if [property] */
                if (propertyValue === 'false' || !propertyValue || Array.isArray(propertyValue) && !propertyValue.length)
                    replacement = '';
                else {
                    replacement = logiclessTemplate;
                }
            }
            resolvedConditionalTemplate = resolvedConditionalTemplate.replace(conditionalTemplate, replacement);
        }
        return resolvedConditionalTemplate;
    }
}