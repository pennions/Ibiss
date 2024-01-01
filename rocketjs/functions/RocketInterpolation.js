import { RocketEngine } from './RocketEngine';

export class RocketInterpolation {
    /** Fills in all the property values */
    static interpolateTemplate(template, object) {
        let interpolatedTemplate = template;
        const allPropertyTemplates = RocketEngine.getTemplates(template, "{{", "}}");

        for (const propertyTemplate of allPropertyTemplates) {
            let property = RocketEngine.getInnerTemplate(propertyTemplate, 2);
            const encode = property[0] === '!';

            if (encode) {
                property = property.substr(1).trim();
            }

            const templateItem = RocketEngine.getPropertyValue(property, object);

            let replacement = '';

            if (templateItem) {
                replacement = templateItem;
            }

            replacement = Array.isArray(replacement) ? replacement.join(', ') : replacement.toString().trim();

            const templateReplacement = encode ? RocketInterpolation.escapeHtml(replacement) : replacement;

            interpolatedTemplate = interpolatedTemplate.replace(propertyTemplate, templateReplacement);
        }

        return interpolatedTemplate;
    }

    static escapeHtml(value) {
        value = value.replace(/&/gm, '&amp;');
        value = value.replace(/</gm, '&lt;');
        value = value.replace(/>/gm, '&gt;');
        value = value.replace(/"/gm, '&quot;');
        value = value.replace(/\//gm, '&#039;');

        return value;
    }
}