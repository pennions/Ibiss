import JOQ from '@pennions/joq';
import { baseComponent } from './extensions/base_component';
import { returnEventWithTopLevelElement, returnDataSetValue } from '../htmlbuilder/domTraversal';
import { sortAscendingIcon, sortDescendingIcon } from '../htmlbuilder/icons';
import { uuidv4 } from '../htmlbuilder/uuid_v4';

export class FlightkitTable extends HTMLElement {
    /** to render */
    component = null;
    _contents = [];
    _orderBy = [];
    properties = new Set();
    _columnOrder = [];
    _filter = '';
    uniqueEntriesByProperties = {};
    propertyLabelDictionary = {};

    static get observedAttributes() {
        return ['contents', 'columns', 'sort', 'direction', 'filter'];
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
        this._contents = new JOQ(newValue);
    }

    get orderBy() {
        return this._orderBy;
    }
    set orderBy(newValue) {
        this._orderBy = newValue;
    }

    get filter() {
        return this._filter;
    }

    set filter(newValue) {
        this._filter = newValue.toString();
    }

    constructor() {
        super();
        this.setContents(this.getAttribute('contents'));
        this.setColumnOrder(this.getAttribute('columns'));
        this.filter = this.getAttribute('filter') || '';
        const presetOrder = this.getAttribute('sort');
        const presetDirection = this.getAttribute('direction');
        if (presetOrder) {
            this._orderBy.push({
                propertyName: presetOrder,
                direction: presetDirection
            });
        }
    }
    /** we only need this if we dont use get/set */
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents": {
                this.setContents(newValue);
                break;
            }
            case "sort": {
                this.orderBy = [{
                    propertyName: newValue,
                    direction: this.getAttribute('direction')
                }];
                break;
            }
            case 'filter': {
                this.filter = newValue || '';
                break;
            }
            case "columns": {
                this.setColumnOrder(newValue);
                break;
            }
            case "direction": {
                this.orderBy = [{
                    propertyName: this.getAttribute('sort'),
                    direction: newValue
                }];
                break;
            }
        }
    }

    createHtml() {
        const tableElement = document.createElement('table');

        /** because of JOQ */
        if (this.orderBy.length) {
            this.contents.sort(this.orderBy);
        }
        else {
            /** reset if no order */
            this.contents.sort([]);
        }


        if (this.filter.length) {
            const filters = [];

            for (const property of this.columnOrder) {
                filters.push({
                    propertyName: property,
                    value: this.filter,
                    operator: 'like',
                    type: 'or', /** optional, defaults to "and" **/
                    ignoreCase: true /** optional, defaults to "false" **/
                });
            }
            this.contents.filter(filters);
        }
        else {
            this.contents.filter([]);
        }

        const tableHead = this.createHead();
        tableElement.append(tableHead);


        const data = this.contents.execute();
        const tableBody = this.createBody(data);
        tableElement.append(tableBody);

        this.component = tableElement;
    }

    connectedCallback() {
        this.createHtml();
        baseComponent.render(this);
    };
    disconnectedCallback() {
        baseComponent.removeEvents(this);
    }

    sortData(event) {
        console.log(event);
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
        baseComponent.render(ftElement);
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

    setContents(newValue) {
        /** check if it came from an attibute callback, or directly set as property */
        const valueToSet = newValue || this.contents || [];
        try {

            switch (typeof valueToSet) {
                case 'string': {
                    this.contents = JSON.parse(valueToSet) || [];
                }
                case 'object': {
                    if (Array.isArray(valueToSet)) {
                        this.contents = valueToSet;
                    }
                    else {
                        this.contents = [valueToSet];
                    }
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
        });
        const convertedKey = result.charAt(0).toUpperCase() + result.slice(1);
        this.propertyLabelDictionary[jsonKey] = convertedKey;
        return convertedKey;
    }

    createRow(rowContent) {
        const tableRow = document.createElement('tr');

        for (const property of this.columnOrder) {
            const tableCell = document.createElement('td');
            tableCell.innerText = rowContent[property];
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

        for (const header of this.columnOrder) {

            const thId = `flk-${uuidv4()}`; /** to add the sort event */
            const thCell = document.createElement('th');
            thCell.id = thId;
            thCell.dataset.column = header;

            const headerText = document.createElement('span');
            headerText.innerText = this.convertJsonKeyToTitle(header);
            thCell.append(headerText);
            baseComponent.addEvent(`#${thId}`, 'click', this.sortData);

            const orderProperties = this.orderBy.find(obp => obp.propertyName === header);
            if (orderProperties) {
                const iconElement = document.createElement('span');
                iconElement.innerHTML = orderProperties.direction === 'asc' ? sortAscendingIcon : sortDescendingIcon;
                thCell.append(iconElement);
            }
            headerRow.append(thCell);
        }
        tableHead.append(headerRow);
        return tableHead;
    };

    /** Needed for vanilla webcomponent and compatibility with Vue3
     * If I try to render this on setContents, Vue3 gives illegal operation.
     */
    init() {
        this.createHtml();
        baseComponent.render(this);
    }
}
