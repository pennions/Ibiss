import { t0_base_class } from '../tier0/t0_base_class';

export class FlightkitButton extends t0_base_class {
    constructor() {
        super();
        const btnElement = document.createElement('button');

        if (this._topLevelClasses.length) {
            btnElement.classList.add(...this._topLevelClasses);
        }
        btnElement.innerHTML = this.innerHTML;

        this.render(btnElement);
    }
}