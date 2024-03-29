/** example component */
import { BaseComponent } from './extensions/base_component';

export class FlightkitExample extends HTMLElement {
    base;

    constructor() {
        super();
        this.base = new BaseComponent();
    }

    test2() {
        alert("inner!");
    }

    /** grab inner HTML from here */
    connectedCallback() {
        const btnElement = document.createElement('button');
        btnElement.innerHTML = this.innerHTML;
        btnElement.id = this.base.generateId();
        /** set it to be rendered */
        this.component = btnElement;

        this.base.render(this);
    };
    disconnectedCallback() {
        this.base.removeEvents(this);
    }
}
