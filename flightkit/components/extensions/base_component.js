import { returnEventWithTopLevelElement } from '../../htmlbuilder/domTraversal';
import { uuidv4 } from '../../htmlbuilder/uuid_v4';

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
                const eventAttribute = `i-${event}`;
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
            parentElement.component.classList.add(...this._topLevelClasses);
        }
        clearTimeout(this._renderTimer);
        /** try to limit the amount of rendering */
        this.renderTimeout = setTimeout(() => {
            clearTimeout(this._renderTimer);
            this._assignToDom(parentElement, parentElement.component);
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
        const eventAttributes = Array.from(attributes).filter(attr => attr.name.startsWith('i-'));
        /** remove custom events, because these need to be bound specifically */
        return eventAttributes.map(attr => attr.name.slice(2));
    }

    _isFlightkitElement(tagName) {
        return tagName.toUpperCase().includes('FLK-');
    }

    _outerEventHandler(event) {
        const ftEvent = returnEventWithTopLevelElement(event);
        ftEvent.contents = event.detail;
        const callback = ftEvent.target.getAttribute(`i-${ftEvent.type}`);
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

                let element = document.querySelector(eventToAdd.selector);
                if (!element) {
                    continue;
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
        }
    }

    removeEvents() {
        for (const eventToRemove of this._events) {
            let element = document.querySelector(eventToRemove.selector);

            if (!element) {
                continue;
            }

            if (typeof eventToRemove.callback == 'function') {
                element.removeEventListener(eventToRemove.eventType, eventToRemove.callback);
            }
            else {
                element.removeEventListener(eventToRemove.eventType, this._outerEventHandler);
            }
        }
        this._events = [];
    }

    _assignToDom(parentElement, element) {
        parentElement.innerHTML = "";
        parentElement.append(element);
        /** need to add timeout so it can be applied properly */
        const eventTimer = setTimeout(() => {
            this._addEvents(parentElement);
            clearTimeout(eventTimer);
        }, 10);
    }
};