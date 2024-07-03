import { returnEventWithTopLevelElement } from '../flightkit-functions/domTraversal';
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
        let zIndex = this.getAttribute('zIndex');

        if (!this.id) {
            this.id = this.base.generateId();
        }

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

        if (zIndex) {
            this.style.zIndex = zIndex;
        }

        /** id for the handle */
        this.componentId = this.getAttribute('handle');

        const draggableElement = document.createElement('div');
        draggableElement.innerHTML = this.innerHTML;
        this.component = draggableElement;

        /** events are added to base so they are disposed properly */
        const draggableId = `#${this.componentId || this.id}`;
        this.base.addEvent(draggableId, 'mousedown', this._dragElement);
        this.base.addEvent(draggableId, 'mouseup', this._reset);
        this.base.render(this);
    };
    disconnectedCallback() {
        this.base.removeEvents(this);
    };
    _dragElement(e) {
        const topLevelEvent = returnEventWithTopLevelElement(e, 'flk-draggable');
        const element = topLevelEvent.target;

        let offsetX, offsetY;

        /** Function to handle the start of dragging */
        function handleDragStart(event) {
            /** Calculate the offset from mouse to the top-left corner of the element */
            offsetX = event.clientX - element.offsetLeft;
            offsetY = event.clientY - element.offsetTop;
        }

        /** calculates the position **/
        function setPosition(event) {
            const x = event.clientX - offsetX;
            const y = event.clientY - offsetY;

            /** Set the position of the element */
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }

        function preventDefault(event) {
            event.preventDefault();
        }

        function enableDrag() {
            element.setAttribute('draggable', true);
            element.addEventListener('dragstart', handleDragStart);
            element.addEventListener('dragend', removeDrag);

            /** Prevent default behavior for certain events to enable dragging */
            document.addEventListener('dragover', preventDefault);
            /** so that the cursor does not say can't drop */
            document.addEventListener('drop', setPosition);
        }
        function removeDrag() {
            element.removeAttribute('draggable');

            /** remove all the events */
            element.removeEventListener('dragstart', handleDragStart);
            element.removeEventListener('dragend', removeDrag);
            document.removeEventListener('dragover', preventDefault);
            document.removeEventListener('drop', setPosition);
        }

        /** initialize */
        enableDrag();
    }
}