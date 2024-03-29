(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.rocketjs = factory());
})(this, (function () { 'use strict';

   function _substrCount(haystack, needle) {
       let count = 0;
       let position = haystack.indexOf(needle);

       while (position !== -1) {
           count++;
           position = haystack.indexOf(needle, position + 1);
       }

       return count;
   }

   function _createSequenceResult() {
       return {
           sequence: "",
           match: false
       };
   }

      /**
       * 
       * @param {char} nextChar the next character in the string
       * @param {string} find the string we need to find
       * @param {object} sequenceResult the result object that has a sequence string to match against and a match boolean
       * @returns 
       */
   function _isCharacterSequence(nextChar, find, sequenceResult) {

       let newSequence = sequenceResult.sequence;
       if (newSequence.length === find.length) {
           /** remove the first character, so we shift to the right */
           newSequence = newSequence.substring(1);
       }

       newSequence += nextChar;
       sequenceResult.sequence = newSequence;
       sequenceResult.match = newSequence === find;

       return sequenceResult;
   }

   class RocketEngine {

       static getTemplates(template, templateStart, templateEnd) {

           /** templateStart and templateEnd must be the same length. */
           if (templateStart.length !== templateEnd.length) {
               throw new Error('Template start is not the same length as template end');
           }

           const templateLength = template.length;

           let startSequenceResult = _createSequenceResult();
           let endSequenceResult = _createSequenceResult();

           let startResultcounter = 0;
           let endResultcounter = 0;
           let startIndexes = [];
           let endIndexes = [];

           const templateSets = [];

           for (let charIndex = 0; charIndex < templateLength; charIndex++) {

               startSequenceResult = _isCharacterSequence(template[charIndex], templateStart, startSequenceResult);
               endSequenceResult = _isCharacterSequence(template[charIndex], templateEnd, endSequenceResult);

               if (startSequenceResult.match) {
                   startResultcounter = startResultcounter + 1;
                   startIndexes.push(charIndex - (templateStart.length - 1));
               }

               if (endSequenceResult.match) {
                   endResultcounter = endResultcounter + 1;
                   endIndexes.push(charIndex + 1);
               }

               /** we found a matching set or multiple nested sets. so now we can backtrack. */
               if (startResultcounter > 0 && endResultcounter > 0 && startResultcounter === endResultcounter) {
                   const numberOfSets = startIndexes.length;

                   for (let setIndex = 0; setIndex < numberOfSets; setIndex++) {
                       const startResultIndex = startIndexes[setIndex];

                       for (let endIndex = 0; endIndex < numberOfSets; endIndex++) {
                           let endResultIndex = endIndexes[endIndex];

                           /** we are matching against a previous end. */
                           if (endResultIndex < startResultIndex) {
                               continue;
                           }

                           const possibleTemplate = template.substring(startResultIndex, endResultIndex);

                           /** verify that inside either the starts and ends are equal (or 0, but that is also equal) */
                           const numberOfStarts = _substrCount(possibleTemplate, templateStart);
                           const numberOfEnds = _substrCount(possibleTemplate, templateEnd);

                           /** The template is complete! 
                            * NB. with some formatting we get a ghost empty template, skip those.
                            */
                           if (numberOfStarts > 0 && numberOfEnds > 0 && numberOfStarts === numberOfEnds && possibleTemplate.length) {
                               templateSets.push(possibleTemplate);
                               break;
                           }
                       }
                   }

                   /** reset the counter and the indexes */
                   startResultcounter = 0;
                   endResultcounter = 0;
                   startIndexes = [];
                   endIndexes = [];
               }
           }
           return templateSets;
       }

       static getToplevelTemplates(templates) {
           const toplevelTemplates = [];

           for (const [index, template] of templates.entries()) {
               let notNested = true;

               /** check if it is in any of the previous, if so, it is nested. */
               for (let templateIndex = 0; templateIndex < index; templateIndex++) {

                   const comparisonTemplate = toplevelTemplates[templateIndex];
                   /** index can be higher than toplevel templates is in length. */
                   if (!comparisonTemplate) {
                       continue;
                   }

                   /** also ignore if a template is inside a conditional template */
                   if (comparisonTemplate.includes(template)) {
                       notNested = false;
                       break;
                   }
               }

               if (notNested) {
                   toplevelTemplates.push(template);
               }
           }

           return toplevelTemplates;
       }

       /** Get the innerpart of a template. That means without the template syntax, for further processing */
       static getInnerTemplate(template, templateTokenLength = 3) {
           const start = templateTokenLength;

           /** template length minus the 2x template tokens, e.g. ~}} */
           const end = template.length - templateTokenLength;

           return template.substring(start, end).trim();
       }

       static getConditionalLogic(template) {
           const conditionalParameters = {};
           conditionalParameters.truthy = true;

           const innerTemplate = RocketEngine.getInnerTemplate(template);
           const logicString = RocketEngine.getLogicString(innerTemplate);

           conditionalParameters.logiclessTemplate = innerTemplate.substring(logicString.length).trim();

           /** conditional logic: if [prop] (is|not)? [comparison] */

           /** we can just split it on a space first, 'quick and dirty'. 
            * then we can reconcatenate the comparison. We start after the 'if'
            */

           let logicBits = logicString.substring(2).trim().split(" ");
           const numberOfBits = logicBits.length;

           conditionalParameters.property = logicBits[0];
           logicBits.shift(); /** remove it. */

           if (numberOfBits > 1) {
               conditionalParameters.truthy = logicBits[0] === 'is'; /** because we removed the property */
               logicBits.shift();

               /** capture the rest again. */
               conditionalParameters.comparison = logicBits.join(" ");
           }

           return conditionalParameters;
       }

       static getLoopLogic(template) {
           const loopParameters = {};

           const innerTemplate = RocketEngine.getInnerTemplate(template);
           const logicString = RocketEngine.getLogicString(innerTemplate);

           loopParameters.templateToRepeat = innerTemplate.replace(logicString, '').trim();

           // would be nice to have indexes as well //

           /** loop logic: for [imaginativeProp] (in|of)? [property] */
           const loopBits = logicString.substring(3).trim().split(" ");

           loopParameters.imaginaryProp = loopBits[0];
           loopParameters.property = loopBits[2];

           return loopParameters;
       }

       static getWrapperProperty(template) {
           const wrapperParameters = {};

           const innerTemplate = RocketEngine.getInnerTemplate(template);
           const logicString = RocketEngine.getLogicString(innerTemplate);

           /** wrapper logic: from [property] */
           wrapperParameters.property = logicString.substring(4).trim();
           wrapperParameters.templateToFill = innerTemplate.replace(logicString, '');

           return wrapperParameters;
       }

       static getProperty(template) {
           let property = '';

           let logicDeterminator = template.substring(2, 3);

           switch (logicDeterminator) {
               case '%': {
                   const loopLogic = RocketEngine.getLoopLogic(template);
                   property = loopLogic.property;
                   break;
               }
               case '~': {
                   const conditionalLogic = RocketEngine.getConditionalLogic(template);
                   property = conditionalLogic.property;
                   break;
               }
               case '#': {
                   property = RocketEngine.getInnerTemplate(template, 3).trim();
                   break;
               }
               default: {
                   const rawProperty = RocketEngine.getInnerTemplate(template, 2);
                   if (rawProperty[0] === '!') {
                       property = trim(rawProperty);
                   } else {
                       property = rawProperty;
                   }
                   break;
               }
           }
           return property;
       }

       static getPropertyValue(property, object) {
           const propertyTrail = property.split('.');

           let templateItem = '';

           for (const trailProperty of propertyTrail) {
               const property = trailProperty.trim();
               if (!templateItem || !Object.keys(templateItem).length) {
                   templateItem = object[property] ? object[property] : '';
               } else {
                   if (typeof templateItem === 'object' && templateItem[property]) {
                       templateItem = templateItem[property];
                   } else {
                       templateItem = null;
                       break;
                   }
               }
           }
           return templateItem;
       }

       /**
        * 
        * @param {string} innerTemplate the logic template
        * @returns the logic string
        */
       static getLogicString(innerTemplate) {
           let logicString = '';
           const logicEnds = ["\n", "{", "<"];
           const maxLength = innerTemplate.length;

           for (let charIndex = 0; charIndex < maxLength; charIndex++) {
               const nextChar = innerTemplate[charIndex];

               if (logicEnds.includes(nextChar)) {
                   return logicString;
               } else {
                   logicString += nextChar;
               }
           }
           return logicString;
       }
   }

   class RocketLoop {
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

   class RocketPartial {
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

   class RocketWrapper
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

   class RocketConditional {
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

   class RocketInterpolation {
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

   /**
    * A Readable, Clean, Easy Templating engine, created by Jelmer Veen 2022
    */

   class Rocket {

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

   return Rocket;

}));
