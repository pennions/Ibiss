import { RocketLoop } from "../../../rocketjs/functions/RocketLoop";
import { TestTools } from "../../TestTools";

describe('Resolving loops', () => {
    it('adds a trail to the values from an array property in the given object in the template', () => {

        const template = "<ul>{{% for prop of item <li>{{prop}}</li> %}}</ul>";

        const templateObject = {
            item: ["Item1", "Item2", "Item3"]
        };

        const result = RocketLoop.resolveLoop(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<ul><li>{{item.0}}</li><li>{{item.1}}</li><li>{{item.2}}</li></ul>");
    });

    it('it adds a trail to the values from an array property in the given object in the template even if they are nested', () => {

        const template = "<ul>{{% for prop of item  {{~ if prop <li>{{prop}}</li> ~}} %}}</ul>";

        const templateObject = {
            item: ["Item1", "Item2", "Item3"]
        };

        const result = RocketLoop.resolveLoop(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<ul>{{~ if item.0 <li>{{item.0}}</li> ~}}{{~ if item.1 <li>{{item.1}}</li> ~}}{{~ if item.2 <li>{{item.2}}</li> ~}}</ul>");
    });

    it('also works with for ... in ...', () => {

        const template = "<ul>{{% for prop in item <li>{{prop}}</li> %}}</ul>";

        const templateObject = {
            item: ["Item1", "Item2", "Item3"]
        };

        const result = RocketLoop.resolveLoop(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<ul><li>{{item.0}}</li><li>{{item.1}}</li><li>{{item.2}}</li></ul>");
    });

    it('adds a trail to the values from an object in an array property in the given object in the template', () => {

        const template = "<ul>{{% for object in items <li>{{object.label}}</li> %}}</ul>";

        const templateObject = {
            items: [{ label: "Item1" }, { label: "Item2" }, { label: "Item3" }]
        };

        const result = RocketLoop.resolveLoop(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<ul><li>{{items.0.label}}</li><li>{{items.1.label}}</li><li>{{items.2.label}}</li></ul>");
    });

    it('resolves nested loop', () => {

        const template = "<div>TestDiv</div>{{% for item of list <ul>{{% for object of item <li>{{object.label}}</li> %}}</ul>%}}";

        /** a two-dimensional array. where the outer one should be processed once and the inner one three times. */
        const templateObject = {
            list: [
                [{ label: "Item1" }, { label: "Item2" }, { label: "Item3" }]
            ]
        };

        const result = RocketLoop.resolveLoop(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<div>TestDiv</div><ul><li>{{list.0.0.label}}</li><li>{{list.0.1.label}}</li><li>{{list.0.2.label}}</li></ul>");
    });

    it('resolves a loop from a nested property', () => {
        const template = "<ul>{{% for item of object.list <li>{{ item.label }}</li> %}}</ul>";

        const templateObject = {
            object: {
                list: [{ label: "Item1" }, { label: "Item2" }, { label: "Item3" }]
            }
        };

        const result = RocketLoop.resolveLoop(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<ul><li>{{ object.list.0.label }}</li><li>{{ object.list.1.label }}</li><li>{{ object.list.2.label }}</li></ul>");
    });
});