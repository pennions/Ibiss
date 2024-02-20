import JOQ from '@pennions/joq';
import { t0_base_class } from '../tier0/t0_base_class';

export class FtTable extends t0_base_class {
    _contents;
    /**
     * metadata:
     * columnOrder, array of names as string.
     * orderBy: object or array of objects with    { propertyName: string, direction: 'asc' | 'desc' }
     * filters
     */
    _metadata;
    properties = new Set();
    _columnOrder;
    uniqueEntriesByProperties = {};
    propertyLabelDictionary = {};

    get columnOrder() {
        return this._columnOrder && this._columnOrder.length ? this._columnOrder : this.properties;
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
        this.render();
    }

    get contents() {
        return this._contents;
    }

    set contents(value) {
        this.analyzeData(value);
        this._contents = new JOQ(value);
        this.render();
    }

    constructor() {
        super();
        this.observedAttributes = ['contents', 'columnOrder', 'column-order'];

        const presetColumnOrder = this.getAttribute('column-order');
        if (presetColumnOrder) {
            this._columnOrder = presetColumnOrder.split(',');
        }

        this._innerHTML = /*html*/`<table class="${this._topLevelClasses.join(' ')}">${this.innerHTML}</table>`;
    }

    analyzeData(value) {
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
        const valueToSet = newValue || this.contents;
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

    attributeChangedCallback(name, oldValue, newValue) {

        switch (name) {
            case "contents": {
                this.setContents(newValue);
                break;
            }
            default: {
                super.attributeChangedCallback(name, oldValue, newValue);
            }
        }
    }

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

        for (const header of this.columnOrder) {
            const thCell = document.createElement('th');
            thCell.innerText = this.convertJsonKeyToTitle(header);
            headerRow.append(thCell);
        }
        tableHead.append(headerRow);
        return tableHead;
    };

    render() {
        if (this.contents && this.contents.model) {
            this.beforeRender();
            const tableElement = document.createElement('table');

            if (this._topLevelClasses.length) {
                tableElement.classList.add(...this._topLevelClasses);
            }
            /** because of JOQ */
            const data = this.contents.execute();

            const tableHead = this.createHead();
            tableElement.append(tableHead);

            const tableBody = this.createBody(data);
            tableElement.append(tableBody);
            this.innerHTML = "";
            this.append(tableElement);
            this.afterRender();
        }
    }
}