import { RocketEngine } from './RocketEngine';

export class RocketWrapper
{
    static resolveWrapper(template)
    {
        let resolvedWrapperTemplate = template;
        const allWrapperTemplates = RocketEngine.getTemplates(template, '{{$', '$}}');

        for (const wrapperTemplate of allWrapperTemplates) {
            const wrapperParameters = RocketEngine.getWrapperProperty(wrapperTemplate);

            const allTemplates = RocketEngine.getTemplates(wrapperParameters.templateToFill, '{{', '}}');
            const toplevelTemplates = RocketEngine.getToplevelTemplates(allTemplates);

            let newTemplate = wrapperParameters.templateToFill;

            for (const toplevelTemplate of toplevelTemplates) {
                const property = RocketEngine.getProperty(toplevelTemplate);
                /** apply the wrapper property as prefix. */
                newTemplate =  newTemplate.replace(new RegExp(property, 'g'), `${wrapperParameters.property}.${property}`);
            }
            /** put it into the final result. */
            resolvedWrapperTemplate =  resolvedWrapperTemplate.replace(wrapperTemplate, newTemplate);
        }

        return resolvedWrapperTemplate;
    }
}