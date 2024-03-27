
import { BaseComponent } from './extensions/base_component';

export class FlightkitDraggable extends HTMLElement {
    base;
    componentId;

    constructor() {
        super();
        this.base = new BaseComponent();
    }

    /** grab inner HTML from here */
    connectedCallback() {
        let top = this.getAttribute('top');
        let left = this.getAttribute('left');
        let center = this.getAttribute('center');

        this.style.display = "block";
        this.style.position = "fixed";
        /** if center is available, it is an empty string */
        if (typeof center === 'string') {
            this.style.top = top || "50%";
            this.style.left = "50%";
            this.style.transform = "translate(-50%, -50%)";
        }
        else {
            this.style.top = top || this.clientTop + "px";
            this.style.left = left || this.clientLeft + "px";
        }

        /** id for the handle */
        this.componentId = this.getAttribute('handle');

        const draggableElement = document.createElement('div');
        draggableElement.innerHTML = this.innerHTML;
        this.component = draggableElement;
        this.base.render(this);

        let renderTimer = setTimeout(() => {
            clearTimeout(renderTimer);
            this._dragElement(this);

        }, 10);
    };
    disconnectedCallback() {
        this.base.removeEvents(this);
    }

    _dragElement(element) {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        if (document.getElementById(element.componentId)) {
            // if present, the header is where you move the DIV from:
            const handleElement = document.getElementById(element.componentId);
            handleElement.onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            element.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            element.style.top = element.offsetTop - pos2 + "px";
            element.style.left = element.offsetLeft - pos1 + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}
