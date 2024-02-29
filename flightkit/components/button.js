/** example component */
import { baseComponent } from './extensions/base_component';

export class FlightkitButton extends HTMLElement {
    constructor() {
        super();
        baseComponent.addEvent('#megafoo', 'click', this.test2);
    }

    test2() {
        alert("inner!");
    }

    /** grab inner HTML from here */
    connectedCallback() {
        const btnElement = document.createElement('button');
        btnElement.innerHTML = this.innerHTML;
        btnElement.id = "megafoo";
        /** set it to be rendered */
        this.component = btnElement;
        
        baseComponent.render(this);
    };
    disconnectedCallback() {
        baseComponent.removeEvents(this);
    }
}
