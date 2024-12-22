import { sortJsonArray } from '../flightkit-functions/sorting';
import { BaseComponent } from './extensions/base_component';
import { returnEventWithTopLevelElement, returnDataSetValue } from '../flightkit-functions/domTraversal';
import { sortAscendingIcon, sortDescendingIcon } from '../flightkit-functions/icons';

export class FlightkitTable extends HTMLElement {
    base;
    /** to render */
    component = null;
    properties = new Set();
    uniqueEntriesByProperties = {};
    propertyLabelDictionary = {};
    contentAnnotations = {}
    _contents = []; /** has getter/setter */
    _orderBy = [];
    _columnOrder = [];
    _filter = '';
    _selectionProperty = ''; /** must be an unique property on the element to select on. */
    _selectedIds = new Set(); /** used to sync selections */
    _templates = {}; /** html templates to use for columns and caption/tfoot */
    _templateClasses = {};
    _hideValues = [];
    _hideColumn = "";
    _page = "";
    _itemsPerPage = 0;

    static get observedAttributes() {
        return ['contents', 'columns', 'order', 'filter', 'selection-property', 'templates', 'annotations', 'hide', 'pagination'];
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
            case "annotations": {
                this.setAnnotations(newValue);
                break;
            }
            case "hide": {
                this.setHiddenRows(newValue);
                break;
            }
            case "pagination": {
                this.setPagination(newValue);
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

        let filteredData = []
        if (this.filter.length) {
            for (const data of tableData) {
                let valuesInData = Object.values(data).join(" ").toLowerCase();
                let valueInAnnotation = false;
                if (Object.keys(this.contentAnnotations).length) {

                    for (const property of this.columnOrder) {
                        const annotation = this.getAnnotation(property, "body");

                        let annotationProperties = annotation[property];

                        if (annotationProperties && Object.keys(annotationProperties).length) {
                            let dataComparison = data[property]
                          
                            if (dataComparison != null) {
                                let annotationValue = annotationProperties[dataComparison]
                                if (annotationValue) {
                                    valueInAnnotation = annotationValue.toString().toLowerCase().includes(this.filter.toLowerCase())
                                }
                            }
                        }

                        if (valueInAnnotation) {
                            break;
                        }
                    }
                }

                if (valuesInData.includes(this.filter.toLowerCase()) || valueInAnnotation) {
                    filteredData.push(data)
                }
            }
        }
        else {
            filteredData = tableData
        }

        const tableBody = this.createBody(filteredData);
        tableElement.append(tableBody);

        if (this._templates['tfoot']) {
            tableElement.append(this._createElement('tfoot'));
        }
        this.component = tableElement;
    }

    connectedCallback() {
        this.setContents(this.getAttribute('contents'));
        this.setTemplates(this.getAttribute('templates'));
        this.setColumnOrder(this.getAttribute('columns'));
        this.filter = this.getAttribute('filter') || '';
        this.setAnnotations(this.getAttribute('annotations'));
        this.setHiddenRows(this.getAttribute('hide'));

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

        this.createHtml();
        this.base.render(this);
    };
    disconnectedCallback() {
        this.base.removeEvents(this);
    }

    _updateCheckboxes(ftElement) {
        const allSelectionCheckboxes = ftElement.querySelectorAll('.flk-selection-checkbox');
        const currentSelection = ftElement._selectedIds.size;
        const maxSelection = ftElement.contents.length;
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
            ftElement.contents.map(obj => obj[ftElement._selectionProperty])) : new Set();

        const selection = isChecked ? ftElement.contents : [];
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

        const selection = ftElement.contents.filter(obj => ftElement._selectedIds.has(obj[selectionProperty]));
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

    setPagination(newPagination) {
        if (newPagination) {
            const paginationParts = newPagination.split("|");
            this._page = parseInt(paginationParts[0]);
            this._itemsPerPage = parseInt(paginationParts[1]);

            /** Only on initialize */
            if (this.component === null) {
                let renderTimer = setTimeout(() => {
                    this._emit('paginate', this, { maxPages: Math.ceil(this._contents.length / this._itemsPerPage) })
                    clearTimeout(renderTimer);
                }, 100)
            }
            else {
                this._emit('paginate', this, { maxPages: Math.ceil(this._contents.length / this._itemsPerPage) })
            }
        }
    }

    /** signature: column|value1,value2,value3 */
    setHiddenRows(hideRows) {
        if (hideRows) {
            const parts = hideRows.split("|");
            this._hideColumn = parts[0]
            this._hideValues = parts[1].split(',');
        }
        else {
            this._hideValues = [];
            this._hideColumn = "";
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

    setTemplate(name, template) {
        if (!name || !template || typeof template !== 'string') return;
        this._templates[name] = template;
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

    setAnnotations(newValue) {
        /** check if it came from an attibute callback, or directly set as property */
        const valueToSet = newValue || this.contentAnnotations || {};
        try {
            switch (typeof valueToSet) {
                case 'string': {
                    this.contentAnnotations = JSON.parse(valueToSet) || {};
                    break;
                }
                case 'object': {
                    this.contentAnnotations = valueToSet;
                    break;
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    getAnnotation(property, type) {
        if (Object.keys(this.contentAnnotations).length === 0) return {}
        if (!this.contentAnnotations[type]) return {}

        const possibleAnnotation = this.contentAnnotations[type];
        if (!possibleAnnotation.hasOwnProperty(property)) return {}

        /** use _ as a placeholder to annotate empty fields */
        if (!possibleAnnotation[property]) return {}

        return possibleAnnotation;
    };


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

    /** replaces {{ property }} with the value or passes property to a globally available function */
    parseTemplate(property, template, object, annotation) {
        return template.replace(/\{\{([\s\S]+?)\}\}/gim, (_, p1) => {

            let replacement, templateItem = '';

            p1 = p1.trim();

            /** Check if it is a function or annotation */
            if (p1[0] === "$") {
                replacement = window[p1.substring(1)](property, object, annotation);
            } else if (p1[0] === "+") {
                replacement = annotation[property] && annotation[property][p1.substring(1)] ? annotation[property][p1.substring(1)] : "";
            }
            else {
                templateItem = object[p1].toString();
            }

            if (templateItem) {
                if (annotation[property] && annotation[property][templateItem]) {
                    replacement = annotation[property][templateItem].trim();
                }
                else {
                    replacement = templateItem.trim();
                }
            }

            return Array.isArray(replacement) ? replacement.join(', ') : replacement.toString();
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
            const annotation = this.getAnnotation(property, "body");

            const tableCell = document.createElement('td');
            let currentValue = rowContent[property];

            if (this._templates[property]) {
                tableCell.innerHTML = this.parseTemplate(property, this._templates[property], rowContent, annotation);
                /** when you use templating inside the element. */
                if (this._templateClasses[property]) {
                    tableCell.classList.add(...this._templateClasses[property]);
                }
            }
            else {
                if (annotation && annotation.hasOwnProperty(property)) {
                    let possibleCellValue = annotation[property][currentValue || "_"];
                    /** check if there is actually a value else resort to the original one */
                    if (possibleCellValue && possibleCellValue.length) {
                        tableCell.title = currentValue;
                    }
                    tableCell.innerText = possibleCellValue || currentValue;
                }
                else {
                    tableCell.innerText = currentValue;
                }
            }

            tableRow.append(tableCell);
        }
        return tableRow;
    };

    createBody(data) {
        const tableBody = document.createElement('tbody');

        let paginatedData = structuredClone(data);
        if (this._itemsPerPage > 0) {
            let startingPoint = 0;
            let endpoint = this._itemsPerPage;

            if (this._page - 1 > 0) {
                startingPoint = this._page * this._itemsPerPage - this._itemsPerPage;
                endpoint = startingPoint + this._itemsPerPage;
            }

            paginatedData = paginatedData.slice(startingPoint, endpoint)
        }

        for (const rowContent of paginatedData) {
            /** check if we should hide this row */
            if (rowContent[this._hideColumn] && this._hideValues.includes(rowContent[this._hideColumn].toString())) continue;

            const tableRow = this.createRow(rowContent);
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
            const maxSelection = this.contents.length;

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
            const annotation = this.getAnnotation(header, "header");

            if (annotation[header]) {
                headerText.title = header;
                headerText.innerText = annotation[header];
            }
            else {
                headerText.innerText = this.convertJsonKeyToTitle(header);
            }

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
