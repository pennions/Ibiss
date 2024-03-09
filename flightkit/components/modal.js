import { BaseComponent } from './extensions/base_component';

export class FlightkitModal extends HTMLElement {
    base;
    dialogId;
    /** property to check the state so you can easily switch */
    dialogOpen;


    newX;
    newY;
    startX;
    startY;

    constructor() {
        super();
        this.base = new BaseComponent();
    }

    connectedCallback() {
        const dialogElement = document.createElement('dialog');
        dialogElement.innerHTML = '<div id="handle" style="height:5rem;width:100%;"></div>' + this.innerHTML;

        this.dialogId = this.base.generateId();
        dialogElement.id = this.dialogId;

        this.component = dialogElement;
        this.base.addEvent("#handle", 'mousedown', this._startDrag);

        this.base.render(this);
    };


    _startDrag(event) {
        event.preventDefault();
        this.startX = event.clientX;
        this.startY = event.clientY;
        console.log(event)
        document.addEventListener('mousemove', this._drag);
        document.addEventListener('mouseup', this._stop);
    }

    _drag(event) {
        console.log("foo")
        event.preventDefault();
        this.newX = this.startX - event.clientX;
        this.newY = this.startY - event.clientY;
        this.startX = event.clientX;
        this.startY = event.clientY;

        // set the element's new position:
        this.style.top = this.offsetTop - this.newY;
        this.style.left = this.offsetLeft - this.newX;
    }
    _stop() {
        // document.onmouseup = null;
        // document.onmousemove = null;

        /** stop everything when mouse button is released: */
        document.removeEventListener('mousemove', this._drag);
        document.removeEventListener('mouseup', this._stop);
    }

    show() {
        this.dialogOpen = true;
        this.component.setAttribute('open', '');
        this.base.render(this);
    }

    hide() {
        this.dialogOpen = false;
        this.component.removeAttribute('open');
        this.base.render(this);
    }

    disconnectedCallback() {
        this.base.removeEvents(this);
    }
}
