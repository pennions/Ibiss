import { uuidv4 } from '../../htmlbuilder/uuid_v4';

export class t0_base_class extends HTMLElement {
    _renderTimer;
    _id;
    _events = [];
    _observedAttributes = [];
    _customEvents = ["@edit", "@cancel", "@save", "@delete"];
    _topLevelClasses = [];

    constructor() {
        super();
        this.id = this.id ? this.id : `ft-${uuidv4()}`; /** prefixing with ft- because it can not start with a number */
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

    render(element) {
        this._renderTimer = setTimeout(() => {
            clearTimeout(this._renderTimer);

            this.beforeRender();
            this.innerHTML = "";
            this.append(element);

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
        }, 10);
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
    _returnEventWithTopLevelElement(event) {
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
        let ftEvent, callback;

        /** when using svg or inner elements it can be no longer the actual target */
        let correctTarget = event.target;

        /** if it is the outside element this will work. but if you have a nested item, like a th, with event then this is undefined */
        if (this._returnEventWithTopLevelElement) {
            ftEvent = this._returnEventWithTopLevelElement(event);
            callback = ftEvent.target.getAttribute(`@${ftEvent.type}`);
            event.preventDefault();
            event.stopPropagation();
            return this[callback](ftEvent);
        }
        else {
            let ftTarget = event.target;
            let callback = ftTarget.dataset.action;

            do {
                if (ftTarget.tagName.toUpperCase().includes('FT-')) {
                    break;
                }
                else {
                    ftTarget = ftTarget.parentNode;
                }

                if (callback === undefined) {
                    callback = ftTarget.dataset.action;

                    /** now we know this is the correct element */
                    if (callback) {
                        correctTarget = ftTarget;
                    }
                }
            }
            while (!ftTarget.tagName.toUpperCase().includes('FT-'));

            return ftTarget[callback]({ target: correctTarget }, ftTarget);
        }
    }

    _outerEventHandler(event) {
        const ftEvent = this._returnEventWithTopLevelElement(event);
        const callback = ftEvent.target.getAttribute(`@${ftEvent.type}`);
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

    _addEvents() {
        if (this.isConnected) {
            for (const eventToAdd of this._events) {

                let element = document.querySelector(eventToAdd.selector);

                /** check if it is on the object */
                const innerEvent = this[eventToAdd.callback];

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
        this._events = [];
    }

    beforeRender() {
        this._removeEvents();
    }

    afterRender() {
        this._addEvents();
    }
}
