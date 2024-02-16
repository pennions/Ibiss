export class t0_base_class extends HTMLElement {
    _id;
    _events = [];
    _observedAttributes = [];

    static get observedAttributes() {
        return this._observedAttributes;
    };

    /**
     * Single attribute / property as a string or an array of strings
     */
    static set observedAttributes(attribute) {
        let attributesToAdd = Array.isArray(attribute) ? attribute : [attribute];

        for (const newAttribute of attributesToAdd) {
            if (!this._observedAttributes.includes(newAttribute)) {
                this._observedAttributes.push(newAttribute);
            }
        }
    }

    constructor() {
        super();
        this.id = this.id ? this.id : 'ft-' + this._uuidv4(); /** prefixing with ft- because it can not start with a number */
        this._innerHTML = this.innerHTML;
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
                this.addEvent(selector, event, this.getAttribute(`@${event}`));
            }
        }
        this.afterRender();
    }

    // attributeChangedCallback(name, oldValue, newValue) {

    // }

    _getAllEventAttributes() {
        const attributes = this.attributes;
        const eventAttributes = Array.from(attributes).filter(attr => attr.name.startsWith('@'));
        return eventAttributes.map(attr => attr.name.slice(1));
    }

    _uuidv4() {
        const guid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
        /** This will be unique enough */
        const newGuid = guid.split('-')[0];

        if (!window._flightkitStore) {
            window._flightkitStore = [];
        }

        /** verify to be absolutely sure ;) */
        if (window._flightkitStore.some(guid => guid === newGuid)) {
            return _uuidv4();
        }
        else {
            window._flightkitStore.push(newGuid);
            return newGuid;
        }
    }

    _returnTopLevelElement(event) {
        let { timeStamp, type, view, x, y } = event;

        let target = event.target;

        do {
            if (target.tagName.toUpperCase().includes('FT-')) {
                break;
            }
            else {
                target = target.parentNode;
            }
        }
        while (!target.tagName.toUpperCase().includes('FT-'));


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
