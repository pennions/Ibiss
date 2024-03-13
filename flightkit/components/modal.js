import { returnEventWithTopLevelElement } from '../htmlbuilder/domTraversal';
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

    closeModal(event) {
        /** have to do it twice, because of the use of flk-draggable. */
        const topLevelEvent = returnEventWithTopLevelElement({ target: returnEventWithTopLevelElement(event).target.parentNode });
        const modalElement = topLevelEvent.target;

        modalElement.classList.add('hidden');
        modalElement._emit('hide', modalElement, { hidden: true, id: modalElement.id });
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
        flkDraggable.classList.add('border', 'shadow-lg');

        const windowHeader = document.createElement('div');

        const windowHeaderText = this.getAttribute('title');

        if (windowHeaderText) {
            const headerTextElement = document.createElement('span');
            headerTextElement.innerText = windowHeaderText;
            headerTextElement.classList.add('ml-1', 'mr-auto');
            windowHeader.append(headerTextElement)
        }

        windowHeader.id = windowHeaderId;
        windowHeader.classList.add('bg-gray-light', 'border-bottom', 'row', 'justify-end');

        const closeModalId = this.base.generateId();
        const closeModalButton = document.createElement('button');
        closeModalButton.classList.add('py-0', 'px-1', 'bg-gray-light', 'no-border');
        closeModalButton.innerText = 'X';
        closeModalButton.id = closeModalId;

        windowHeader.append(closeModalButton);
        flkDraggable.append(windowHeader);

        const userContentElement = document.createElement('div');
        userContentElement.innerHTML = this.innerHTML;
        flkDraggable.append(userContentElement);

        modalContainer.append(flkDraggable);
        this.component = modalContainer;

        this.base.addEvent(`#${closeModalId}`, 'click', this.closeModal);
        this.base.render(this);
    };

    disconnectedCallback() {
        this.base.removeEvents(this);
    }
}
