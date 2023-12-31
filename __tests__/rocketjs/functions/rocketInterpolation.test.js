import { RocketInterpolation } from "../../../rocketjs/functions/RocketInterpolation";
import { TestTools } from "../../TestTools";

describe('Interpolating templates', () => {
    it('adds values from a given object in the right places', () => {

        const template = "<div>{{ variableB }} {{variableC}} {{variableA}}</div>";
        const templateObject = {
            variableA: 'works.',
            variableB: 'Great!',
            variableC: 'Interpolation'
        };

        const result = RocketInterpolation.interpolateTemplate(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<div>Great! Interpolation works.</div>");
    });

    it('can add nested values', () => {

        const template = "<div>{{ variableB }} {{variableC.a}} {{variableA}}</div>";
        const templateObject = {
            variableA: 'works.',
            variableB: 'Great!',
            variableC: { a: 'Nested interpolation' }
        };

        const result = RocketInterpolation.interpolateTemplate(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<div>Great! Nested interpolation works.</div>");
    });

    it('can escape html', () => {

        const template = "<pre><code>{{! myExample }}</code></pre>";
        const templateObject = {
            myExample: "<p>This HTML is for a code example</p>",
        };

        const result = RocketInterpolation.interpolateTemplate(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<pre><code>&lt;p&gt;This HTML is for a code example&lt;&#039;p&gt;</code></pre>");
    });



});