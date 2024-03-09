
import { BaseComponent } from './extensions/base_component';

export class FlightkitWindow extends HTMLElement {
    base;
    componentId;

    constructor() {
        super();
        this.base = new BaseComponent();
    }


    /** grab inner HTML from here */
    connectedCallback() {
        this.style = 'display: block; position: fixed;';
        this.componentId = this.base.generateId();

        const draggableElement = document.createElement('div');

        const handlebar = document.createElement('div');
        handlebar.style = "height:5rem;width:100%;";
        handlebar.id = this.componentId;

        draggableElement.appendChild(handlebar);
        const container = document.createElement('div');
        container.innerHTML = this.innerHTML;
        draggableElement.append(container);
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

        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        if (document.getElementById(element.componentId)) {
            // if present, the header is where you move the DIV from:
            document.getElementById(element.componentId).onmousedown = dragMouseDown;
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
