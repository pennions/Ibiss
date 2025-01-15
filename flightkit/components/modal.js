import { returnEventWithTopLevelElement } from '../flightkit-functions/domTraversal';
import { BaseComponent } from './extensions/base_component';

export class FlightkitModal extends HTMLElement {
    _id;
    base;
    _draggableId;
    constructor() {
        super();
        this.base = new BaseComponent();
    }

    _emit(event, ftElement, detail) {
        let selectEvent = new CustomEvent(event, {
            detail,
            bubbles: true,
            cancelable: true
        });
        ftElement.dispatchEvent(selectEvent);
    }

    /** internal calls */
    _closeModal(event) {
        event.stopPropagation();
        const flkEvent = returnEventWithTopLevelElement(event, 'flk-modal');
        const flkElement = flkEvent.target;
        flkElement.classList.add('hidden');
        flkElement._emit("modal-close", flkElement)
    }

    closeModal() {
        this.classList.add('hidden');
    }

    openModal(reset = true) {
        const draggable = document.getElementById(this._draggableId);
        if (reset) {
            draggable.style.top = "40%";
            draggable.style.left = "50%";
        }
        this.classList.remove('hidden');
    }

    connectedCallback() {

        if (!this.id) {
            this.id = this.base.generateId();
        }
        const modalContainer = document.createElement('div');

        /** used as handle */
        let windowHeaderId = this.base.generateId();

        const flkDraggable = document.createElement('flk-draggable');
        this._draggableId = this.base.generateId();
        flkDraggable.id = this._draggableId;
        flkDraggable.setAttribute('center', '');
        flkDraggable.setAttribute('top', '40%');
        flkDraggable.setAttribute('handle', windowHeaderId);
        flkDraggable.setAttribute('zIndex', '1080');
        flkDraggable.classList.add('border', 'shadow-lg', 'bg-white');
        flkDraggable.style.width = 'max-content'; /** fixes collapsing at the border. */

        const windowHeader = document.createElement('div');

        const windowHeaderText = this.getAttribute('modal-title');

        if (windowHeaderText) {
            const headerTextElement = document.createElement('span');
            headerTextElement.innerText = windowHeaderText;
            headerTextElement.classList.add('ml-1', 'mr-auto');
            windowHeader.append(headerTextElement);
        }

        windowHeader.id = windowHeaderId;

        const headerClass = this.getAttribute('header-class');
        let headerClassesToAdd = [];
        if (headerClass) {
            headerClassesToAdd = headerClassesToAdd.concat(headerClass.split(' '));
        }
        else {
            headerClassesToAdd.push('bg-gray-light');
        }

        windowHeader.classList.add(...headerClassesToAdd, 'border-bottom', 'row', 'justify-end', 'cursor-no-select');

        const closeModalId = this.base.generateId();
        const closeModalButton = document.createElement('button');
        closeModalButton.classList.add('py-0', 'px-1', 'outline-hover', 'no-border', 'cursor-default', ...headerClassesToAdd);
        closeModalButton.innerText = 'X';
        closeModalButton.id = closeModalId;

        windowHeader.append(closeModalButton);
        flkDraggable.append(windowHeader);

        const userContentElement = document.createElement('div');
        userContentElement.innerHTML = this.innerHTML;
        flkDraggable.append(userContentElement);

        modalContainer.append(flkDraggable);
        this.component = modalContainer;

        this.base.addEvent(`#${closeModalId}`, 'click', this._closeModal);
        this.base.render(this);
        /** start hidden ofcourse. */
        this.classList.add('hidden');
        
    };

    disconnectedCallback() {
        this.base.removeEvents(this);
    }
}
