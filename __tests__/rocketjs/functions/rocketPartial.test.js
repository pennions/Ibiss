import { RocketPartial } from "../../../rocketjs/functions/RocketPartial";
import { TestTools } from "../../TestTools";

describe('Resolving partials', () => {
    it('can add partials', () => {

        const template = `<body>
    {{# partials.navbar #}}
    <main>Main content and such</main>
    {{# partials.footer #}}
</body>`;

        const templateObject = {
            partials: {
                navbar: '<nav><a>Some menu content</a>{{~ admin <button>To admin panel</button> ~}}</nav>',
                footer: '<footer>(C) made with RocketJs</footer>'
            }
        };

        let resolvedTemplate = RocketPartial.resolvePartials(template, templateObject);
        resolvedTemplate = TestTools.cleanHtml(resolvedTemplate);

        expect(resolvedTemplate).toBe('<body><nav><a>Some menu content</a>{{~ admin <button>To admin panel</button> ~}}</nav><main>Main content and such</main><footer>(C) made with RocketJs</footer></body>');
    });

    it('can resolve partials beginning with template characters', () => {

        const template = `
{{# partials.username #}}
{{# partials.shoppingList #}}`;

        const templateObject = {
            partials: {
                shoppingList: "<ul> {{% for item in shoppingList.groceryStore <li> {{ item }} </li> %}} </ul>",
                username: "{{~ if username <div>{{ username }}</div> ~}}"
            }
        };

        let result = RocketPartial.resolvePartials(template, templateObject);
        let resolvedTemplate = TestTools.cleanHtml(result);
        expect(resolvedTemplate).toBe("{{~ if username <div>{{ username }}</div> ~}}<ul> {{% for item in shoppingList.groceryStore <li> {{ item }} </li> %}} </ul>");
    });

    it('can resolve nested partials', () => {

        const template = `
{{# partials.lists #}}
        `;

        const templateObject = {
            partials: {
                shoppingList: "<ul> {{% for item in shoppingList.groceryStore <li> {{ item }} </li> %}} </ul>",
                lists: "{{# partials.shoppingList #}}"
            }
        };

        const result = RocketPartial.resolvePartials(template, templateObject);
        const resolvedTemplate = TestTools.cleanHtml(result);
        expect(resolvedTemplate).toBe("<ul> {{% for item in shoppingList.groceryStore <li> {{ item }} </li> %}} </ul>");
    });
});


