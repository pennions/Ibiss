import { t0_base_class } from '../tier0/t0_base_class';

export class FtButton extends t0_base_class {
    constructor() {
        super();

        const classes = [];
        const numberOfClasses = (Object.keys(this.classList)).length;


        if (numberOfClasses) {
            for (let clen = 0; clen < numberOfClasses; clen++) {
                classes.push(this.classList[0]);
                this.classList.remove(this.classList[0]);
            }
            this.removeAttribute('class');
        }

        this._innerHTML = /*html*/`<button class="${classes.join(' ')}">${this.innerHTML}</button>`;
    }
}