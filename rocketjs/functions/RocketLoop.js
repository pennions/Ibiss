import { RocketEngine } from './RocketEngine';

export class RocketLoop {
    static resolveLoop(template, object) {
        let resolvedLoopTemplate = template;
        const allLoopTemplates = RocketEngine.getTemplates(template, "{{%", "%}}");
        const allTopLevelTemplates = RocketEngine.getToplevelTemplates(allLoopTemplates);

        for (const loopTemplate of allTopLevelTemplates) {
            const loopParameters = RocketEngine.getLoopLogic(loopTemplate);

            const mainProp = loopParameters.property;
            const imaginaryProp = loopParameters.imaginaryProp;
            const templateToRepeat = loopParameters.templateToRepeat;
            const item = RocketEngine.getPropertyValue(mainProp, object);

            if (!item) {
                continue;
            }

            let replacement = '';
            const itemKeys = Object.keys(item);

            for (const key of itemKeys) {
                replacement += RocketLoop.replacePropWithTrail(
                    templateToRepeat,
                    imaginaryProp,
                    !isNaN(key) ? `${mainProp}.${key}` : mainProp /** if it is not numeric, we have the trail already. */
                );
            }
            resolvedLoopTemplate = resolvedLoopTemplate.replace(loopTemplate, replacement);
        }

        /** Check if we have nested loops. */
        if (resolvedLoopTemplate.includes('{{%')) {
            /** check if we are dealing with an invalid viewmodel */
            if (resolvedLoopTemplate === template) {
                return resolvedLoopTemplate;
            }
            resolvedLoopTemplate = RocketLoop.resolveLoop(resolvedLoopTemplate, object);
        }

        return resolvedLoopTemplate;
    }

    /** Create a property trail that can be interpolated */
    static replacePropWithTrail(template, property, trail) {
        let replacedTemplate = template.replace(/\{\{(.+?)\}\}/gm, (match) => {
            return match.replace(new RegExp(property, 'g'), trail);
        });

        /** also replace the properties of an if within a loop, to match up correctly */
        replacedTemplate = replacedTemplate.replace(/if([\s\S]+?)\s|is|not/gm, (match) => {
            return match.replace(new RegExp(property, 'g'), trail);
        });

        /** do the same for nested loops */
        replacedTemplate = replacedTemplate.replace(/(of|in)([\s\S]+?)(?=<|{)/gm, (match) => {
            return match.replace(new RegExp(property, 'g'), trail);
        });

        return replacedTemplate;
    }
}