import { RocketConditional } from "../../../rocketjs/functions/RocketConditional";
import { TestTools } from "../../TestTools";

describe('Resolving conditionals', () => {
    it('should return a template if truthyCheck is true', () => {
        const template = "{{~ if item is I exist  <p>{{item}}</p> ~}}";
        const templateObject = { item: 'I exist' };

        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<p>{{item}}</p>");
    });

    it('should return the template, even though it is a normal text due to \n', () => {
        const template = `{{~ if item is I exist 
            item
        ~}}`;
        const templateObject = { item: 'I exist' };

        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("item");
    });

    it('should return a template if property exists', () => {
        const template = "{{~ if item <p>{{item}}</p> ~}}";
        const templateObject = { item: 'I exist' };

        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<p>{{item}}</p>");
    });

    it('should not return a template if truthyCheck is false', () => {
        const template = "{{~ if item is true <p>{{item}}</p> ~}}";
        const templateObject = { item: false };

        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("");
    });

    it('should return a template if falsyCheck is true', () => {
        const template = "{{~ if item not true <p>{{item}}</p> ~}}";
        const templateObject = { item: false };

        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<p>{{item}}</p>");
    });

    it('should return the same template if an if statement is not found', () => {
        const template = "<p>{{item}}</p>";
        const templateObject = { item: false };

        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<p>{{item}}</p>");
    });

    it('returns the nested if when conditional is true', () => {
        const template = "{{~ if item <h1>Some item:</h1>  {{~ if item.label <p>{{item.label}}</p> ~}} ~}}";
        const templateObject = { item: { label: 'Nested is tested' } };
        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<h1>Some item:</h1><p>{{item.label}}</p>");
    });

    it('can resolve a property trail', () => {
        const template = "{{~ if item.label <p>{{item.label}}</p> ~}}";
        const templateObject = { item: { label: 'Trail is tested' } };
        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<p>{{item.label}}</p>");
    });

    it('can resolve a property trail that contains an is', () => {
        const template = `{{~ if shoppingList.bakery.birthday is carrot cake 
            <div>The cake is not a lie!</div>
        ~}}`;

        const templateObject = { shoppingList: { bakery: { birthday: 'carrot cake', daily: ['Bread', 'Cookies'] } } };
        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<div>The cake is not a lie!</div>");
    });

    it('can resolve even when there us a not inside the html without a not in the first line', () => {
        const template = `{{~ if shoppingList.bakery.birthday is carrot cake 
            <div>The cake is not a lie!</div>
        ~}}`;

        const templateObject = { shoppingList: { bakery: [] } };
        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("");
    });

    it('can resolve multiple conditionals', () => {
        const template = `{{~ if top
            <div>Render me! </div>

            {{~ if bottom <span>me too</span> ~}}
        ~}}`;

        const templateObject = { top: true, bottom: true };
        const result = RocketConditional.resolveConditional(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<div>Render me! </div><span>me too</span>");
    });
});