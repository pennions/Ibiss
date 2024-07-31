(function () {
    'use strict';

    /**
     * @param {*} jsonArray 
     * @param {Object} sortDetails ( propertyName: string, direction: 'asc' | 'desc' )  
     * @returns 
     */
    function sortJsonArray(jsonArray, sortDetails) {
        if (!sortDetails || sortDetails.length === 0) return jsonArray;

        /** need to make a copy, sort is in-place. Else original order would be lost */
        const newJsonArray = Object.assign([], jsonArray);

        if (Array.isArray(newJsonArray[0])) {
            sortGroupedJsonArray(newJsonArray, sortDetails);
        }
        else {
            newJsonArray.sort(sortFunction(sortDetails));
        }

        return newJsonArray;
    }
    const sortGroupedJsonArray = (groupedJsonArray, sortDetails) => {
        const result = [];
        for (const jsonArray of groupedJsonArray) {
            result.push(jsonArray.sort(sortFunction(sortDetails)));
        }
        return result;
    };

    function extractNumber(value) {
        let testString = value.toString();
        let match = testString.match(/^\d+|\d+$/);
        return match ? parseInt(match[0]) : null;
    }

    function isBoolean(value) {
        if (typeof value === 'boolean') return true;

        if (typeof value === 'string') {
            const comparison = value.toLocaleLowerCase();
            return comparison === 'true' || comparison === 'false'
        }
        return false;
    }

    function getBooleanValue(value) {
        if (typeof value === 'boolean') return value;
        return value.toLocaleLowerCase() === 'true'
    }

    function logicalSort(a, b, direction) {
        const regex = /^([a-zA-Z]*)(\d*)|(\d*)([a-zA-Z]*)$/;

        /** Extract the parts of the strings and make them case insensitive, 
         * else A1 and a1 will not allow multisort, which I think is confusing */
        const matchA = a.toString().toLocaleLowerCase().match(regex);
        const matchB = b.toString().toLocaleLowerCase().match(regex);

        /** Determine the character and number parts */
        const charPartA = matchA[1] || matchA[4];
        const numPartA = parseInt(matchA[2] || matchA[3], 10) || 0;

        const charPartB = matchB[1] || matchB[4];
        const numPartB = parseInt(matchB[2] || matchB[3], 10) || 0;

        /** check which order */
        const desc = direction.includes('desc');

        let leftHandCharValue = desc ? charPartB : charPartA;
        let rightHandCharValue = desc ? charPartA : charPartB;
        let leftHandNumValue = desc ? numPartB : numPartA;
        let rightHandNumValue = desc ? numPartA : numPartB;

        /** Compare the character parts first */
        if (leftHandCharValue < rightHandCharValue) return -1;
        if (leftHandCharValue > rightHandCharValue) return 1;

        /* If characters are the same, compare the number parts **/
        return leftHandNumValue - rightHandNumValue;
    }

    function sortFunction(applicableSorters, index = 0) {
        return function (a, b) {
            if (index > 0) {
                debugger;
            }

            const { propertyName, direction } = applicableSorters[index];

            /** if it is undefined, just make it a string. */
            let valueA = a[propertyName] === null || a[propertyName] === undefined ? '' : a[propertyName];
            let valueB = b[propertyName] === null || b[propertyName] === undefined ? '' : b[propertyName];

            const dateRegex = /^(\d{1,4}-\d{1,4}-\d{1,4}(T)?)/gim;

            const valuesAreDates = (valueA instanceof Date && valueB instanceof Date) || (dateRegex.test(valueA) && dateRegex.test(valueB));
            if (valuesAreDates) {
                valueA = valueA instanceof Date ? valueA.valueOf() : new Date(Date.parse(valueA));
                valueB = valueB instanceof Date ? valueB.valueOf() : new Date(Date.parse(valueB));
            }

            /** need to check for booleans, else valueA and valueB become NaN */
            const valuesAreBooleans = isBoolean(valueA) && isBoolean(valueB);
            const valuesAreNumbers = !valuesAreBooleans && !isNaN(valueA) && !isNaN(valueB);

            const valueAHasNumber = extractNumber(valueA);
            const valueBHasNumber = extractNumber(valueB);

            let logicalSortNeeded = false;

            if (valuesAreNumbers) {
                valueA = parseFloat(valueA).toPrecision(12);
                valueB = parseFloat(valueB).toPrecision(12);
            }
            else if (valueAHasNumber !== null && valueBHasNumber !== null) {
                logicalSortNeeded = true;
            }

            if (valuesAreBooleans) {
                valueA = getBooleanValue(valueA);
                valueB = getBooleanValue(valueB);
            }

            /** set the values genericly */
            let leftHandValue, rightHandValue;

            switch (direction) {
                case 'descending':
                case 'desc': {
                    leftHandValue = valueB;
                    rightHandValue = valueA;
                    break;
                }
                default: {
                    leftHandValue = valueA;
                    rightHandValue = valueB;
                    break;
                }
            }

            /** check if -1 or 1, 0. if 0 then check again. */
            let comparisonValue = 0;

            if (logicalSortNeeded) {
                comparisonValue = logicalSort(valueA, valueB, direction);
            }
            else if (valuesAreBooleans || valuesAreDates || valuesAreNumbers) {
                /** Yes this works for all these things. :D */
                comparisonValue = leftHandValue - rightHandValue;
            }
            else {
                leftHandValue = leftHandValue.toString().trim().toLowerCase();
                rightHandValue = rightHandValue.toString().trim().toLowerCase();

                const digitRegex = /\d/gmi;

                /** use this for the additional options in localeCompare */
                const valuesAreAlphaNumeric = digitRegex.test(valueA) && digitRegex.test(valueB);

                if (valuesAreAlphaNumeric) {
                    comparisonValue = leftHandValue.localeCompare(rightHandValue, undefined, {
                        numeric: true,
                        sensitivity: 'base'
                    });
                }
                else {
                    comparisonValue = leftHandValue.localeCompare(rightHandValue);
                }
            }

            const nextSorterIndex = index + 1;

            /** the value is the same for this property and we have more sorters then go to the next */
            if (comparisonValue === 0 && nextSorterIndex < applicableSorters.length) {
                const sortWrapper = sortFunction(applicableSorters, nextSorterIndex);
                return sortWrapper(a, b);
            }
            else {
                return comparisonValue;
            }
        };
    }

    function isFlightkitElement(tagName, flkTag) {
        const compareTo = flkTag ? flkTag.toUpperCase() : 'FLK-';
        return tagName.toUpperCase().includes(compareTo);
    }

    /**
     * @returns top level flightkit element
     */
    function returnEventWithTopLevelElement(event, flkTag) {
        let { timeStamp, type, x, y } = event;

        let target = event.target;
        do {
            if (!target || target.tagName === 'HTML' || isFlightkitElement(target.tagName, flkTag)) {
                if (target.tagName === 'HTML') {
                    target = null;
                }
                break;
            }
            else {
                target = target.parentNode || target.parentElement;
            }
        }
        while (!isFlightkitElement(target.tagName, flkTag)); /** check until we get the flightkit element */

        return {
            target,
            timeStamp,
            type,
            x,
            y
        };
    }

    function returnDataSetValue(event, datasetName) {
        let target = event.target;
        let datasetValue = '';
        do {
            if (target.dataset[datasetName]) {
                datasetValue = target.dataset[datasetName];
            }
            else {
                target = target.parentNode;
            }
        }
        while (!datasetValue);

        return datasetValue;
    }

    function uuidv4() {
        const guid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
        /** This will be unique enough */
        const newGuid = guid.split('-')[0];

        if (!window.$flightkitUUIDStore) {
            window.$flightkitUUIDStore = [];
        }

        /** verify to be absolutely sure ;) */
        if (window.$flightkitUUIDStore.some(guid => guid === newGuid)) {
            return uuidv4();
        }
        else {
            window.$flightkitUUIDStore.push(newGuid);
            return newGuid;
        }
    }

    class BaseComponent {

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
                            this._addEventToElement(eventToAdd, element);
                        }
                    }
                    else {
                        let element = document.querySelector(eventToAdd.selector);
                        this._addEventToElement(eventToAdd, element);
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
                        this._addEventToElement(eventToRemove, element);
                    }
                }
                else {
                    let element = document.querySelector(eventToRemove.selector);
                    this._addEventToElement(eventToRemove, element);
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

            const elementsToAdd = Array.isArray(element) ? element : [element];

            for (const HTMLElement of elementsToAdd) {
                parentElement.append(HTMLElement);
            }

            /** need to add timeout so it can be applied properly */
            const eventTimer = setTimeout(() => {
                this._addEvents(parentElement);
                clearTimeout(eventTimer);
            }, 10);
        }
    }

    const sortAscendingIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-narrow-wide"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>';
    const sortDescendingIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-wide-narrow"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>';

    const chevronDownIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';
    const chevronUpIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>';

    const folderListIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="gold" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
    const fileListIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>';

    /** adapted so it works with fill. */
    const databaseListIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="silver" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="m 3,12 a 9,3 0 0 0 18,0 M 3,5 v 14 a 9,3 0 0 0 18,0 V 5 m 0,0 A 9,3 0 0 1 12,8 9,3 0 0 1 3,5 9,3 0 0 1 12,2 9,3 0 0 1 21,5 Z" /></svg>';

    const tableListIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="WhiteSmoke" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sheet"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/><line x1="15" x2="15" y1="9" y2="21"/></svg>';
    const columnListIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>';

    function rehydrateSvg(svgString) {
        const parser = new DOMParser();
        // Parse the SVG string
        const parsedSvg = parser.parseFromString(svgString, "image/svg+xml");

        // Extract the parsed SVG element
        return parsedSvg.documentElement;
    }

    class FlightkitTable extends HTMLElement {
        base;
        /** to render */
        component = null;
        properties = new Set();
        uniqueEntriesByProperties = {};
        propertyLabelDictionary = {};
        _contents = [];
        _orderBy = [];
        _columnOrder = [];
        _filter = '';
        _selectionProperty = ''; /** must be an unique property on the element to select on. */
        _selectedIds = new Set(); /** used to sync selections */
        _templates = {}; /** html templates to use for columns and caption/tfoot */
        _templateClasses = {};

        static get observedAttributes() {
            return ['contents', 'columns', 'order', 'filter', 'selection-property', 'templates'];
        };

        get columnOrder() {
            return this._columnOrder.length ? this._columnOrder : this.properties;
        }

        set columnOrder(newValue) {
            let processedValue;

            switch (typeof newValue) {
                case 'string': {
                    processedValue = newValue.split(',');
                }
                default: {
                    processedValue = newValue;
                }

            }
            this._columnOrder = processedValue;
        }

        get contents() {
            return this._contents;
        }

        set contents(newValue) {
            this.analyzeData(newValue);
            this._contents = newValue;
        }

        get orderBy() {
            return this._orderBy;
        }
        set orderBy(newValue) {
            /** if you add this from JavaScript, use correct syntax */
            if (Array.isArray(newValue)) {
                this._orderBy = newValue;
            }
            else {
                /** we have the following signature: "column|direction,column2|direction" */
                const orderToSet = newValue.split(',');

                const newOrder = [];
                for (const order of orderToSet) {
                    const orderParts = order.split("|");
                    const propertyName = orderParts[0];
                    const direction = orderParts.length > 1 ? orderParts[1] : 'asc';

                    newOrder.push({
                        propertyName,
                        direction
                    });
                }
                this._orderBy = newOrder;
            }
        }

        get filter() {
            return this._filter;
        }

        set filter(newValue) {
            this._filter = newValue.toString();
        }

        constructor() {
            super();
            /** We can not inherit from this using extends, because of vue3  */
            this.base = new BaseComponent();
            this.setContents(this.getAttribute('contents'));
            this.setTemplates(this.getAttribute('templates'));
            this.setColumnOrder(this.getAttribute('columns'));
            this.filter = this.getAttribute('filter') || '';

            const presetOrder = this.getAttribute('order');
            if (presetOrder) {
                this.orderBy = presetOrder;
            }

            const selectionProperty = this.getAttribute('selection-property');
            if (selectionProperty) {
                this._selectionProperty = selectionProperty;
            }

            const innerTemplates = this.getElementsByTagName('template');

            if (innerTemplates.length) {
                const templatesToAdd = {};
                for (const template of innerTemplates) {
                    const templateName = template.getAttribute('name');
                    templatesToAdd[templateName] = template.innerHTML;
                    if (template.classList.length) {
                        this._templateClasses[templateName] = [...template.classList];
                    }
                }
                this.setTemplates(templatesToAdd);
            }

        }
        /** we only need this if we dont use get/set */
        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case "contents": {
                    this.setContents(newValue);
                    break;
                }
                case "templates": {
                    this.setTemplates(newValue);
                    break;
                }
                case "order": {
                    this.orderBy = newValue;
                    break;
                }
                case "filter": {
                    this.filter = newValue || '';
                    break;
                }
                case "selection-property": {
                    this._selectionProperty = newValue;
                    break;
                }
                case "columns": {
                    this.setColumnOrder(newValue);
                    break;
                }
            }
            /** in Vue3 this is not triggered. You need to set a :key property and handle that */
            this.createHtml();
            this.base.render(this);
        }

        _createElement(elementName) {
            const element = document.createElement(elementName);

            element.innerHTML = this._templates[elementName];

            if (this._templateClasses[elementName]) {
                element.classList.add(...this._templateClasses[elementName]);
            }
            return element;
        }

        createHtml() {
            const tableElement = document.createElement('table');
            let tableData = this.contents;

            if (this.orderBy.length) {
                tableData = sortJsonArray(this.contents, this.orderBy);
            }

            const tableHead = this.createHead();
            tableElement.append(tableHead);

            if (this._templates['caption']) {
                tableElement.append(this._createElement('caption'));
            }

            let filteredData = [];
            if (this.filter.length) {
                for (const data of tableData) {
                    let valuesInData = Object.values(data).join(" ").toLowerCase();

                    if (valuesInData.includes(this.filter)) {
                        filteredData.push(data);
                    }
                }
            }
            else {
                filteredData = tableData;
            }


            const tableBody = this.createBody(filteredData);
            tableElement.append(tableBody);

            if (this._templates['tfoot']) {
                tableElement.append(this._createElement('tfoot'));
            }

            this.component = tableElement;
        }

        connectedCallback() {
            this.createHtml();
            this.base.render(this);
        };
        disconnectedCallback() {
            this.base.removeEvents(this);
        }

        _updateCheckboxes(ftElement) {
            const allSelectionCheckboxes = ftElement.querySelectorAll('.flk-selection-checkbox');
            const currentSelection = ftElement._selectedIds.size;
            const maxSelection = ftElement.contents.execute().length;
            const notAllSelected = currentSelection !== maxSelection;
            const allSelected = currentSelection === maxSelection;
            const hasSelection = currentSelection !== 0;

            for (const selectionCheckbox of allSelectionCheckboxes) {
                /** we have the 'select all' in the header */
                if (!selectionCheckbox.dataset.objectId) {
                    if (hasSelection && notAllSelected) {
                        selectionCheckbox.indeterminate = true;
                    }
                    else if (hasSelection && allSelected) {
                        selectionCheckbox.indeterminate = false;
                        selectionCheckbox.checked = true;
                    }
                    else {
                        selectionCheckbox.indeterminate = false;
                        selectionCheckbox.checked = false;
                    }
                }
                else {
                    const objectId = selectionCheckbox.dataset.objectId;
                    if (ftElement._selectedIds.has(objectId)) {
                        selectionCheckbox.checked = true;
                    }
                    else {
                        selectionCheckbox.checked = false;
                    }
                }
            }
        }

        _emit(event, ftElement, detail) {
            let selectEvent = new CustomEvent(event, {
                detail,
                bubbles: true,
                cancelable: true
            });
            ftElement.dispatchEvent(selectEvent);
        }

        emitSelectAll(event) {

            /** check if the checkbox is checked or not */
            const isChecked = event.target.checked;
            const flightkitEvent = returnEventWithTopLevelElement(event);
            const ftElement = flightkitEvent.target;
            ftElement._selectedIds = isChecked ? new Set(
                ftElement.contents.execute()
                    .map(obj => obj[ftElement._selectionProperty])) : new Set();

            const selection = isChecked ? ftElement.contents.execute() : [];
            ftElement._emit('select', ftElement, { selection });
            ftElement._updateCheckboxes(ftElement);
        }

        emitSelect(event) {
            /** check if the checkbox is checked or not */
            const isChecked = event.target.checked;
            const objectId = event.target.dataset.objectId;
            const flightkitEvent = returnEventWithTopLevelElement(event);
            const ftElement = flightkitEvent.target;

            if (isChecked) {
                ftElement._selectedIds.add(objectId);
            }
            else {
                ftElement._selectedIds.delete(objectId);
            }

            const selectionProperty = ftElement._selectionProperty;

            const selection = ftElement.contents.execute().filter(obj => ftElement._selectedIds.has(obj[selectionProperty]));
            ftElement._emit('select', ftElement, { selection });
            ftElement._updateCheckboxes(ftElement);
        }

        sortData(event) {
            const flightkitEvent = returnEventWithTopLevelElement(event);
            const ftElement = flightkitEvent.target;
            const column = returnDataSetValue(event, 'column');
            if (!column) return;

            const columnPresentIndex = ftElement._orderBy.findIndex(order => order.propertyName === column);

            /** it is present */
            if (columnPresentIndex > -1) {
                const presentOrder = ftElement._orderBy[columnPresentIndex];

                if (presentOrder.direction === 'asc') {
                    ftElement._orderBy[columnPresentIndex].direction = 'desc';
                }
                else {
                    ftElement._orderBy.splice(columnPresentIndex, 1);
                }
            }
            else {
                /** add it */
                ftElement._orderBy.push({ propertyName: column, direction: 'asc' });
            }
            ftElement.createHtml();
            ftElement.base.render(ftElement);
        }

        setColumnOrder(newOrder) {
            if (newOrder) {
                this._columnOrder = Array.isArray(newOrder) ? newOrder : newOrder.split(',');
            }
            else {
                this._columnOrder = [];
            }
        }

        analyzeData(value) {
            /** reset */
            this.properties = new Set();
            const contentLength = value.length;

            for (let index = 0; index < contentLength; index++) {
                const keys = Object.keys(value[index]);

                for (const key of keys) {
                    this.properties.add(key);

                    if (!this.uniqueEntriesByProperties[key]) {
                        this.uniqueEntriesByProperties[key] = new Set();
                    }
                    this.uniqueEntriesByProperties[key].add(value[index][key]);
                }
            }
        }

        setTemplates(newValue) {
            if (!newValue) return;

            try {
                switch (typeof newValue) {
                    case 'string': {
                        this._templates = JSON.parse(newValue) || [];
                        break;
                    }
                    case 'object': {
                        this._templates = newValue;
                        break;
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }

        setContents(newValue) {
            /** check if it came from an attibute callback, or directly set as property */
            const valueToSet = newValue || this.contents || [];
            try {

                switch (typeof valueToSet) {
                    case 'string': {
                        this.contents = JSON.parse(valueToSet) || [];
                        break;
                    }
                    case 'object': {
                        if (Array.isArray(valueToSet)) {
                            this.contents = valueToSet;
                        }
                        else {
                            this.contents = [valueToSet];
                        }
                        break;
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }

        /** function to create HTML */
        convertJsonKeyToTitle(jsonKey) {
            if (typeof jsonKey !== 'string') jsonKey = jsonKey.toString();
            if (this.propertyLabelDictionary[jsonKey]) return this.propertyLabelDictionary[jsonKey];

            const result = jsonKey.replace(/([A-Z_])/g, ($1) => {
                if ($1 === "_") return " ";
                else return ` ${$1.toLowerCase()}`;
            }).trim();
            const convertedKey = result.charAt(0).toUpperCase() + result.slice(1);
            this.propertyLabelDictionary[jsonKey] = convertedKey;
            return convertedKey;
        }

        /** replaces {{ property }} with the value */
        parseTemplate(template, object) {
            return template.replace(/\{\{([\s\S]+?)\}\}/gim, (_, p1) => {

                let replacement = '';

                p1 = p1.trim();

                let templateItem = object[p1];

                if (templateItem) {
                    replacement = templateItem;
                }

                return Array.isArray(replacement) ? replacement.join(', ') : replacement.toString().trim();
            });
        }

        createSelectionCheckbox(data) {
            const checkboxElement = document.createElement('input');
            checkboxElement.setAttribute('type', 'checkbox');
            checkboxElement.classList.add('flk-selection-checkbox');

            if (data) {
                checkboxElement.dataset.selected = data[this._selectionProperty];
            }
            return checkboxElement;
        }

        createRow(rowContent) {
            const tableRow = document.createElement('tr');

            if (this._selectionProperty.length) {
                const tdSelector = document.createElement('td');
                const tdSelectorId = this.base.generateId(); /** to add the sort event */
                const selectCheckbox = this.createSelectionCheckbox(rowContent);
                selectCheckbox.id = tdSelectorId;
                selectCheckbox.dataset.objectId = rowContent[this._selectionProperty];

                const objectId = rowContent[this._selectionProperty];
                if (this._selectedIds.has(objectId)) {
                    selectCheckbox.checked = true;
                }
                else {
                    selectCheckbox.checked = false;
                }

                this.base.addEvent(`#${tdSelectorId}`, 'change', this.emitSelect);
                tdSelector.append(selectCheckbox);
                tableRow.append(tdSelector);
            }

            for (const property of this.columnOrder) {
                const tableCell = document.createElement('td');

                if (this._templates[property]) {
                    tableCell.innerHTML = this.parseTemplate(this._templates[property], rowContent);
                    /** when you use templating inside the element. */
                    if (this._templateClasses[property]) {
                        tableCell.classList.add(...this._templateClasses[property]);
                    }
                }
                else {
                    tableCell.innerText = rowContent[property];
                }

                tableRow.append(tableCell);
            }
            return tableRow;
        };

        createBody(data) {
            const tableBody = document.createElement('tbody');
            for (const rowContent of data) {
                const tableRow = this.createRow(rowContent, null);
                tableBody.append(tableRow);
            }
            return tableBody;
        };

        createHead() {
            const tableHead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            headerRow.classList.add('cursor-pointer');
            if (this._selectionProperty.length) {
                const thSelectAll = document.createElement('th');
                const thSelectAllId = this.base.generateId(); /** to add the sort event */
                const selectAllCheckbox = this.createSelectionCheckbox();
                selectAllCheckbox.id = thSelectAllId;

                /** handle a rerender of the table on thigs like sort or filter. */
                const maxSelection = this.contents.execute().length;

                if (this._selectedIds.size > 0 && this._selectedIds.size < maxSelection) {
                    selectAllCheckbox.indeterminate = true;
                }
                else if (this._selectedIds.size === maxSelection) {
                    selectAllCheckbox.checked = true;
                }

                this.base.addEvent(`#${thSelectAllId}`, 'change', this.emitSelectAll);
                thSelectAll.append(selectAllCheckbox);
                headerRow.append(thSelectAll);
            }

            for (const header of this.columnOrder) {
                const thId = this.base.generateId(); /** to add the sort event */
                const thCell = document.createElement('th');
                thCell.id = thId;
                thCell.dataset.column = header;

                const headerText = document.createElement('span');
                headerText.innerText = this.convertJsonKeyToTitle(header);
                thCell.append(headerText);
                this.base.addEvent(`#${thId}`, 'click', this.sortData);

                const orderProperties = this.orderBy.find(obp => obp.propertyName === header);
                const iconElement = document.createElement('span');
                if (orderProperties) {
                    iconElement.innerHTML = orderProperties.direction === 'asc' ? sortAscendingIcon : sortDescendingIcon;
                }
                else {
                    iconElement.style.display = 'inline-block';
                    iconElement.style.width = "24px";
                }

                thCell.append(iconElement);

                headerRow.append(thCell);
            }
            tableHead.append(headerRow);
            return tableHead;
        };


        /** so that you can add events to templates */
        addEvent(selector, eventType, callback) {
            this.base.addEvent(selector, eventType, callback);
        }

        /** Needed for vanilla webcomponent and compatibility with Vue3
         * If I try to render this on setContents, Vue3 gives illegal operation.
         */
        init() {
            this.createHtml();
            this.base.render(this);
        }
    }

    class FlightkitDraggable extends HTMLElement {
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

    class FlightkitModal extends HTMLElement {
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
        }

        closeModal(event) {
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

    class FlightkitDropdown extends HTMLElement {
        base;
        _buttonId;
        _drawerId;
        _iconId;

        constructor() {
            super();
            this.base = new BaseComponent();
        }

        /** grab inner HTML from here */
        connectedCallback() {
            this.style.position = 'relative';
            this.style.display = 'flex'; /** fixes drawer positioning */
            this.style.width = 'fit-content'; /** fixes flex taking up 100% */
            this._buttonId = this.base.generateId();

            const btnElement = document.createElement('button');
            btnElement.setAttribute('type', 'button');
            btnElement.classList.add('row');
            btnElement.id = this._buttonId;

            const btnTextElement = document.createElement('span');
            btnTextElement.classList.add("self-align-center");
            btnTextElement.innerText = this.getAttribute('text');

            this._iconId = this.base.generateId();

            const iconElement = document.createElement('span');
            iconElement.classList.add("self-align-center");
            const closedIcon = rehydrateSvg(chevronDownIcon);

            const openIcon = rehydrateSvg(chevronUpIcon);
            openIcon.classList.add('hidden');

            iconElement.append(closedIcon, openIcon);
            iconElement.id = this._iconId;

            btnElement.append(btnTextElement, iconElement);

            this._drawerId = this.base.generateId();
            const drawerElement = document.createElement('div');
            drawerElement.id = this._drawerId;
            drawerElement.classList.add('shadow', 'inline-block', 'bg-white');
            drawerElement.style.position = 'absolute';
            drawerElement.style.zIndex = '1040';

            /** a template tag will not be rendered. It will be nicer this way. */
            const templateElement = this.querySelector('template');

            /**innerHTML works in vanilla, but firstChild due to Vue3.*/
            if (templateElement.innerHTML.length) {
                drawerElement.innerHTML = templateElement.innerHTML;
            }
            else {
                drawerElement.append(templateElement.firstChild);
            }

            drawerElement.style.display = 'none';

            /** set it to be rendered */
            this.component = [btnElement, drawerElement];

            this.base.addEvent(`#${this._buttonId}`, 'click', this.toggleMenu);

            const bodyEl = document.querySelector('body');

            if (bodyEl.getAttribute('flk-close-dropdown') !== '') {
                bodyEl.setAttribute('flk-close-dropdown', '');
                bodyEl.addEventListener('click', this.closeAllDropdownButtons);
            }

            this.base.render(this);
        };
        disconnectedCallback() {
            this.base.removeEvents(this);
            const allDropdownButtons = document.querySelectorAll('flk-dropdown');

            if (!allDropdownButtons || !allDropdownButtons.length) {
                const bodyEl = document.querySelector('body');
                bodyEl.removeAttribute('flk-close-dropdown');
                bodyEl.removeEventListener('click', this.closeAllDropdownButtons);
            }
        }

        toggleMenu(event) {
            const topLevelElement = returnEventWithTopLevelElement(event);
            const ftElement = topLevelElement.target;
            const drawerToToggleId = ftElement._drawerId;
            const drawerToToggle = document.getElementById(drawerToToggleId);

            const drawerOpen = drawerToToggle.style.display !== 'none';
            drawerToToggle.style.display = drawerOpen ? 'none' : 'block';

            const specifiedWidth = ftElement.getAttribute('drawer-width');
            const alignRight = typeof ftElement.getAttribute('right') === 'string';

            if (alignRight) {
                drawerToToggle.style.right = "0px";
            }

            drawerToToggle.style.top = ftElement.offsetHeight + "px";
            drawerToToggle.style.width = specifiedWidth || ftElement.offsetWidth + "px";

            const iconToToggleId = ftElement._iconId;
            const iconToToggle = document.getElementById(iconToToggleId);

            /** because I checked if the previous state was open then we close.
             * So therefor we need to do the opposite, if it _was_ open, now its closed.
             */

            if (drawerOpen) {
                iconToToggle.childNodes[0].classList.remove('hidden');
                iconToToggle.childNodes[1].classList.add('hidden');
            }
            else {
                iconToToggle.childNodes[0].classList.add('hidden');
                iconToToggle.childNodes[1].classList.remove('hidden');
            }    }

        _closeDropdown() {
            const drawerToToggleId = this._drawerId;
            const drawerToToggle = document.getElementById(drawerToToggleId);
            const drawerOpen = drawerToToggle.style.display !== 'none';

            if (drawerOpen) {
                const iconToToggleId = this._iconId;
                const iconToToggle = document.getElementById(iconToToggleId);

                drawerToToggle.style.display = 'none';
                iconToToggle.childNodes[0].classList.remove('hidden');
                iconToToggle.childNodes[1].classList.add('hidden');
            }
        }

        closeAllDropdownButtons(event) {
            const topLevelElement = returnEventWithTopLevelElement(event, 'flk-dropdown');
            const ftElement = topLevelElement.target;

            const allDropdownButtons = document.querySelectorAll('flk-dropdown');

            if (ftElement) {
                for (const dropdownButton of allDropdownButtons) {
                    /**if you click on a dropdown. close the others */
                    if (ftElement._buttonId !== dropdownButton._buttonId) {
                        const drawerToToggleId = dropdownButton._drawerId;
                        const drawerToToggle = document.getElementById(drawerToToggleId);
                        const drawerOpen = drawerToToggle.style.display !== 'none';

                        if (drawerOpen) {
                            dropdownButton._closeDropdown();
                        }
                    }
                }
            } else {
                /** close all dropdowns */
                for (const dropdownButton of allDropdownButtons) {
                    dropdownButton._closeDropdown();
                }
            }
        }
    }

    class FlightkitTreeNavigation extends HTMLElement {
        base;
        contents;
        component;
        listType = 'ul';
        commentType = ''
        searchStyle = '';
        // currently just by adding this, it will change the iconset to database.
        iconSet;
        filter = { value: '', caseSensitive: false };
        selectedElements = [];

        static get observedAttributes() {
            return ['contents', 'icon-set', 'max-depth', 'filter', 'search-style', 'comment'];
        };

        _jsonToValueArray(json) {

            let jsonString = JSON.stringify(json);
            /** replace any array and object brackets */
            jsonString = jsonString.replace(/[\[\]{}\"]/g, "");
            let jsonKeyValueArray = jsonString.split(',');
            let values = [];

            for (const kvPair of jsonKeyValueArray) {
                values = values.concat(kvPair.split(":"));
            }
            return [...new Set(values)];
        }

        _emit(event, ftElement, detail) {
            let selectEvent = new CustomEvent(event, {
                detail,
                bubbles: true,
                cancelable: true
            });
            ftElement.dispatchEvent(selectEvent);
        }

        constructor() {
            super();
            this.base = new BaseComponent();
            /** Check if there is contents already there. */
            this.setContents(this.getAttribute('contents'));
            this.commentType = this.getAttribute('comment') ?? '';
            this.iconSet = this.getAttribute('icon-set') ?? 'file';
            this.searchStyle = this.getAttribute('search-style') ?? 'highlight';
            this.maxDepth = this.getAttribute('max-depth') ? parseInt(this.getAttribute('max-depth')) : -1;
            this.setFilter(this.getAttribute('filter'));

            this.style.display = 'block';
            this.style.maxWidth = 'fit-content';
            this.style.margin = '0 1rem 0 0';
            this.base.addEvent('.flk-branch', 'click', this.emitNodeToggle);
        }

        deselectTree() {
            if (this.selectedElements.length) {
                for (const selectedElement of this.selectedElements) {
                    selectedElement.classList.remove('font-weight-bold');
                    delete selectedElement.dataset.selected;
                }
            }
        }

        emitNodeToggle(event) {
            event.stopPropagation();

            /** Clicked in between items in a list, ignore. */
            if (["LI", "UL"].includes(event.target.tagName)) {
                return false;
            }

            const flkEvent = returnEventWithTopLevelElement(event, 'flk-tree-nav');
            const flkElement = flkEvent.target;
            const item = returnDataSetValue(event, 'branchKey');

            let data = flkElement.contents;
            const trail = item.split('.');

            for (const crumb of trail) {
                if (data[crumb]) {
                    data = data[crumb];
                }
                else if (data[crumb] === null) {
                    data = null;
                }
                else {
                    /** Dealing with an array of objects */
                    let extractedData = [];
                    for (const obj of data) {
                        if (obj[crumb]) {
                            extractedData.push(obj[crumb]);
                        }
                    }
                    data = extractedData;
                }
            }

            let leafKey;
            let parent = event.target;

            do {
                if (parent.dataset && parent.dataset.leafKey) {
                    leafKey = parent.dataset.leafKey;
                }
                else {
                    parent = parent.parentNode || parent.parentElement;
                }
            }
            while (!leafKey)

            if (flkElement.selectedElements.length) {
                flkElement.deselectTree();
            }

            // flkElement.previousElements = flkElement.selectedElements;
            flkElement.selectedElements = [];


            if (parent.tagName === 'DETAILS') {
                flkElement.selectedElements.push(parent.childNodes[0]);

                /** for when we have 2 spans */
                if (parent.childNodes.length && parent.childNodes[0].childNodes.length && parent.childNodes[0].childNodes[0].tagName === 'DIV') {
                    console.log(parent.childNodes[0].childNodes);
                    flkElement.selectedElements = parent.childNodes[0].childNodes[0].childNodes;
                }
            }
            else {
                flkElement.selectedElements.push(parent);
            }

            for (const selectedElement of flkElement.selectedElements) {
                if (!selectedElement.dataset.selected) {
                    selectedElement.classList.add('font-weight-bold');
                    selectedElement.dataset.selected = true;
                }
            }

            /** because of internal array, we have to do a substring. */
            const path = item.substring(item.indexOf('.') + 1);

            let leafText = flkElement.createLeafText(trail.reverse()[0]);
            flkElement._emit('tree-click', flkElement, { path, data, key: leafKey, label: `${leafText.titleText} ${leafText.commentText}`.trim(), branch: typeof data === 'object' });
        }

        convertJsonKeyToTitle(jsonKey) {
            if (!jsonKey) return '';

            if (typeof jsonKey !== 'string') jsonKey = jsonKey.toString();

            const result = jsonKey.replace(/([A-Z_])/g, ($1) => {
                if ($1 === "_") return " ";
                else return ` ${$1}`;
            }).trim();
            const convertedKey = result.charAt(0).toUpperCase() + result.slice(1);
            return convertedKey;
        }

        setContents(newValue) {
            /** check if it came from an attibute callback, or directly set as property */
            const valueToSet = newValue || this.contents || [];

            try {
                switch (typeof valueToSet) {
                    case 'string': {
                        this.contents = JSON.parse(valueToSet);
                        break;
                    }
                    case 'object': {
                        if (Array.isArray(valueToSet)) {
                            this.contents = valueToSet;
                        }
                        else {
                            this.contents = [valueToSet];
                        }
                        break;
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        };

        applyFilter(element) {
            let match, childMatch;
            const detailsEl = element.tagName.toLowerCase() === 'details';

            /** doing a little bit more magic. Only open if a child is found that matches */
            let childElements = element.dataset.branchValues.split(',');
            /** remove the branch */
            childElements.shift();

            let childValues = childElements.join();

            if (this.filter.caseSensitive) {
                match = element.dataset.branchValues.includes(this.filter.value);
                childMatch = childValues.includes(this.filter.value);
            }
            else {
                match = element.dataset.branchValues.toLowerCase().includes(this.filter.value.toLowerCase());
                childMatch = childValues.toLowerCase().includes(this.filter.value.toLowerCase());
            }

            /** show the <li> */
            if (match) {
                this.unselectTree(element);
            }
            else {
                /** doing the opposite, so we are making the non-matches lighter. */
                if (this.searchStyle === 'highlight') {
                    element.parentElement.style.opacity = '50%';
                }
                else {
                    element.parentElement.classList.add('hidden');
                }
            }

            if (detailsEl && match && childMatch) {
                element.setAttribute('open', '');
            }
            else {
                element.removeAttribute('open');
            }
        }

        resetTree(all = true) {
            let foundElements = this.querySelectorAll('[data-branch-values]');

            for (const element of foundElements) {
                element.parentElement.style.opacity = '';
                element.parentElement.classList.remove('hidden');
                if (all) {
                    element.removeAttribute('open');
                }
            }
        }

        unselectTree(element) {
            if (this.searchStyle === 'highlight') {
                element.parentElement.style.opacity = '';
            }
            else {
                element.parentElement.classList.remove('hidden');
            }
            element.removeAttribute('open');
        }

        clearFilter() {
            this.resetTree(false);
            this.filter = { value: '', caseSensitive: false };
        }

        filterTree() {
            let searchTimer = setTimeout(() => {
                let foundElements = this.querySelectorAll('[data-branch-values]');

                for (const element of foundElements) {

                    let filterCleared = this.filter.value === undefined || this.filter.value.length === 0;
                    if (filterCleared) {
                        this.unselectTree(element);
                    }
                    else {
                        this.applyFilter(element);
                    }
                }
                clearTimeout(searchTimer);
            }, 10);
        }

        setFilter(newValue) {
            /** check if it came from an attibute callback, or directly set as property */
            const valueToSet = newValue || {};
            try {
                switch (typeof valueToSet) {
                    case 'string': {
                        if (valueToSet.includes('{')) {
                            this.filter = JSON.parse(valueToSet);
                            if (this.filter.caseSensitive === false) {
                                this.filter.value = this.filter.value.toLowerCase();
                            }
                        }
                        else {
                            this.filter.value = newValue.toLowerCase();
                        }
                        break;
                    }
                    case 'object': {
                        this.filter = valueToSet;
                        break;
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            this.filterTree();
        }


        createLeafText(text) {
            let hasComment = typeof text === 'string' && this.commentType.length ? text.includes(this.commentType[0]) : false;

            let titleText = '';
            let commentText = '';

            if (hasComment) {
                let commentBracketIndex = text.indexOf(this.commentType[0]);
                titleText = this.convertJsonKeyToTitle(text.substring(0, commentBracketIndex));
                commentText = text.substring(commentBracketIndex + 1, text.length - 1).trim();
            }
            else {
                titleText = this.convertJsonKeyToTitle(text);
            }
            return { titleText, commentText }
        }

        createTextTag(text, element) {
            let leafText = this.createLeafText(text);

            if (leafText.commentText) {
                let tagContainer = document.createElement('div');
                let mainTitleElement = document.createElement('span');

                mainTitleElement.innerText = leafText.titleText;

                let commentElement = document.createElement('small');
                commentElement.innerText = leafText.commentText;
                commentElement.style.marginLeft = '1rem';

                tagContainer.append(mainTitleElement, commentElement);
                tagContainer.style.display = 'inline-flex';
                tagContainer.style.alignItems = 'center';

                element.append(tagContainer);
            }
            else {
                element.innerText = leafText.titleText;
            }
        }

        createLeaf(text, element, key, branchValues = []) {
            let leaf = document.createElement('li');
            leaf.classList.add('cursor-no-select');
            leaf.style.marginTop = '0.4rem';
            leaf.dataset.branchKey = key;

            const iconToUse = this.iconSet === 'file' ? fileListIcon : columnListIcon;
            leaf.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;
            leaf.style.position = 'relative';
            leaf.style.left = '2px';
            let leafText = document.createElement('span');

            let allBranchValues = [text].concat(branchValues);
            leafText.dataset.branchValues = [...new Set(allBranchValues)].join();
            /** to get the leaf */
            leafText.dataset.leafKey = allBranchValues[0];

            this.createTextTag(text, leafText);

            leafText.style.position = 'relative';
            leafText.style.top = '-3px';
            leaf.append(leafText);

            if (element.tagName.toLowerCase() !== this.listType) {
                let listContainer = document.createElement(this.listType);
                const iconToUse = this.iconSet === 'file' ? folderListIcon : tableListIcon;
                listContainer.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;
                listContainer.append(leaf);
                element.append(listContainer);
            }
            else {
                element.append(leaf);
            }
            return;
        }

        createBranch(node, element, key, depth) {
            /** We can now cap the depth, for better visualization */
            if (depth === this.maxDepth && typeof node === 'object') {
                let leafNodes = Array.isArray(node) ? node : Object.keys(node);

                for (const leaf of leafNodes) {
                    let branchValues;
                    if (node[leaf]) {
                        branchValues = this._jsonToValueArray(node[leaf]);
                    }
                    this.createLeaf(leaf, element, `${key}.${leaf}`, branchValues);
                }
            }
            else if (Array.isArray(node)) {
                for (let nodeKey in node) {
                    let branch = document.createElement(this.listType);
                    element.append(this.createBranch(node[nodeKey], branch, `${key}.${nodeKey}`, depth + 1));
                }
            }
            else if (node !== null && typeof node === 'object') {
                let nodeKeys = Object.keys(node);
                const branches = [];
                for (const nodeKey of nodeKeys) {

                    let trunk = document.createElement('li');
                    trunk.classList.add('cursor-no-select');
                    trunk.style.position = 'relative';
                    trunk.style.left = '2px';
                    trunk.dataset.branchKey = `${key}.${nodeKey}`;


                    let branch = document.createElement('details');
                    branch.classList.add('flk-branch');
                    /** set values as we go down, for easy filtering */
                    branch.dataset.branchValues = [nodeKey].concat(this._jsonToValueArray(node[nodeKey])); /** also want to key above. */

                    /** fix offset for custom icon */
                    branch.style.position = 'relative';
                    branch.style.top = '-3px';
                    branch.classList.add('cursor-default');
                    let branchName = document.createElement('summary');

                    this.createTextTag(nodeKey, branchName);
                    branch.dataset.leafKey = nodeKey;

                    branch.append(branchName);
                    trunk.append(this.createBranch(node[nodeKey], branch, `${key}.${nodeKey}`, depth + 1));
                    branches.push(trunk);
                }

                /** check if we started with a list or not.  */
                if (element.tagName.toLowerCase() !== this.listType) {
                    let listContainer = document.createElement(this.listType);
                    const iconToUse = this.iconSet === 'file' ? folderListIcon : tableListIcon;
                    listContainer.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;

                    for (const branch of branches) {
                        listContainer.append(branch);
                    }
                    element.append(listContainer);
                }
                else {
                    for (const branch of branches) {
                        element.append(branch);
                    }
                }
            }
            else {
                this.createLeaf(node, element, key);
            }
            return element;
        }

        createHtml() {
            let mainList = document.createElement(this.listType);

            const iconToUse = this.iconSet === 'file' ? folderListIcon : databaseListIcon;
            mainList.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;
            mainList.style.marginLeft = '3rem';

            if (!this.contents.length) {
                this.component = mainList;
                return;
            }

            let contentsToRender = this.contents;

            for (const key in contentsToRender) {
                mainList = this.createBranch(this.contents[key], mainList, key, 0);
            }
            this.component = mainList;
        };

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case "contents": {
                    this.setContents(newValue);
                    break;
                }
                case "icon-set": {
                    this.iconSet = newValue;
                    break;
                }
                case "max-depth": {
                    this.maxDepth = typeof newValue === 'string' ? parseInt(newValue) : newValue;
                    break;
                }
                case "comment": {
                    this.commentType = newValue;
                    break;
                }
                case "search-style": {
                    this.searchStyle = newValue;
                    break;
                }
                case "filter": {
                    this.setFilter(newValue);
                    break;
                }
            }
            /** in Vue3 this is not triggered. You need to set a :key property and handle that */
            this.init();
        }

        /** grab inner HTML from here */
        connectedCallback() {
            this.init();
        };

        disconnectedCallback() {
            this.base.removeEvents(this);
        };

        /** Needed for vanilla webcomponent and compatibility with Vue3
         * If I try to render this on setContents, Vue3 gives illegal operation.
         */
        init() {
            this.createHtml();
            this.base.render(this);
        };
    }

    customElements.define('flk-table', FlightkitTable);
    customElements.define('flk-draggable', FlightkitDraggable);
    customElements.define('flk-modal', FlightkitModal);
    customElements.define('flk-dropdown', FlightkitDropdown);
    customElements.define('flk-tree-nav', FlightkitTreeNavigation);

})();
