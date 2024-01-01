import { Rocket } from "../../rocketjs/Rocket";
import { TestTools } from "../TestTools";

describe('Rocket integration test', () => {

    it('correctly renders an array', () => {

        const template = "<ul>{{% for prop of items <li>{{prop}}</li> %}}</ul>";
        const templateObject = {
            items: ["Item1", "Item2", "Item3"]
        };

        const result = Rocket.render(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<ul><li>Item1</li><li>Item2</li><li>Item3</li></ul>");
    });

    it('correctly renders an array with objects', () => {

        const template = "<ul>{{% for object of items <li>{{object.label}}</li> %}}</ul>";
        const templateObject = {
            items: [{ label: "Item1" }, { label: "Item2" }, { label: "Item3" }]
        };

        const result = Rocket.render(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<ul><li>Item1</li><li>Item2</li><li>Item3</li></ul>");
    });

    it('renders a nested loop correctly', () => {

        const template = "<div>TestDiv</div>{{% for items of list <ul>{{% for object of items <li>{{object.label}}</li> %}}</ul> %}}";
        const templateObject = {
            list: [{ label: "Item1" }, { label: "Item2" }, { label: "Item3" }]
        };

        const result = Rocket.render(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<div>TestDiv</div><ul><li>Item1</li></ul><ul><li>Item2</li></ul><ul><li>Item3</li></ul>");
    });

    it('renders a nested loop correctly if it is multi-line', () => {

        const template = `
<div>TestDiv</div>
{{% for item of list
<ul>
    {{% for object of item
    <li>{{object.label}}</li>
    %}}
</ul>
%}}`;
        const templateObject = {
            list: [{ label: "Item1" }, { label: "Item2" }, { label: "Item3" }]
        };

        const result = Rocket.render(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<div>TestDiv</div><ul><li>Item1</li></ul><ul><li>Item2</li></ul><ul><li>Item3</li></ul>");
    });

    it('renders a nested conditional correctly', () => {

        const template = "{{~ if item <h1>Some item:</h1>{{~ if item.label <p>{{item.label}}</p> ~}} ~}}";
        const templateObject = {
            item: { label: "Nested is tested" }
        };

        const result = Rocket.render(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<h1>Some item:</h1><p>Nested is tested</p>");
    });

    it('renders a nested multi-line conditional correctly', () => {

        const template = `
{{~ if item 
    <h1>Some item:</h1>
    {{~ if item.label 
        <p>{{item.label}}</p> 
    ~}} 
~}}`;
        const templateObject = {
            item: { label: "Nested is tested" }
        };

        const result = Rocket.render(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<h1>Some item:</h1><p>Nested is tested</p>");
    });

    it('renders a loop from a nested list', () => {

        const template = "<ul>{{% for item of object.list <li>{{ item.label }}</li> %}}</ul>";
        const templateObject = {
            object: {
                list: [{ label: "Item1" }, { label: "Item2" }, { label: "Item3" }]
            }
        };

        const result = Rocket.render(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<ul><li>Item1</li><li>Item2</li><li>Item3</li></ul>");
    });

    it('can render a view with partials', () => {

        const template = `
{{# partials.username #}}
{{# partials.shoppingList #}}
`;
        const templateObject = {
            shoppingList: {
                groceryStore: ["Carrot", "Melon", "Potato"],
            },
            username: "Jet",
            "partials": {
                shoppingList: "<ul> {{% for item in shoppingList.groceryStore <li> {{ item }} </li> %}} </ul>",
                username: "{{~ if username <div>{{ username }}</div> ~}} {{# partials.nested_partial #}}",
                nested_partial: "<span>Nested is also tested!</span>"
            }
        };

        const result = Rocket.render(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<div>Jet</div> <span>Nested is also tested!</span><ul> <li> Carrot </li><li> Melon </li><li> Potato </li> </ul>");
    });


    it('can build a template with nested statements', () => {


        const template = `
<main>
    {{~ if articles
        <section>
        {{% for article of articles
            <article>
            <h1>{{article.header}}</h1>
            <p>{{article.text}}</p>
            {{~ if article.footer
                <footer>{{article.footer}}</footer>
            ~}}
            </article>
        %}}
        </section>
    ~}}
</main>
        `;

        const templateObject = {

            articles: [
                {
                    header: 'Article 1',
                    text: '1) Lorem ipsum dolor'
                },
                {
                    header: 'Article 2',
                    text: '2) Amet and some other stuff'
                },
                {
                    header: 'Article 3',
                    text: '3) Hello world.',
                    footer: "Written by Edgar Allan Poe"
                }
            ]
        };

        const result = Rocket.buildTemplate(template, templateObject);
        const renderedResult = TestTools.cleanHtml(result);

        expect(renderedResult).toBe("<main><section><article><h1>{{articles.0.header}}</h1><p>{{articles.0.text}}</p></article><article><h1>{{articles.1.header}}</h1><p>{{articles.1.text}}</p></article><article><h1>{{articles.2.header}}</h1><p>{{articles.2.text}}</p><footer>{{articles.2.footer}}</footer></article></section></main>");
    });
});