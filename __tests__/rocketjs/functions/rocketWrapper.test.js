import { RocketWrapper } from "../../../rocketjs/functions/RocketWrapper";
import { TestTools } from "../../TestTools";

describe('Resolving wrappers', () => {
    it('can can correctly resolve a wrapped template', () => {
        const template = `{{$ from lists.todos
            <div>
                <h1>{{ title }}</h1>
                <p>{{ body }}</p>
            </div>
            $}}`;

        const result = RocketWrapper.resolveWrapper(template);
        const resolvedTemplate = TestTools.cleanHtml(result);

        expect(resolvedTemplate).toBe("<div><h1>{{ lists.todos.title }}</h1><p>{{ lists.todos.body }}</p></div>");
    });


    it('is correctly resolved when nested with a loop', () => {

        const template = `{{$ from lists.todos
            <div>
                <h1>{{ title }}</h1>
                <p>{{ body }}</p>
            </div>
            {{% for item in items 
                <span>{{ item }}</span>
            %}}
            $}}`;

        const result = RocketWrapper.resolveWrapper(template);
        const resolvedTemplate = TestTools.cleanHtml(result);
        expect(resolvedTemplate).toBe("<div><h1>{{ lists.todos.title }}</h1><p>{{ lists.todos.body }}</p></div>{{% for item in lists.todos.items<span>{{ item }}</span>%}}");
    });


    it('is correctly resolved when nested with a double loop', () => {

        const template = `{{$ from lists.todos
            <div>
                <h1>{{ title }}</h1>
                <p>{{ body }}</p>
            </div>
            {{% for item in items 
                <span>{{ item }}</span>
            %}}
            {{% for property in properties 
                <span>{{ property }}</span>
            %}}
          
            $}}`;

        const result = RocketWrapper.resolveWrapper(template);
        const resolvedTemplate = TestTools.cleanHtml(result);
        expect(resolvedTemplate).toBe("<div><h1>{{ lists.todos.title }}</h1><p>{{ lists.todos.body }}</p></div>{{% for item in lists.todos.items<span>{{ item }}</span>%}}{{% for property in lists.todos.properties<span>{{ property }}</span>%}}");
    });


    it('is correctly resolved when nested with a conditional', () => {

        const template = `{{$ from lists.todos
            {{~ if a
                {{ a }}
            ~}}
            $}}`;

        const result = RocketWrapper.resolveWrapper(template);
        const resolvedTemplate = TestTools.cleanHtml(result);
        expect(resolvedTemplate).toBe("{{~ if lists.todos.a{{ lists.todos.a }}~}}");
    });

});