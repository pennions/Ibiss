import { t0_base_class } from '../tier0/t0_base_class';

export class FtButton extends t0_base_class {
    constructor() {
        super();

        this._innerHTML = /*html*/`<button class="${this._topLevelClasses.join(' ')}">${this.innerHTML}</button>`;
    }
}