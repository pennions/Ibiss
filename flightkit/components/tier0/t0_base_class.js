import { uuidv4 } from '../../htmlbuilder/uuid_v4';

export class t0_base_class extends HTMLElement {
    _id;
    _events = [];
    _observedAttributes = [];
    _customEvents = ["@edit", "@cancel", "@save", "@delete"];

    _topLevelClasses = [];

    get observedAttributes() {
        return this._observedAttributes;
    };

    /**
     * Single attribute / property as a string or an array of strings
     */
    set observedAttributes(attribute) {
        let attributesToAdd = Array.isArray(attribute) ? attribute : [attribute];

        for (const newAttribute of attributesToAdd) {
            if (!this._observedAttributes.includes(newAttribute)) {
                this._observedAttributes.push(newAttribute);
            }
        }
    }

    constructor() {
        super();
        this.id = this.id ? this.id : `ft-${uuidv4()}`; /** prefixing with ft- because it can not start with a number */
        this._innerHTML = this.innerHTML;

        const numberOfClasses = (Object.keys(this.classList)).length;

        if (numberOfClasses) {
            for (let clen = 0; clen < numberOfClasses; clen++) {
                this._topLevelClasses.push(this.classList[0]);
                this.classList.remove(this.classList[0]);
            }
            this.removeAttribute('class');
        }
    }

    connectedCallback() {
        this.render();
    }

    /** called when component is removed */
    disconnectedCallback() {
        this.removeEvents();
    }

    render() {
        this.beforeRender();
        this.innerHTML = this._innerHTML;

        /** now it works with vue style events */
        const eventsToAdd = this._getAllEventAttributes();

        if (eventsToAdd) {
            const selector = `#${this.id}`;

            for (const event of eventsToAdd) {
                const eventAttribute = `@${event}`;
                const notCustomEvent = !this._customEvents.includes(eventAttribute);

                if (notCustomEvent) {
                    this.addEvent(selector, event, this.getAttribute(eventAttribute));
                }
                else {
                    /** custom events are click only for now. */
                    this.addEvent(selector, 'click', this.getAttribute(eventAttribute));
                }
            }
        }
        this.afterRender();
    }

    _getAllEventAttributes() {
        const attributes = this.attributes;
        const eventAttributes = Array.from(attributes).filter(attr => attr.name.startsWith('@'));
        /** remove custom events, because these need to be bound specifically */
        return eventAttributes.map(attr => attr.name.slice(1));
    }

    _isFlightkitElement(tagName) {
        return tagName.toUpperCase().includes('FT-');
    }

    /**
     * @returns top level flightkit element
     */
    _returnTopLevelElement(event) {
        let { timeStamp, type, view, x, y } = event;

        let target = event.target;

        do {
            if (this._isFlightkitElement(target.tagName)) {
                break;
            }
            else {
                target = target.parentNode;
            }
        }
        while (!this._isFlightkitElement(target.tagName)); /** check until we get the flightkit element */

        return {
            target,
            timeStamp,
            type,
            view,
            x,
            y
        };
    }

    addEvent(selector, eventType, callback) {
        this._events.push({ selector, eventType, callback });
    }

    _innerEventHander(event) {
        const callback = this._currentCallback;
        event.preventDefault();
        event.stopPropagation();
        return this[callback](this._returnTopLevelElement(event));
    }

    _outerEventHandler(event) {
        const callback = this._currentCallback;
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
        return actualCallback(this._returnTopLevelElement(event));
    }

    _addEvents() {
        if (this.isConnected) {
            for (const eventToAdd of this._events) {

                let element = document.querySelector(eventToAdd.selector);

                /** check if it is on the object */
                const innerEvent = this[eventToAdd.callback];
                this._currentCallback = eventToAdd.callback;

                if (innerEvent) {
                    element.addEventListener(eventToAdd.eventType, this._innerEventHander);
                }
                else {
                    element.addEventListener(eventToAdd.eventType, this._outerEventHandler);
                }
            }
        }
    }

    _removeEvents() {
        for (const eventToRemove of this._events) {
            let element = document.querySelector(eventToRemove.selector);

            /** check if it is on the object */
            const innerEvent = this[eventToRemove.callback];
            this._currentCallback = eventToRemove.callback;

            if (innerEvent) {
                element.removeEventListener(eventToRemove.eventType, this._innerEventHander);
            }
            else {
                element.removeEventListener(eventToRemove.eventType, this._outerEventHandler);
            }
        }
    }

    beforeRender() {
        this._removeEvents();
        this._currentCallback = '';
    }

    afterRender() {
        this._addEvents();
        this._currentCallback = '';
    }
}
