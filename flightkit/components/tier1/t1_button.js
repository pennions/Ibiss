import { t0_base_class } from '../tier0/t0_base_class';

export class FtButton extends t0_base_class {
    constructor() {
        super();

        const btnElement = document.createElement('button');
        btnElement.classList.add(...this._topLevelClasses);
        btnElement.innerHTML = this.innerHTML;

        this.render(btnElement);
    }
}