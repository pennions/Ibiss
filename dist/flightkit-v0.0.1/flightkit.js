(function () {
    'use strict';

    function isFlightkitElement(tagName) {
        return tagName.toUpperCase().includes('FLK-');
    }

    /**
     * @returns top level flightkit element
     */
    function returnEventWithTopLevelElement(event) {
        let { timeStamp, type, x, y } = event;

        let target = event.target;

        do {
            if (isFlightkitElement(target.tagName)) {
                break;
            }
            else {
                target = target.parentNode;
            }
        }
        while (!isFlightkitElement(target.tagName)); /** check until we get the flightkit element */

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

    const baseComponent = {

        /** This is the 'custom component' */
        renderTimeout: null,
        _topLevelClasses: [],
        _events: [],

        render(parentElement) {
            if (!parentElement.component) throw new Error("Component is not assigned! Can't render");
            parentElement.id = parentElement.id ? parentElement.id : `flk-${uuidv4()}`; /** prefixing with flk- because it can not start with a number */

            /** now it works with vue style events */
            const eventsToAdd = this._getAllEventAttributes(parentElement);

            if (eventsToAdd) {
                const selector = `#${parentElement.id}`;

                for (const event of eventsToAdd) {
                    const eventAttribute = `@${event}`;
                    this.addEvent(selector, 'click', parentElement.getAttribute(eventAttribute));
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
        },

        addEvent(selector, eventType, callback) {
            this._events.push({ selector, eventType, callback });
        },

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
        },

        _getAllEventAttributes(parentElement) {
            const attributes = parentElement.attributes;
            const eventAttributes = Array.from(attributes).filter(attr => attr.name.startsWith('@'));
            /** remove custom events, because these need to be bound specifically */
            return eventAttributes.map(attr => attr.name.slice(1));
        },

        _isFlightkitElement(tagName) {
            return tagName.toUpperCase().includes('FLK-');
        },

        _outerEventHandler(event) {
            const ftEvent = returnEventWithTopLevelElement(event);
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
        },

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
        },

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
        },

        _assignToDom(parentElement, element) {
            parentElement.innerHTML = "";
            parentElement.append(element);
            this._addEvents(parentElement);
        },
    };

    /** example component */

    class FlightkitButton extends HTMLElement {
        constructor() {
            super();
            baseComponent.addEvent('#megafoo', 'click', this.test2);
        }

        test2() {
            alert("inner!");
        }

        /** grab inner HTML from here */
        connectedCallback() {
            const btnElement = document.createElement('button');
            btnElement.innerHTML = this.innerHTML;
            btnElement.id = "megafoo";
            /** set it to be rendered */
            this.component = btnElement;
            
            baseComponent.render(this);
        };
        disconnectedCallback() {
            baseComponent.removeEvents(this);
        }
    }

    var DataType;
    (function (DataType) {
        DataType["Date"] = "date";
        DataType["String"] = "string";
        DataType["Float"] = "float";
        DataType["Number"] = "number";
        DataType["Array"] = "array";
        DataType["Object"] = "object";
        DataType["Bool"] = "bool";
        DataType["Currency"] = "currency";
        DataType["Undefined"] = "undefined";
        DataType["Null"] = "null";
    })(DataType || (DataType = {}));
    const ValueRegexes = {
        date: /^(\d{1,4}-\d{1,4}-\d{1,4}(T)?)/gim,
        currency: /^[$|€]\s?[0-9]*(\.|,)?\d*(\.|,)?\d*/gim,
        float: /\d+[,|.]\d+[,|.]?\d*/gim,
        currencySign: /\$|€/gim,
        array: /^\s?[[].[^,]+[\]],?/gi,
        precision: /[-+$€,.]/gm,
        string: /[a-zA-Z]/gim
    };
    const TypeCheck = (inputValue) => {
        if (inputValue === null || inputValue === "null")
            return DataType.Null;
        if (!inputValue && inputValue !== 0 && inputValue !== false)
            return DataType.Undefined; // !inputValue means also ignoring 0 and false
        const dateValue = new RegExp(ValueRegexes.date).exec(inputValue);
        if (dateValue !== null && !isNaN(Date.parse(inputValue))) {
            return DataType.Date;
        }
        if (new RegExp(ValueRegexes.currency).exec(inputValue)) {
            return DataType.Currency;
        }
        if (!new RegExp(ValueRegexes.string).exec(inputValue) && new RegExp(ValueRegexes.float).exec(inputValue.toString())) {
            return DataType.Float;
        }
        if (!isNaN(inputValue) || inputValue === 0) {
            return DataType.Number;
        }
        if (Array.isArray(inputValue)) {
            return DataType.Array;
        }
        if (typeof inputValue === "object") {
            return DataType.Object;
        }
        return DataType.String;
    };
    const TypeConversion = (inputValue, dataType) => {
        if (!dataType)
            dataType = TypeCheck(inputValue);
        const result = { value: undefined, type: dataType, currencySign: "" };
        switch (result.type) {
            case DataType.String: {
                result.value = inputValue.toString();
                break;
            }
            case DataType.Float:
            case DataType.Currency: {
                inputValue = inputValue.toString();
                const commas = inputValue.match(new RegExp(/(,)/gim));
                const dots = inputValue.match(new RegExp(/(\.)/gim));
                if (commas) {
                    for (let comma = 1; comma <= commas.length; comma++) {
                        if (comma === commas.length && !dots) /** if only one comma and no dot, it will be a dot.*/
                            inputValue = inputValue.replace(",", ".");
                        else {
                            inputValue = inputValue.replace(",", "");
                        }
                    }
                }
                if (result.type === DataType.Currency) {
                    const currencySignRegex = new RegExp(ValueRegexes.currencySign);
                    const currencySign = currencySignRegex.exec(inputValue);
                    result.currencySign = currencySign !== null ? currencySign[0] : "";
                    inputValue = inputValue.replace(currencySignRegex, "");
                }
                result.value = parseFloat(inputValue).toPrecision(12);
                break;
            }
            case DataType.Number: {
                result.value = Number(inputValue);
                break;
            }
            case DataType.Date: {
                result.value = Date.parse(inputValue); /** Get milliseconds, makes searching easier. */
                break;
            }
            case DataType.Array: {
                if (inputValue.length) {
                    if (typeof inputValue[0] === "object") {
                        result.value = inputValue
                            .map((item) => JSON.stringify(item)) // No nesting yet.
                            .join(", ");
                    }
                    else {
                        result.value = inputValue.join(", ");
                    }
                }
                else {
                    result.value = "";
                }
                break;
            }
            case DataType.Object: {
                result.value = inputValue;
                break;
            }
            case DataType.Undefined: {
                result.value = "";
                break;
            }
            case DataType.Null: {
                result.value = null;
                break;
            }
        }
        return result;
    };
    function getColumnValue(column, jsonObject) {
        const propertyTrail = column.split('.');
        /** it will be an object first, and later it will be the actual value */
        let objectValue;
        for (let property of propertyTrail) {
            property = property.trim();
            if (!objectValue)
                objectValue = jsonObject[property];
            else if (typeof objectValue === "object" && !Array.isArray(objectValue))
                objectValue = objectValue[property];
        }
        return objectValue;
    }

    function distinctJsonProperties(jsonArray, columnNames, concatenationToken) {
        /** Nothing to distinct */
        if (!columnNames || !columnNames.length) {
            return jsonArray;
        }
        const groupedObjects = [];
        const criteriaMet = [];
        for (const jsonObject of jsonArray) {
            const criteria = {};
            let newCriteria = "";
            for (const criteriaColumn of columnNames) {
                const critValue = getColumnValue(criteriaColumn, jsonObject);
                /** for use to group */
                criteria[criteriaColumn] = critValue;
                /** track which combination of values has been grouped already  */
                newCriteria += critValue;
            }
            if (!criteriaMet.includes(newCriteria)) {
                let critGroup = jsonArray;
                const criteriaKeys = Object.keys(criteria);
                for (const critKey of criteriaKeys) {
                    critGroup = critGroup.filter((obj) => obj[critKey] === criteria[critKey]);
                }
                criteriaMet.push(newCriteria);
                groupedObjects.push(critGroup);
            }
        }
        const mergedObjects = [];
        for (const objectGroup of groupedObjects) {
            let mergedObject = {};
            for (const jsonObject of objectGroup) {
                const jsonProperties = Object.keys(mergedObject);
                if (!jsonProperties.length) {
                    mergedObject = jsonObject;
                    continue;
                }
                for (const column of jsonProperties) {
                    if (!columnNames.includes(column)) {
                        const mergedValue = mergedObject[column];
                        if (Array.isArray(mergedValue)) {
                            const valueToMerge = jsonObject[column];
                            if (Array.isArray(valueToMerge)) {
                                mergedObject[column] = [
                                    ...new Set(...mergedObject[column].concat(jsonObject[column])),
                                ];
                            }
                            else {
                                if (!mergedObject[column].includes(jsonObject[column])) {
                                    mergedObject[column].push(jsonObject[column]);
                                }
                            }
                        }
                        else {
                            if (isNaN(mergedObject[column]) && isNaN(jsonObject[column])) {
                                if (mergedObject[column] !== jsonObject[column]) {
                                    mergedObject[column] = [
                                        mergedObject[column],
                                        jsonObject[column],
                                    ];
                                }
                            }
                            else {
                                mergedObject[column] =
                                    mergedObject[column] + jsonObject[column];
                            }
                        }
                    }
                }
            }
            mergedObjects.push(mergedObject);
        }
        /** merge the arrays */
        mergedObjects.forEach((jsonObject) => {
            for (const prop in jsonObject) {
                if (Array.isArray(jsonObject[prop])) {
                    jsonObject[prop] = jsonObject[prop].join(concatenationToken);
                }
            }
        });
        return mergedObjects;
    }

    const bigger = (value, comparisonValue) => value > comparisonValue;
    const smaller = (value, comparisonValue) => value < comparisonValue;
    const biggerEquals = (value, comparisonValue) => value >= comparisonValue;
    const smallerEquals = (value, comparisonValue) => value <= comparisonValue;
    const equals = (value, comparisonValue, ignoreCase) => {
        if (ignoreCase)
            return value.toLowerCase() == comparisonValue.toLowerCase();
        else
            return value == comparisonValue;
    };
    const superEquals = (value, comparisonValue) => value === comparisonValue;
    const notEquals = (value, comparisonValue) => value != comparisonValue;
    const superNotEquals = (value, comparisonValue) => value !== comparisonValue;
    const like = (value, comparisonValue) => {
        if (comparisonValue !== null && comparisonValue !== undefined && typeof value === 'string') {
            return value.toLowerCase().indexOf(comparisonValue.toString().toLowerCase()) >= 0;
        }
        else
            return false;
    };
    const genericLike = (value, comparisonValue) => {
        if (comparisonValue !== null && comparisonValue !== undefined) {
            return value.toString().toLowerCase().indexOf(comparisonValue.toString().toLowerCase()) >= 0;
        }
        else
            return false;
    };
    const notLike = (value, comparisonValue) => {
        if (comparisonValue !== null && comparisonValue !== undefined && typeof value === 'string') {
            return value.toLowerCase().indexOf(comparisonValue.toString().toLowerCase()) < 0;
        }
        return false;
    };
    function getComparisonFunction(comparisonOperator) {
        switch (comparisonOperator.toLowerCase()) {
            case ">":
                return bigger;
            case "<":
                return smaller;
            case ">=":
                return biggerEquals;
            case "<=":
                return smallerEquals;
            case "is":
            case "==":
                return equals;
            case "!is":
            case "!=":
                return notEquals;
            case "===":
                return superEquals;
            case "!==":
                return superNotEquals;
            case "like":
            case "~":
            case "contains":
                return like;
            case "!contains":
            case "!like":
            case "!~":
                return notLike;
            default:
                return genericLike;
        }
    }

    var FilterType;
    (function (FilterType) {
        FilterType["And"] = "and";
        FilterType["Or"] = "or";
    })(FilterType || (FilterType = {}));
    var FilterOperator;
    (function (FilterOperator) {
        FilterOperator["GreaterThan"] = ">";
        FilterOperator["LesserThan"] = "<";
        FilterOperator["EqualsOrGreater"] = ">=";
        FilterOperator["EqualsOrLesser"] = "<=";
        FilterOperator["Is"] = "is";
        FilterOperator["Equals"] = "==";
        FilterOperator["NotEquals"] = "!=";
        FilterOperator["SuperEquals"] = "===";
        FilterOperator["SuperNotEquals"] = "!==";
        FilterOperator["Like"] = "like";
        FilterOperator["NotLike"] = "!like";
        FilterOperator["Contains"] = "contains";
        FilterOperator["NotContains"] = "!contains";
    })(FilterOperator || (FilterOperator = {}));
    function filterJsonArray(jsonArray, filterDetails) {
        if (filterDetails.length === 0)
            return jsonArray;
        return filterFunction(jsonArray, filterDetails);
    }
    function filterFunction(jsonArray, filterDetails) {
        const searchResults = [];
        const filters = [];
        let filterGroup = [];
        for (const filter of filterDetails) {
            if (!filter.type || filter.type === FilterType.And) {
                filterGroup.push(filter);
            }
            else {
                if (filterGroup.length) {
                    filters.push(filterGroup);
                }
                filterGroup = [filter];
            }
        }
        filters.push(filterGroup);
        let indexThatMatch = [];
        for (const filterGroup of filters) {
            indexThatMatch = indexThatMatch.concat(compareValues(jsonArray, filterGroup));
        }
        /** deduplicate */
        indexThatMatch = [...new Set(indexThatMatch)];
        const jsonArrayLength = jsonArray.length;
        for (let index = 0; index < jsonArrayLength; index++) {
            if (indexThatMatch.includes(index)) {
                searchResults.push(jsonArray[index]);
            }
        }
        return searchResults;
    }
    const compareValues = function (jsonArray, filterDetails) {
        const matches = [];
        if (!jsonArray)
            return matches;
        for (const [index, objectToCheck] of jsonArray.entries()) {
            let itemMatches = true;
            for (const filterDetail of filterDetails) {
                const columnValue = getColumnValue(filterDetail.propertyName, objectToCheck);
                const parsedValue = TypeConversion(columnValue).value;
                const comparisonValue = TypeConversion(filterDetail.value).value;
                const comparisonFunction = getComparisonFunction(filterDetail.operator);
                if (!comparisonFunction(parsedValue, comparisonValue, filterDetail.ignoreCase)) {
                    itemMatches = false;
                    break;
                }
            }
            /** pushing the index so we can deduplicate later with other or clauses */
            if (itemMatches) {
                matches.push(index);
            }
        }
        return matches;
    };

    function groupJsonArray(jsonArray, groupByProperties) {
        if (!groupByProperties || groupByProperties.length === 0)
            return jsonArray;
        if (groupByProperties.length > 1) {
            return multipleGroupFunction(jsonArray, groupByProperties);
        }
        else {
            return groupFunction(jsonArray, groupByProperties[0]);
        }
    }
    function groupFunction(objects, groupByProperty) {
        const arrayOfGroupedObjects = [];
        const groupIndex = []; // the index in the arrayOfGroupedObjects
        do {
            if (!objects || objects.length === 0)
                break;
            /** need to use shift instead of pop, because of sorting. else we are unintentionally reversing the array */
            const nextInline = objects.shift();
            if (!nextInline)
                break;
            const value = nextInline[groupByProperty];
            const index = groupIndex.indexOf(value.toString());
            if (index >= 0) {
                arrayOfGroupedObjects[index].push(nextInline);
            }
            else {
                groupIndex.push(value.toString());
                if (arrayOfGroupedObjects[groupIndex.length - 1] !== undefined) // If it's not empty, we push a new one inside existing array
                    arrayOfGroupedObjects[groupIndex.length - 1].push(nextInline);
                else {
                    arrayOfGroupedObjects.push([nextInline]); // We create a new array and push that
                }
            }
        } while (objects.length > 0);
        return arrayOfGroupedObjects;
    }
    function multipleGroupFunction(objects, groupByProperties) {
        let arrayOfGroupedObjects = [];
        let tempArray = [];
        groupByProperties.forEach((property) => {
            // we start
            if (arrayOfGroupedObjects.length === 0) {
                arrayOfGroupedObjects = arrayOfGroupedObjects.concat(groupFunction(objects, property));
            }
            else {
                for (const objectArray of arrayOfGroupedObjects) {
                    tempArray = tempArray.concat(groupFunction(objectArray, property));
                }
                arrayOfGroupedObjects = tempArray;
                tempArray = [];
            }
        });
        return arrayOfGroupedObjects;
    }

    function selectJsonArray(jsonArray, selection) {
        if (selection.length === 0)
            return jsonArray;
        return selectFunction(jsonArray, selection);
    }
    function selectFunction(jsonArray, selection) {
        let subselectedJsonArray = [];
        for (const object of jsonArray) {
            const newObject = {};
            for (const property of selection) {
                newObject[property] = object[property];
            }
            subselectedJsonArray.push(newObject);
        }
        return subselectedJsonArray;
    }

    var SortDirection;
    (function (SortDirection) {
        SortDirection["ascending"] = "asc";
        SortDirection["descending"] = "desc";
    })(SortDirection || (SortDirection = {}));
    function sortJsonArray(jsonArray, sortDetails) {
        if (!sortDetails || sortDetails.length === 0)
            return jsonArray;
        /** need to make a copy, sort is in-place. So original order would be lost */
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
    function sortFunction(applicableSorters, index = 0) {
        return function (a, b) {
            const { propertyName, direction } = applicableSorters[index];
            /** if it is undefined, just make it a string. */
            let valueA = a[propertyName] || "";
            let valueB = b[propertyName] || "";
            const dateRegex = /^(\d{1,4}-\d{1,4}-\d{1,4}(T)?)/gim;
            const valuesAreDates = (valueA instanceof Date && valueB instanceof Date) || (dateRegex.test(valueA) && dateRegex.test(valueB));
            if (valuesAreDates) {
                valueA = valueA instanceof Date ? valueA.valueOf() : new Date(Date.parse(valueA));
                valueB = valueB instanceof Date ? valueB.valueOf() : new Date(Date.parse(valueB));
            }
            const valuesAreNumbers = !isNaN(valueA) && !isNaN(valueB);
            if (valuesAreNumbers) {
                valueA = parseFloat(valueA).toPrecision(12);
                valueB = parseFloat(valueB).toPrecision(12);
            }
            const valuesAreBooleans = (valueA === "true" || valueA === "false") && (valueB === "true" || valueB === "false");
            if (valuesAreBooleans) {
                valueA = valueA === "true";
                valueB = valueB === "true";
            }
            /** set the values genericly */
            let leftHandValue, rightHandValue;
            switch (direction) {
                case SortDirection.descending: {
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
            // check if -1 or 1, 0. if 0 then check again.
            let comparisonValue = 0;
            if (valuesAreBooleans || valuesAreDates || valuesAreNumbers) {
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

    const sumJsonArray = (jsonArray, propertiesToSum) => {
        if (!propertiesToSum)
            return {};
        return sumFunction(jsonArray, propertiesToSum);
    };
    function sumFunction(jsonArray, propertiesToSum) {
        const sumObject = {};
        for (const sumProperty of propertiesToSum) {
            let allValuesToSum = jsonArray.map(object => object[sumProperty].toString());
            const dataTypes = allValuesToSum.map(value => TypeCheck(value));
            const isFloat = dataTypes.some(type => type === DataType.Float);
            if (isFloat) {
                allValuesToSum = allValuesToSum.map(value => parseFloat(value));
                sumObject[sumProperty] = parseFloat(allValuesToSum.reduce((a, b) => a + b).toFixed(2));
            }
            else {
                allValuesToSum = allValuesToSum.map(value => parseInt(value));
                sumObject[sumProperty] = allValuesToSum.reduce((a, b) => a + b);
            }
        }
        return sumObject;
    }

    class JOQ {
        model;
        sortDetails = [];
        filterDetails = [];
        selection = [];
        groupByProperties = [];
        distinctProperties = [];
        concatenationToken = ', ';
        /**
         * Jelmers Object Query Class
         */
        constructor(jsonArray) {
            /** Make a hard copy */
            this.model = JSON.parse(JSON.stringify(jsonArray));
        }
        /** Same as order, but here you can give the complete sorting details.*/
        sort(sortDetails) {
            this.sortDetails = sortDetails;
            return this;
        }
        /** Order the array ascending or descending for the values of given property*/
        orderBy(propertyName, direction) {
            this.sortDetails.push({ propertyName, direction });
            return this;
        }
        /** Add a consecutive ordering of the array ascending or descending for the values of given property*/
        thenOrderBy(propertyName, direction) {
            return this.orderBy(propertyName, direction);
        }
        /**
         * Set the complete where / filter clause specification, for automated processes
         * @param {Array<FilterDetail>} filterDetails an array with { column: string, value: any, operator: FilterOperator, type?: FilterType }
         * @returns
         */
        filter(filterDetails) {
            if (Array.isArray(filterDetails)) {
                this.filterDetails = filterDetails;
            }
            else {
                this.filterDetails.push(filterDetails);
            }
            return this;
        }
        ;
        /**
         * Add a where clause
         * @param {Array<FilterDetail>} filterDetails an array with { column: string, value: any, operator: FilterOperator, type?: FilterType }
         * @returns
         */
        where(propertyName, operator, value, type, ignoreCase) {
            this.filterDetails.push({ propertyName, operator, value, type, ignoreCase });
            return this;
        }
        ;
        /** Same as where, but prefills the FilterType with 'and' */
        andWhere(propertyName, operator, value, ignoreCase) {
            this.where(propertyName, operator, value, FilterType.And, ignoreCase);
            return this;
        }
        ;
        /** Same as where, but prefills the FilterType with 'or' */
        orWhere(propertyName, operator, value, ignoreCase) {
            this.where(propertyName, operator, value, FilterType.Or, ignoreCase);
            return this;
        }
        ;
        /**
         * Sets propertynames that you want to group on, order matters.
         * @param {Array<string> | String} groupByProperties
         * @returns joq object
         */
        group(groupByProperties) {
            this.groupByProperties = groupByProperties;
            return this;
        }
        /** Same as group, semantic sugar */
        groupBy(propertyName) {
            this.groupByProperties.push(propertyName);
            return this;
        }
        ;
        /** Same as group, semantic sugar */
        thenGroupBy(propertyName) {
            this.groupByProperties.push(propertyName);
            return this;
        }
        ;
        /**
         * Subselects all objects based on provided selection.
         */
        select(selection) {
            if (Array.isArray(selection)) {
                this.selection = selection;
            }
            else if (selection !== "*") {
                this.selection = [selection];
            }
            return this;
        }
        ;
        /**
         * distinct on specified columns in objects and make them unique and merge the other properties
         */
        distinct(properties, concatenationToken) {
            if (concatenationToken) {
                this.concatenationToken = concatenationToken;
            }
            if (Array.isArray(properties)) {
                this.distinctProperties = properties;
            }
            else if (properties) {
                this.distinctProperties = [properties];
            }
            return this;
        }
        /** Executes selection, group and where statements provided */
        execute() {
            /** always use a fresh copy. */
            const copyOfModel = JSON.parse(JSON.stringify(this.model));
            const filteredJsonArray = filterJsonArray(copyOfModel, this.filterDetails);
            const sortedJsonArray = sortJsonArray(filteredJsonArray, this.sortDetails);
            const distinctJsonArray = distinctJsonProperties(sortedJsonArray, this.distinctProperties, this.concatenationToken);
            const selectedJsonArray = selectJsonArray(distinctJsonArray, this.selection);
            const groupedJsonArray = groupJsonArray(selectedJsonArray, this.groupByProperties);
            return groupedJsonArray;
        }
        /**
         * @param sumProperties string or string array with the propertynames which you want to sum.
         * @param jsonArray *optional* can be used with your own object array, or a subselection, default uses the one that you initialized JOQ with.
         * @returns an object with { property: sum}
         */
        sum(sumProperties, jsonArray) {
            const propertiesToSum = Array.isArray(sumProperties) ? sumProperties : [sumProperties];
            return sumJsonArray(jsonArray || this.model, propertiesToSum);
        }
        ;
    }

    const sortAscendingIcon = '<svg xmlns="http://www.w3.org/2000/svg" style="position: relative; top: 3px; left: 2px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-narrow-wide"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>';
    const sortDescendingIcon = '<svg xmlns="http://www.w3.org/2000/svg" style="position: relative; top: 3px; left: 2px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-wide-narrow"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>';

    class FlightkitTable extends HTMLElement {
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

        init() {
            this.createHtml();
            baseComponent.render(this);
        }
    }

    customElements.define('flk-button', FlightkitButton);
    customElements.define('flk-table', FlightkitTable);

})();
