import { RocketEngine } from './RocketEngine';

export class RocketPartial {
    static resolvePartials(template, object) {
        let resolvedTemplate = template;
        const allPartialTemplates = RocketEngine.getTemplates(template, "{{#", "#}}");

        for (const partialTemplate of allPartialTemplates) {
            const property = RocketEngine.getInnerTemplate(partialTemplate);

            const templateItem = RocketEngine.getPropertyValue(property, object);

            let replacement = '';
            if (templateItem) {
                replacement = templateItem;
            }

            resolvedTemplate = resolvedTemplate.replace(partialTemplate, replacement);
        }

        /** O yes, nested partials now exist! */
        if (resolvedTemplate.includes('{{#')) {
            /** if the property did not exist, just return. */
            if (template === resolvedTemplate) {
                return resolvedTemplate;
            }
            resolvedTemplate = RocketPartial.resolvePartials(resolvedTemplate, object);
        }
        return resolvedTemplate;
    }
}