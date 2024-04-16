import JOQ from '@pennions/joq';
import { BaseComponent } from './extensions/base_component';
import { returnEventWithTopLevelElement, returnDataSetValue } from '../htmlbuilder/domTraversal';
import { sortAscendingIcon, sortDescendingIcon } from '../htmlbuilder/icons';

export class FlightkitTable extends HTMLElement {
    base;
    /** to render */
    component = null;
    _contents = [];
    _orderBy = [];
    properties = new Set();
    _columnOrder = [];
    _filter = '';
    _selectionProperty = ''; /** must be an unique property on the element to select on. */
    _selectedIds = new Set(); /** used to sync selections */
    uniqueEntriesByProperties = {};
    propertyLabelDictionary = {};

    _columnTemplates = {}; /** html templates to use for columns */

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
        this._contents = new JOQ(newValue);
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
                    selectionCheckbox.setAttribute('checked', true);
                }
                else {
                    selectionCheckbox.indeterminate = false;
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
                    this._columnTemplates = JSON.parse(newValue) || [];
                    break;
                }
                case 'object': {
                    this._columnTemplates = newValue;
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
        });
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

            if (this._columnTemplates[property]) {
                tableCell.innerHTML = this.parseTemplate(this._columnTemplates[property], rowContent);
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
