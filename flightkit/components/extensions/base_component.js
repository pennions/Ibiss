import { returnEventWithTopLevelElement } from '../../flightkit-functions/domTraversal';
import { uuidv4 } from '../../flightkit-functions/uuid_v4';

export class BaseComponent {

    constructor() { };

    /** This is the 'custom component' */
    _topLevelClasses = [];
    _events = [];

    generateId() {
        return `flk-${uuidv4()}`;
    }

    render(parentElement) {
        if (!parentElement.component) throw new Error("Component is not assigned! Can't render");
        parentElement.id = parentElement.id ? parentElement.id : this.generateId(); /** prefixing with flk- because it can not start with a number */

        /** now it works with vue style events */
        const eventsToAdd = this._getAllEventAttributes(parentElement);

        if (eventsToAdd) {
            const selector = `#${parentElement.id}`;

            for (const event of eventsToAdd) {
                const eventAttribute = `e-${event}`;
                this.addEvent(selector, event, parentElement.getAttribute(eventAttribute));
            }
        }

        const numberOfClasses = (Object.keys(parentElement.classList)).length;

        if (numberOfClasses) {
            for (let clen = 0; clen < numberOfClasses; clen++) {
                this._topLevelClasses.push(parentElement.classList[0]);
                parentElement.classList.remove(parentElement.classList[0]);
            }
            parentElement.removeAttribute('class');
        }

        /** always passthrough top level classes */
        if (this._topLevelClasses.length) {
            /** if we have multiple components, add the passthrough classes to the first one. */
            if (Array.isArray(parentElement.component)) {
                parentElement.component[0].classList.add(...this._topLevelClasses);
            }
            else {
                parentElement.component.classList.add(...this._topLevelClasses);
            }
        }
        clearTimeout(this._renderTimer);

        /** try to limit the amount of rendering */
        this.renderTimeout = setTimeout(() => {
            this._assignToDom(parentElement, parentElement.component);
            clearTimeout(this._renderTimer);
        }, 10);
    }

    addEvent(selector, eventType, callback) {
        this._events.push({ selector, eventType, callback });
    }

    _getExternalCallback(fn) {
        const callbackParts = fn.split('.');

        let actualCallback = undefined;

        for (const cbPart of callbackParts) {
            if (!actualCallback) {
                actualCallback = window[cbPart];
            }
            else {
                actualCallback = actualCallback[cbPart];
            }
        }
        return actualCallback;
    }

    _getAllEventAttributes(parentElement) {
        const attributes = parentElement.attributes;
        const eventAttributes = Array.from(attributes).filter(attr => attr.name.startsWith('e-'));
        /** remove custom events, because these need to be bound specifically */
        return eventAttributes.map(attr => attr.name.slice(2));
    }

    _isFlightkitElement(tagName) {
        return tagName.toUpperCase().includes('FLK-');
    }

    _outerEventHandler(event) {
        const ftEvent = returnEventWithTopLevelElement(event);
        ftEvent.contents = event.detail;
        const callback = ftEvent.target.getAttribute(`e-${ftEvent.type}`);
        const callbackParts = callback.split('.');

        let actualCallback = undefined;

        for (const cbPart of callbackParts) {
            if (!actualCallback) {
                actualCallback = window[cbPart];
            }
            else {
                actualCallback = actualCallback[cbPart];
            }
        }
        event.preventDefault();
        event.stopPropagation();
        return actualCallback(ftEvent);
    }

    _addEvents(parentElement) {
        if (parentElement.isConnected) {
            for (const eventToAdd of this._events) {

                if (eventToAdd.selector.startsWith('.')) {

                    let elements = document.querySelectorAll(eventToAdd.selector);

                    for (const element of elements) {
                        this._addEventToElement(eventToAdd, element)
                    }
                }
                else {
                    let element = document.querySelector(eventToAdd.selector);
                    this._addEventToElement(eventToAdd, element)
                }
            }
        }
    }

    _addEventToElement(eventToAdd, element) {
        if (!element) {
            return;
        }
        /** check if it is a function (inner call) */
        if (typeof eventToAdd.callback == 'function') {
            element.removeEventListener(eventToAdd.eventType, eventToAdd.callback);
            element.addEventListener(eventToAdd.eventType, eventToAdd.callback);
        }
        else {
            element.removeEventListener(eventToAdd.eventType, this._outerEventHandler);
            element.addEventListener(eventToAdd.eventType, this._outerEventHandler);
        }
    }

    removeEvents() {
        for (const eventToRemove of this._events) {
            if (eventToRemove.selector.startsWith('.')) {

                let elements = document.querySelectorAll(eventToRemove.selector);

                for (const element of elements) {
                    this._addEventToElement(eventToRemove, element)
                }
            }
            else {
                let element = document.querySelector(eventToRemove.selector);
                this._addEventToElement(eventToRemove, element)
            }
        }

        this._events = [];
    }

    _removeEventToElement(eventToRemove, element) {
        if (!element) {
            return;
        }
        if (typeof eventToRemove.callback == 'function') {
            element.removeEventListener(eventToRemove.eventType, eventToRemove.callback);
        }
        else {
            element.removeEventListener(eventToRemove.eventType, this._outerEventHandler);
        }
    }

    _assignToDom(parentElement, element) {
        parentElement.innerHTML = "";

        const elementsToAdd = Array.isArray(element) ? element : [element]

        for (const HTMLElement of elementsToAdd) {
            parentElement.append(HTMLElement);
        }

        /** need to add timeout so it can be applied properly */
        const eventTimer = setTimeout(() => {
            this._addEvents(parentElement);
            clearTimeout(eventTimer);
            parentElement.dispatchEvent(new CustomEvent('loaded', {
                bubbles: true,
                cancelable: true
            }));
        }, 10);


    }
};