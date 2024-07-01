(function (require$$0, require$$2, require$$1$1, require$$1) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
    var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
    var require$$1__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$1$1);
    var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);

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
        _contents = [];
        _orderBy = [];
        properties = new Set();
        _columnOrder = [];
        _filter = '';
        _selectionProperty = ''; /** must be an unique property on the element to select on. */
        _selectedIds = new Set(); /** used to sync selections */
        uniqueEntriesByProperties = {};
        propertyLabelDictionary = {};
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

            if (this._templates['caption']) {
                tableElement.append(this._createElement('caption'));
            }

            const data = this.contents.execute();
            const tableBody = this.createBody(data);
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
            btnElement.classList.add('row');
            btnElement.id = this._buttonId;

            const btnTextElement = document.createElement('span');
            btnTextElement.innerText = this.getAttribute('text');

            this._iconId = this.base.generateId();

            const iconElement = document.createElement('span');
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

    var picocolors = {exports: {}};

    let tty = require$$0__default["default"];

    let isColorSupported =
    	!("NO_COLOR" in process.env || process.argv.includes("--no-color")) &&
    	("FORCE_COLOR" in process.env ||
    		process.argv.includes("--color") ||
    		process.platform === "win32" ||
    		(tty.isatty(1) && process.env.TERM !== "dumb") ||
    		"CI" in process.env);

    let formatter =
    	(open, close, replace = open) =>
    	input => {
    		let string = "" + input;
    		let index = string.indexOf(close, open.length);
    		return ~index
    			? open + replaceClose(string, close, replace, index) + close
    			: open + string + close
    	};

    let replaceClose = (string, close, replace, index) => {
    	let start = string.substring(0, index) + replace;
    	let end = string.substring(index + close.length);
    	let nextIndex = end.indexOf(close);
    	return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end
    };

    let createColors = (enabled = isColorSupported) => ({
    	isColorSupported: enabled,
    	reset: enabled ? s => `\x1b[0m${s}\x1b[0m` : String,
    	bold: enabled ? formatter("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m") : String,
    	dim: enabled ? formatter("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m") : String,
    	italic: enabled ? formatter("\x1b[3m", "\x1b[23m") : String,
    	underline: enabled ? formatter("\x1b[4m", "\x1b[24m") : String,
    	inverse: enabled ? formatter("\x1b[7m", "\x1b[27m") : String,
    	hidden: enabled ? formatter("\x1b[8m", "\x1b[28m") : String,
    	strikethrough: enabled ? formatter("\x1b[9m", "\x1b[29m") : String,
    	black: enabled ? formatter("\x1b[30m", "\x1b[39m") : String,
    	red: enabled ? formatter("\x1b[31m", "\x1b[39m") : String,
    	green: enabled ? formatter("\x1b[32m", "\x1b[39m") : String,
    	yellow: enabled ? formatter("\x1b[33m", "\x1b[39m") : String,
    	blue: enabled ? formatter("\x1b[34m", "\x1b[39m") : String,
    	magenta: enabled ? formatter("\x1b[35m", "\x1b[39m") : String,
    	cyan: enabled ? formatter("\x1b[36m", "\x1b[39m") : String,
    	white: enabled ? formatter("\x1b[37m", "\x1b[39m") : String,
    	gray: enabled ? formatter("\x1b[90m", "\x1b[39m") : String,
    	bgBlack: enabled ? formatter("\x1b[40m", "\x1b[49m") : String,
    	bgRed: enabled ? formatter("\x1b[41m", "\x1b[49m") : String,
    	bgGreen: enabled ? formatter("\x1b[42m", "\x1b[49m") : String,
    	bgYellow: enabled ? formatter("\x1b[43m", "\x1b[49m") : String,
    	bgBlue: enabled ? formatter("\x1b[44m", "\x1b[49m") : String,
    	bgMagenta: enabled ? formatter("\x1b[45m", "\x1b[49m") : String,
    	bgCyan: enabled ? formatter("\x1b[46m", "\x1b[49m") : String,
    	bgWhite: enabled ? formatter("\x1b[47m", "\x1b[49m") : String,
    });

    picocolors.exports = createColors();
    picocolors.exports.createColors = createColors;

    const SINGLE_QUOTE = "'".charCodeAt(0);
    const DOUBLE_QUOTE = '"'.charCodeAt(0);
    const BACKSLASH = '\\'.charCodeAt(0);
    const SLASH = '/'.charCodeAt(0);
    const NEWLINE = '\n'.charCodeAt(0);
    const SPACE = ' '.charCodeAt(0);
    const FEED = '\f'.charCodeAt(0);
    const TAB = '\t'.charCodeAt(0);
    const CR = '\r'.charCodeAt(0);
    const OPEN_SQUARE = '['.charCodeAt(0);
    const CLOSE_SQUARE = ']'.charCodeAt(0);
    const OPEN_PARENTHESES = '('.charCodeAt(0);
    const CLOSE_PARENTHESES = ')'.charCodeAt(0);
    const OPEN_CURLY = '{'.charCodeAt(0);
    const CLOSE_CURLY = '}'.charCodeAt(0);
    const SEMICOLON = ';'.charCodeAt(0);
    const ASTERISK = '*'.charCodeAt(0);
    const COLON = ':'.charCodeAt(0);
    const AT = '@'.charCodeAt(0);

    const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
    const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
    const RE_BAD_BRACKET = /.[\r\n"'(/\\]/;
    const RE_HEX_ESCAPE = /[\da-f]/i;

    var tokenize = function tokenizer(input, options = {}) {
      let css = input.css.valueOf();
      let ignore = options.ignoreErrors;

      let code, next, quote, content, escape;
      let escaped, escapePos, prev, n, currentToken;

      let length = css.length;
      let pos = 0;
      let buffer = [];
      let returned = [];

      function position() {
        return pos
      }

      function unclosed(what) {
        throw input.error('Unclosed ' + what, pos)
      }

      function endOfFile() {
        return returned.length === 0 && pos >= length
      }

      function nextToken(opts) {
        if (returned.length) return returned.pop()
        if (pos >= length) return

        let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;

        code = css.charCodeAt(pos);

        switch (code) {
          case NEWLINE:
          case SPACE:
          case TAB:
          case CR:
          case FEED: {
            next = pos;
            do {
              next += 1;
              code = css.charCodeAt(next);
            } while (
              code === SPACE ||
              code === NEWLINE ||
              code === TAB ||
              code === CR ||
              code === FEED
            )

            currentToken = ['space', css.slice(pos, next)];
            pos = next - 1;
            break
          }

          case OPEN_SQUARE:
          case CLOSE_SQUARE:
          case OPEN_CURLY:
          case CLOSE_CURLY:
          case COLON:
          case SEMICOLON:
          case CLOSE_PARENTHESES: {
            let controlChar = String.fromCharCode(code);
            currentToken = [controlChar, controlChar, pos];
            break
          }

          case OPEN_PARENTHESES: {
            prev = buffer.length ? buffer.pop()[1] : '';
            n = css.charCodeAt(pos + 1);
            if (
              prev === 'url' &&
              n !== SINGLE_QUOTE &&
              n !== DOUBLE_QUOTE &&
              n !== SPACE &&
              n !== NEWLINE &&
              n !== TAB &&
              n !== FEED &&
              n !== CR
            ) {
              next = pos;
              do {
                escaped = false;
                next = css.indexOf(')', next + 1);
                if (next === -1) {
                  if (ignore || ignoreUnclosed) {
                    next = pos;
                    break
                  } else {
                    unclosed('bracket');
                  }
                }
                escapePos = next;
                while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                  escapePos -= 1;
                  escaped = !escaped;
                }
              } while (escaped)

              currentToken = ['brackets', css.slice(pos, next + 1), pos, next];

              pos = next;
            } else {
              next = css.indexOf(')', pos + 1);
              content = css.slice(pos, next + 1);

              if (next === -1 || RE_BAD_BRACKET.test(content)) {
                currentToken = ['(', '(', pos];
              } else {
                currentToken = ['brackets', content, pos, next];
                pos = next;
              }
            }

            break
          }

          case SINGLE_QUOTE:
          case DOUBLE_QUOTE: {
            quote = code === SINGLE_QUOTE ? "'" : '"';
            next = pos;
            do {
              escaped = false;
              next = css.indexOf(quote, next + 1);
              if (next === -1) {
                if (ignore || ignoreUnclosed) {
                  next = pos + 1;
                  break
                } else {
                  unclosed('string');
                }
              }
              escapePos = next;
              while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                escapePos -= 1;
                escaped = !escaped;
              }
            } while (escaped)

            currentToken = ['string', css.slice(pos, next + 1), pos, next];
            pos = next;
            break
          }

          case AT: {
            RE_AT_END.lastIndex = pos + 1;
            RE_AT_END.test(css);
            if (RE_AT_END.lastIndex === 0) {
              next = css.length - 1;
            } else {
              next = RE_AT_END.lastIndex - 2;
            }

            currentToken = ['at-word', css.slice(pos, next + 1), pos, next];

            pos = next;
            break
          }

          case BACKSLASH: {
            next = pos;
            escape = true;
            while (css.charCodeAt(next + 1) === BACKSLASH) {
              next += 1;
              escape = !escape;
            }
            code = css.charCodeAt(next + 1);
            if (
              escape &&
              code !== SLASH &&
              code !== SPACE &&
              code !== NEWLINE &&
              code !== TAB &&
              code !== CR &&
              code !== FEED
            ) {
              next += 1;
              if (RE_HEX_ESCAPE.test(css.charAt(next))) {
                while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
                  next += 1;
                }
                if (css.charCodeAt(next + 1) === SPACE) {
                  next += 1;
                }
              }
            }

            currentToken = ['word', css.slice(pos, next + 1), pos, next];

            pos = next;
            break
          }

          default: {
            if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
              next = css.indexOf('*/', pos + 2) + 1;
              if (next === 0) {
                if (ignore || ignoreUnclosed) {
                  next = css.length;
                } else {
                  unclosed('comment');
                }
              }

              currentToken = ['comment', css.slice(pos, next + 1), pos, next];
              pos = next;
            } else {
              RE_WORD_END.lastIndex = pos + 1;
              RE_WORD_END.test(css);
              if (RE_WORD_END.lastIndex === 0) {
                next = css.length - 1;
              } else {
                next = RE_WORD_END.lastIndex - 2;
              }

              currentToken = ['word', css.slice(pos, next + 1), pos, next];
              buffer.push(currentToken);
              pos = next;
            }

            break
          }
        }

        pos++;
        return currentToken
      }

      function back(token) {
        returned.push(token);
      }

      return {
        back,
        endOfFile,
        nextToken,
        position
      }
    };

    let pico$1 = picocolors.exports;

    let tokenizer$1 = tokenize;

    let Input$5;

    function registerInput(dependant) {
      Input$5 = dependant;
    }

    const HIGHLIGHT_THEME = {
      ';': pico$1.yellow,
      ':': pico$1.yellow,
      '(': pico$1.cyan,
      ')': pico$1.cyan,
      '[': pico$1.yellow,
      ']': pico$1.yellow,
      '{': pico$1.yellow,
      '}': pico$1.yellow,
      'at-word': pico$1.cyan,
      'brackets': pico$1.cyan,
      'call': pico$1.cyan,
      'class': pico$1.yellow,
      'comment': pico$1.gray,
      'hash': pico$1.magenta,
      'string': pico$1.green
    };

    function getTokenType([type, value], processor) {
      if (type === 'word') {
        if (value[0] === '.') {
          return 'class'
        }
        if (value[0] === '#') {
          return 'hash'
        }
      }

      if (!processor.endOfFile()) {
        let next = processor.nextToken();
        processor.back(next);
        if (next[0] === 'brackets' || next[0] === '(') return 'call'
      }

      return type
    }

    function terminalHighlight$2(css) {
      let processor = tokenizer$1(new Input$5(css), { ignoreErrors: true });
      let result = '';
      while (!processor.endOfFile()) {
        let token = processor.nextToken();
        let color = HIGHLIGHT_THEME[getTokenType(token, processor)];
        if (color) {
          result += token[1]
            .split(/\r?\n/)
            .map(i => color(i))
            .join('\n');
        } else {
          result += token[1];
        }
      }
      return result
    }

    terminalHighlight$2.registerInput = registerInput;

    var terminalHighlight_1 = terminalHighlight$2;

    let pico = picocolors.exports;

    let terminalHighlight$1 = terminalHighlight_1;

    class CssSyntaxError$3 extends Error {
      constructor(message, line, column, source, file, plugin) {
        super(message);
        this.name = 'CssSyntaxError';
        this.reason = message;

        if (file) {
          this.file = file;
        }
        if (source) {
          this.source = source;
        }
        if (plugin) {
          this.plugin = plugin;
        }
        if (typeof line !== 'undefined' && typeof column !== 'undefined') {
          if (typeof line === 'number') {
            this.line = line;
            this.column = column;
          } else {
            this.line = line.line;
            this.column = line.column;
            this.endLine = column.line;
            this.endColumn = column.column;
          }
        }

        this.setMessage();

        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, CssSyntaxError$3);
        }
      }

      setMessage() {
        this.message = this.plugin ? this.plugin + ': ' : '';
        this.message += this.file ? this.file : '<css input>';
        if (typeof this.line !== 'undefined') {
          this.message += ':' + this.line + ':' + this.column;
        }
        this.message += ': ' + this.reason;
      }

      showSourceCode(color) {
        if (!this.source) return ''

        let css = this.source;
        if (color == null) color = pico.isColorSupported;
        if (terminalHighlight$1) {
          if (color) css = terminalHighlight$1(css);
        }

        let lines = css.split(/\r?\n/);
        let start = Math.max(this.line - 3, 0);
        let end = Math.min(this.line + 2, lines.length);

        let maxWidth = String(end).length;

        let mark, aside;
        if (color) {
          let { bold, gray, red } = pico.createColors(true);
          mark = text => bold(red(text));
          aside = text => gray(text);
        } else {
          mark = aside = str => str;
        }

        return lines
          .slice(start, end)
          .map((line, index) => {
            let number = start + 1 + index;
            let gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | ';
            if (number === this.line) {
              let spacing =
                aside(gutter.replace(/\d/g, ' ')) +
                line.slice(0, this.column - 1).replace(/[^\t]/g, ' ');
              return mark('>') + aside(gutter) + line + '\n ' + spacing + mark('^')
            }
            return ' ' + aside(gutter) + line
          })
          .join('\n')
      }

      toString() {
        let code = this.showSourceCode();
        if (code) {
          code = '\n\n' + code + '\n';
        }
        return this.name + ': ' + this.message + code
      }
    }

    var cssSyntaxError = CssSyntaxError$3;
    CssSyntaxError$3.default = CssSyntaxError$3;

    var symbols = {};

    symbols.isClean = Symbol('isClean');

    symbols.my = Symbol('my');

    const DEFAULT_RAW = {
      after: '\n',
      beforeClose: '\n',
      beforeComment: '\n',
      beforeDecl: '\n',
      beforeOpen: ' ',
      beforeRule: '\n',
      colon: ': ',
      commentLeft: ' ',
      commentRight: ' ',
      emptyBody: '',
      indent: '    ',
      semicolon: false
    };

    function capitalize(str) {
      return str[0].toUpperCase() + str.slice(1)
    }

    class Stringifier$2 {
      constructor(builder) {
        this.builder = builder;
      }

      atrule(node, semicolon) {
        let name = '@' + node.name;
        let params = node.params ? this.rawValue(node, 'params') : '';

        if (typeof node.raws.afterName !== 'undefined') {
          name += node.raws.afterName;
        } else if (params) {
          name += ' ';
        }

        if (node.nodes) {
          this.block(node, name + params);
        } else {
          let end = (node.raws.between || '') + (semicolon ? ';' : '');
          this.builder(name + params + end, node);
        }
      }

      beforeAfter(node, detect) {
        let value;
        if (node.type === 'decl') {
          value = this.raw(node, null, 'beforeDecl');
        } else if (node.type === 'comment') {
          value = this.raw(node, null, 'beforeComment');
        } else if (detect === 'before') {
          value = this.raw(node, null, 'beforeRule');
        } else {
          value = this.raw(node, null, 'beforeClose');
        }

        let buf = node.parent;
        let depth = 0;
        while (buf && buf.type !== 'root') {
          depth += 1;
          buf = buf.parent;
        }

        if (value.includes('\n')) {
          let indent = this.raw(node, null, 'indent');
          if (indent.length) {
            for (let step = 0; step < depth; step++) value += indent;
          }
        }

        return value
      }

      block(node, start) {
        let between = this.raw(node, 'between', 'beforeOpen');
        this.builder(start + between + '{', node, 'start');

        let after;
        if (node.nodes && node.nodes.length) {
          this.body(node);
          after = this.raw(node, 'after');
        } else {
          after = this.raw(node, 'after', 'emptyBody');
        }

        if (after) this.builder(after);
        this.builder('}', node, 'end');
      }

      body(node) {
        let last = node.nodes.length - 1;
        while (last > 0) {
          if (node.nodes[last].type !== 'comment') break
          last -= 1;
        }

        let semicolon = this.raw(node, 'semicolon');
        for (let i = 0; i < node.nodes.length; i++) {
          let child = node.nodes[i];
          let before = this.raw(child, 'before');
          if (before) this.builder(before);
          this.stringify(child, last !== i || semicolon);
        }
      }

      comment(node) {
        let left = this.raw(node, 'left', 'commentLeft');
        let right = this.raw(node, 'right', 'commentRight');
        this.builder('/*' + left + node.text + right + '*/', node);
      }

      decl(node, semicolon) {
        let between = this.raw(node, 'between', 'colon');
        let string = node.prop + between + this.rawValue(node, 'value');

        if (node.important) {
          string += node.raws.important || ' !important';
        }

        if (semicolon) string += ';';
        this.builder(string, node);
      }

      document(node) {
        this.body(node);
      }

      raw(node, own, detect) {
        let value;
        if (!detect) detect = own;

        // Already had
        if (own) {
          value = node.raws[own];
          if (typeof value !== 'undefined') return value
        }

        let parent = node.parent;

        if (detect === 'before') {
          // Hack for first rule in CSS
          if (!parent || (parent.type === 'root' && parent.first === node)) {
            return ''
          }

          // `root` nodes in `document` should use only their own raws
          if (parent && parent.type === 'document') {
            return ''
          }
        }

        // Floating child without parent
        if (!parent) return DEFAULT_RAW[detect]

        // Detect style by other nodes
        let root = node.root();
        if (!root.rawCache) root.rawCache = {};
        if (typeof root.rawCache[detect] !== 'undefined') {
          return root.rawCache[detect]
        }

        if (detect === 'before' || detect === 'after') {
          return this.beforeAfter(node, detect)
        } else {
          let method = 'raw' + capitalize(detect);
          if (this[method]) {
            value = this[method](root, node);
          } else {
            root.walk(i => {
              value = i.raws[own];
              if (typeof value !== 'undefined') return false
            });
          }
        }

        if (typeof value === 'undefined') value = DEFAULT_RAW[detect];

        root.rawCache[detect] = value;
        return value
      }

      rawBeforeClose(root) {
        let value;
        root.walk(i => {
          if (i.nodes && i.nodes.length > 0) {
            if (typeof i.raws.after !== 'undefined') {
              value = i.raws.after;
              if (value.includes('\n')) {
                value = value.replace(/[^\n]+$/, '');
              }
              return false
            }
          }
        });
        if (value) value = value.replace(/\S/g, '');
        return value
      }

      rawBeforeComment(root, node) {
        let value;
        root.walkComments(i => {
          if (typeof i.raws.before !== 'undefined') {
            value = i.raws.before;
            if (value.includes('\n')) {
              value = value.replace(/[^\n]+$/, '');
            }
            return false
          }
        });
        if (typeof value === 'undefined') {
          value = this.raw(node, null, 'beforeDecl');
        } else if (value) {
          value = value.replace(/\S/g, '');
        }
        return value
      }

      rawBeforeDecl(root, node) {
        let value;
        root.walkDecls(i => {
          if (typeof i.raws.before !== 'undefined') {
            value = i.raws.before;
            if (value.includes('\n')) {
              value = value.replace(/[^\n]+$/, '');
            }
            return false
          }
        });
        if (typeof value === 'undefined') {
          value = this.raw(node, null, 'beforeRule');
        } else if (value) {
          value = value.replace(/\S/g, '');
        }
        return value
      }

      rawBeforeOpen(root) {
        let value;
        root.walk(i => {
          if (i.type !== 'decl') {
            value = i.raws.between;
            if (typeof value !== 'undefined') return false
          }
        });
        return value
      }

      rawBeforeRule(root) {
        let value;
        root.walk(i => {
          if (i.nodes && (i.parent !== root || root.first !== i)) {
            if (typeof i.raws.before !== 'undefined') {
              value = i.raws.before;
              if (value.includes('\n')) {
                value = value.replace(/[^\n]+$/, '');
              }
              return false
            }
          }
        });
        if (value) value = value.replace(/\S/g, '');
        return value
      }

      rawColon(root) {
        let value;
        root.walkDecls(i => {
          if (typeof i.raws.between !== 'undefined') {
            value = i.raws.between.replace(/[^\s:]/g, '');
            return false
          }
        });
        return value
      }

      rawEmptyBody(root) {
        let value;
        root.walk(i => {
          if (i.nodes && i.nodes.length === 0) {
            value = i.raws.after;
            if (typeof value !== 'undefined') return false
          }
        });
        return value
      }

      rawIndent(root) {
        if (root.raws.indent) return root.raws.indent
        let value;
        root.walk(i => {
          let p = i.parent;
          if (p && p !== root && p.parent && p.parent === root) {
            if (typeof i.raws.before !== 'undefined') {
              let parts = i.raws.before.split('\n');
              value = parts[parts.length - 1];
              value = value.replace(/\S/g, '');
              return false
            }
          }
        });
        return value
      }

      rawSemicolon(root) {
        let value;
        root.walk(i => {
          if (i.nodes && i.nodes.length && i.last.type === 'decl') {
            value = i.raws.semicolon;
            if (typeof value !== 'undefined') return false
          }
        });
        return value
      }

      rawValue(node, prop) {
        let value = node[prop];
        let raw = node.raws[prop];
        if (raw && raw.value === value) {
          return raw.raw
        }

        return value
      }

      root(node) {
        this.body(node);
        if (node.raws.after) this.builder(node.raws.after);
      }

      rule(node) {
        this.block(node, this.rawValue(node, 'selector'));
        if (node.raws.ownSemicolon) {
          this.builder(node.raws.ownSemicolon, node, 'end');
        }
      }

      stringify(node, semicolon) {
        /* c8 ignore start */
        if (!this[node.type]) {
          throw new Error(
            'Unknown AST node type ' +
              node.type +
              '. ' +
              'Maybe you need to change PostCSS stringifier.'
          )
        }
        /* c8 ignore stop */
        this[node.type](node, semicolon);
      }
    }

    var stringifier = Stringifier$2;
    Stringifier$2.default = Stringifier$2;

    let Stringifier$1 = stringifier;

    function stringify$4(node, builder) {
      let str = new Stringifier$1(builder);
      str.stringify(node);
    }

    var stringify_1 = stringify$4;
    stringify$4.default = stringify$4;

    let { isClean: isClean$2, my: my$2 } = symbols;
    let CssSyntaxError$2 = cssSyntaxError;
    let Stringifier = stringifier;
    let stringify$3 = stringify_1;

    function cloneNode(obj, parent) {
      let cloned = new obj.constructor();

      for (let i in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, i)) {
          /* c8 ignore next 2 */
          continue
        }
        if (i === 'proxyCache') continue
        let value = obj[i];
        let type = typeof value;

        if (i === 'parent' && type === 'object') {
          if (parent) cloned[i] = parent;
        } else if (i === 'source') {
          cloned[i] = value;
        } else if (Array.isArray(value)) {
          cloned[i] = value.map(j => cloneNode(j, cloned));
        } else {
          if (type === 'object' && value !== null) value = cloneNode(value);
          cloned[i] = value;
        }
      }

      return cloned
    }

    class Node$4 {
      constructor(defaults = {}) {
        this.raws = {};
        this[isClean$2] = false;
        this[my$2] = true;

        for (let name in defaults) {
          if (name === 'nodes') {
            this.nodes = [];
            for (let node of defaults[name]) {
              if (typeof node.clone === 'function') {
                this.append(node.clone());
              } else {
                this.append(node);
              }
            }
          } else {
            this[name] = defaults[name];
          }
        }
      }

      addToError(error) {
        error.postcssNode = this;
        if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
          let s = this.source;
          error.stack = error.stack.replace(
            /\n\s{4}at /,
            `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
          );
        }
        return error
      }

      after(add) {
        this.parent.insertAfter(this, add);
        return this
      }

      assign(overrides = {}) {
        for (let name in overrides) {
          this[name] = overrides[name];
        }
        return this
      }

      before(add) {
        this.parent.insertBefore(this, add);
        return this
      }

      cleanRaws(keepBetween) {
        delete this.raws.before;
        delete this.raws.after;
        if (!keepBetween) delete this.raws.between;
      }

      clone(overrides = {}) {
        let cloned = cloneNode(this);
        for (let name in overrides) {
          cloned[name] = overrides[name];
        }
        return cloned
      }

      cloneAfter(overrides = {}) {
        let cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned
      }

      cloneBefore(overrides = {}) {
        let cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned
      }

      error(message, opts = {}) {
        if (this.source) {
          let { end, start } = this.rangeBy(opts);
          return this.source.input.error(
            message,
            { column: start.column, line: start.line },
            { column: end.column, line: end.line },
            opts
          )
        }
        return new CssSyntaxError$2(message)
      }

      getProxyProcessor() {
        return {
          get(node, prop) {
            if (prop === 'proxyOf') {
              return node
            } else if (prop === 'root') {
              return () => node.root().toProxy()
            } else {
              return node[prop]
            }
          },

          set(node, prop, value) {
            if (node[prop] === value) return true
            node[prop] = value;
            if (
              prop === 'prop' ||
              prop === 'value' ||
              prop === 'name' ||
              prop === 'params' ||
              prop === 'important' ||
              /* c8 ignore next */
              prop === 'text'
            ) {
              node.markDirty();
            }
            return true
          }
        }
      }

      markDirty() {
        if (this[isClean$2]) {
          this[isClean$2] = false;
          let next = this;
          while ((next = next.parent)) {
            next[isClean$2] = false;
          }
        }
      }

      next() {
        if (!this.parent) return undefined
        let index = this.parent.index(this);
        return this.parent.nodes[index + 1]
      }

      positionBy(opts, stringRepresentation) {
        let pos = this.source.start;
        if (opts.index) {
          pos = this.positionInside(opts.index, stringRepresentation);
        } else if (opts.word) {
          stringRepresentation = this.toString();
          let index = stringRepresentation.indexOf(opts.word);
          if (index !== -1) pos = this.positionInside(index, stringRepresentation);
        }
        return pos
      }

      positionInside(index, stringRepresentation) {
        let string = stringRepresentation || this.toString();
        let column = this.source.start.column;
        let line = this.source.start.line;

        for (let i = 0; i < index; i++) {
          if (string[i] === '\n') {
            column = 1;
            line += 1;
          } else {
            column += 1;
          }
        }

        return { column, line }
      }

      prev() {
        if (!this.parent) return undefined
        let index = this.parent.index(this);
        return this.parent.nodes[index - 1]
      }

      rangeBy(opts) {
        let start = {
          column: this.source.start.column,
          line: this.source.start.line
        };
        let end = this.source.end
          ? {
            column: this.source.end.column + 1,
            line: this.source.end.line
          }
          : {
            column: start.column + 1,
            line: start.line
          };

        if (opts.word) {
          let stringRepresentation = this.toString();
          let index = stringRepresentation.indexOf(opts.word);
          if (index !== -1) {
            start = this.positionInside(index, stringRepresentation);
            end = this.positionInside(index + opts.word.length, stringRepresentation);
          }
        } else {
          if (opts.start) {
            start = {
              column: opts.start.column,
              line: opts.start.line
            };
          } else if (opts.index) {
            start = this.positionInside(opts.index);
          }

          if (opts.end) {
            end = {
              column: opts.end.column,
              line: opts.end.line
            };
          } else if (opts.endIndex) {
            end = this.positionInside(opts.endIndex);
          } else if (opts.index) {
            end = this.positionInside(opts.index + 1);
          }
        }

        if (
          end.line < start.line ||
          (end.line === start.line && end.column <= start.column)
        ) {
          end = { column: start.column + 1, line: start.line };
        }

        return { end, start }
      }

      raw(prop, defaultType) {
        let str = new Stringifier();
        return str.raw(this, prop, defaultType)
      }

      remove() {
        if (this.parent) {
          this.parent.removeChild(this);
        }
        this.parent = undefined;
        return this
      }

      replaceWith(...nodes) {
        if (this.parent) {
          let bookmark = this;
          let foundSelf = false;
          for (let node of nodes) {
            if (node === this) {
              foundSelf = true;
            } else if (foundSelf) {
              this.parent.insertAfter(bookmark, node);
              bookmark = node;
            } else {
              this.parent.insertBefore(bookmark, node);
            }
          }

          if (!foundSelf) {
            this.remove();
          }
        }

        return this
      }

      root() {
        let result = this;
        while (result.parent && result.parent.type !== 'document') {
          result = result.parent;
        }
        return result
      }

      toJSON(_, inputs) {
        let fixed = {};
        let emitInputs = inputs == null;
        inputs = inputs || new Map();
        let inputsNextIndex = 0;

        for (let name in this) {
          if (!Object.prototype.hasOwnProperty.call(this, name)) {
            /* c8 ignore next 2 */
            continue
          }
          if (name === 'parent' || name === 'proxyCache') continue
          let value = this[name];

          if (Array.isArray(value)) {
            fixed[name] = value.map(i => {
              if (typeof i === 'object' && i.toJSON) {
                return i.toJSON(null, inputs)
              } else {
                return i
              }
            });
          } else if (typeof value === 'object' && value.toJSON) {
            fixed[name] = value.toJSON(null, inputs);
          } else if (name === 'source') {
            let inputId = inputs.get(value.input);
            if (inputId == null) {
              inputId = inputsNextIndex;
              inputs.set(value.input, inputsNextIndex);
              inputsNextIndex++;
            }
            fixed[name] = {
              end: value.end,
              inputId,
              start: value.start
            };
          } else {
            fixed[name] = value;
          }
        }

        if (emitInputs) {
          fixed.inputs = [...inputs.keys()].map(input => input.toJSON());
        }

        return fixed
      }

      toProxy() {
        if (!this.proxyCache) {
          this.proxyCache = new Proxy(this, this.getProxyProcessor());
        }
        return this.proxyCache
      }

      toString(stringifier = stringify$3) {
        if (stringifier.stringify) stringifier = stringifier.stringify;
        let result = '';
        stringifier(this, i => {
          result += i;
        });
        return result
      }

      warn(result, text, opts) {
        let data = { node: this };
        for (let i in opts) data[i] = opts[i];
        return result.warn(text, data)
      }

      get proxyOf() {
        return this
      }
    }

    var node_1 = Node$4;
    Node$4.default = Node$4;

    let Node$3 = node_1;

    class Declaration$4 extends Node$3 {
      constructor(defaults) {
        if (
          defaults &&
          typeof defaults.value !== 'undefined' &&
          typeof defaults.value !== 'string'
        ) {
          defaults = { ...defaults, value: String(defaults.value) };
        }
        super(defaults);
        this.type = 'decl';
      }

      get variable() {
        return this.prop.startsWith('--') || this.prop[0] === '$'
      }
    }

    var declaration = Declaration$4;
    Declaration$4.default = Declaration$4;

    var sourceMap = {};

    var sourceMapGenerator = {};

    var base64Vlq = {};

    var base64$1 = {};

    /* -*- Mode: js; js-indent-level: 2; -*- */

    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

    /**
     * Encode an integer in the range of 0 to 63 to a single base 64 digit.
     */
    base64$1.encode = function (number) {
      if (0 <= number && number < intToCharMap.length) {
        return intToCharMap[number];
      }
      throw new TypeError("Must be between 0 and 63: " + number);
    };

    /**
     * Decode a single base 64 character code digit to an integer. Returns -1 on
     * failure.
     */
    base64$1.decode = function (charCode) {
      var bigA = 65;     // 'A'
      var bigZ = 90;     // 'Z'

      var littleA = 97;  // 'a'
      var littleZ = 122; // 'z'

      var zero = 48;     // '0'
      var nine = 57;     // '9'

      var plus = 43;     // '+'
      var slash = 47;    // '/'

      var littleOffset = 26;
      var numberOffset = 52;

      // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
      if (bigA <= charCode && charCode <= bigZ) {
        return (charCode - bigA);
      }

      // 26 - 51: abcdefghijklmnopqrstuvwxyz
      if (littleA <= charCode && charCode <= littleZ) {
        return (charCode - littleA + littleOffset);
      }

      // 52 - 61: 0123456789
      if (zero <= charCode && charCode <= nine) {
        return (charCode - zero + numberOffset);
      }

      // 62: +
      if (charCode == plus) {
        return 62;
      }

      // 63: /
      if (charCode == slash) {
        return 63;
      }

      // Invalid base64 digit.
      return -1;
    };

    /* -*- Mode: js; js-indent-level: 2; -*- */

    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     *
     * Based on the Base 64 VLQ implementation in Closure Compiler:
     * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
     *
     * Copyright 2011 The Closure Compiler Authors. All rights reserved.
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are
     * met:
     *
     *  * Redistributions of source code must retain the above copyright
     *    notice, this list of conditions and the following disclaimer.
     *  * Redistributions in binary form must reproduce the above
     *    copyright notice, this list of conditions and the following
     *    disclaimer in the documentation and/or other materials provided
     *    with the distribution.
     *  * Neither the name of Google Inc. nor the names of its
     *    contributors may be used to endorse or promote products derived
     *    from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    var base64 = base64$1;

    // A single base 64 digit can contain 6 bits of data. For the base 64 variable
    // length quantities we use in the source map spec, the first bit is the sign,
    // the next four bits are the actual value, and the 6th bit is the
    // continuation bit. The continuation bit tells us whether there are more
    // digits in this value following this digit.
    //
    //   Continuation
    //   |    Sign
    //   |    |
    //   V    V
    //   101011

    var VLQ_BASE_SHIFT = 5;

    // binary: 100000
    var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

    // binary: 011111
    var VLQ_BASE_MASK = VLQ_BASE - 1;

    // binary: 100000
    var VLQ_CONTINUATION_BIT = VLQ_BASE;

    /**
     * Converts from a two-complement value to a value where the sign bit is
     * placed in the least significant bit.  For example, as decimals:
     *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
     *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
     */
    function toVLQSigned(aValue) {
      return aValue < 0
        ? ((-aValue) << 1) + 1
        : (aValue << 1) + 0;
    }

    /**
     * Converts to a two-complement value from a value where the sign bit is
     * placed in the least significant bit.  For example, as decimals:
     *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
     *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
     */
    function fromVLQSigned(aValue) {
      var isNegative = (aValue & 1) === 1;
      var shifted = aValue >> 1;
      return isNegative
        ? -shifted
        : shifted;
    }

    /**
     * Returns the base 64 VLQ encoded value.
     */
    base64Vlq.encode = function base64VLQ_encode(aValue) {
      var encoded = "";
      var digit;

      var vlq = toVLQSigned(aValue);

      do {
        digit = vlq & VLQ_BASE_MASK;
        vlq >>>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
          // There are still more digits in this value, so we must make sure the
          // continuation bit is marked.
          digit |= VLQ_CONTINUATION_BIT;
        }
        encoded += base64.encode(digit);
      } while (vlq > 0);

      return encoded;
    };

    /**
     * Decodes the next base 64 VLQ value from the given string and returns the
     * value and the rest of the string via the out parameter.
     */
    base64Vlq.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
      var strLen = aStr.length;
      var result = 0;
      var shift = 0;
      var continuation, digit;

      do {
        if (aIndex >= strLen) {
          throw new Error("Expected more digits in base 64 VLQ value.");
        }

        digit = base64.decode(aStr.charCodeAt(aIndex++));
        if (digit === -1) {
          throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
        }

        continuation = !!(digit & VLQ_CONTINUATION_BIT);
        digit &= VLQ_BASE_MASK;
        result = result + (digit << shift);
        shift += VLQ_BASE_SHIFT;
      } while (continuation);

      aOutParam.value = fromVLQSigned(result);
      aOutParam.rest = aIndex;
    };

    var util$5 = {};

    /* -*- Mode: js; js-indent-level: 2; -*- */

    (function (exports) {
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    /**
     * This is a helper function for getting values from parameter/options
     * objects.
     *
     * @param args The object we are extracting values from
     * @param name The name of the property we are getting.
     * @param defaultValue An optional value to return if the property is missing
     * from the object. If this is not specified and the property is missing, an
     * error will be thrown.
     */
    function getArg(aArgs, aName, aDefaultValue) {
      if (aName in aArgs) {
        return aArgs[aName];
      } else if (arguments.length === 3) {
        return aDefaultValue;
      } else {
        throw new Error('"' + aName + '" is a required argument.');
      }
    }
    exports.getArg = getArg;

    var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
    var dataUrlRegexp = /^data:.+\,.+$/;

    function urlParse(aUrl) {
      var match = aUrl.match(urlRegexp);
      if (!match) {
        return null;
      }
      return {
        scheme: match[1],
        auth: match[2],
        host: match[3],
        port: match[4],
        path: match[5]
      };
    }
    exports.urlParse = urlParse;

    function urlGenerate(aParsedUrl) {
      var url = '';
      if (aParsedUrl.scheme) {
        url += aParsedUrl.scheme + ':';
      }
      url += '//';
      if (aParsedUrl.auth) {
        url += aParsedUrl.auth + '@';
      }
      if (aParsedUrl.host) {
        url += aParsedUrl.host;
      }
      if (aParsedUrl.port) {
        url += ":" + aParsedUrl.port;
      }
      if (aParsedUrl.path) {
        url += aParsedUrl.path;
      }
      return url;
    }
    exports.urlGenerate = urlGenerate;

    var MAX_CACHED_INPUTS = 32;

    /**
     * Takes some function `f(input) -> result` and returns a memoized version of
     * `f`.
     *
     * We keep at most `MAX_CACHED_INPUTS` memoized results of `f` alive. The
     * memoization is a dumb-simple, linear least-recently-used cache.
     */
    function lruMemoize(f) {
      var cache = [];

      return function(input) {
        for (var i = 0; i < cache.length; i++) {
          if (cache[i].input === input) {
            var temp = cache[0];
            cache[0] = cache[i];
            cache[i] = temp;
            return cache[0].result;
          }
        }

        var result = f(input);

        cache.unshift({
          input,
          result,
        });

        if (cache.length > MAX_CACHED_INPUTS) {
          cache.pop();
        }

        return result;
      };
    }

    /**
     * Normalizes a path, or the path portion of a URL:
     *
     * - Replaces consecutive slashes with one slash.
     * - Removes unnecessary '.' parts.
     * - Removes unnecessary '<dir>/..' parts.
     *
     * Based on code in the Node.js 'path' core module.
     *
     * @param aPath The path or url to normalize.
     */
    var normalize = lruMemoize(function normalize(aPath) {
      var path = aPath;
      var url = urlParse(aPath);
      if (url) {
        if (!url.path) {
          return aPath;
        }
        path = url.path;
      }
      var isAbsolute = exports.isAbsolute(path);
      // Split the path into parts between `/` characters. This is much faster than
      // using `.split(/\/+/g)`.
      var parts = [];
      var start = 0;
      var i = 0;
      while (true) {
        start = i;
        i = path.indexOf("/", start);
        if (i === -1) {
          parts.push(path.slice(start));
          break;
        } else {
          parts.push(path.slice(start, i));
          while (i < path.length && path[i] === "/") {
            i++;
          }
        }
      }

      for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
        part = parts[i];
        if (part === '.') {
          parts.splice(i, 1);
        } else if (part === '..') {
          up++;
        } else if (up > 0) {
          if (part === '') {
            // The first part is blank if the path is absolute. Trying to go
            // above the root is a no-op. Therefore we can remove all '..' parts
            // directly after the root.
            parts.splice(i + 1, up);
            up = 0;
          } else {
            parts.splice(i, 2);
            up--;
          }
        }
      }
      path = parts.join('/');

      if (path === '') {
        path = isAbsolute ? '/' : '.';
      }

      if (url) {
        url.path = path;
        return urlGenerate(url);
      }
      return path;
    });
    exports.normalize = normalize;

    /**
     * Joins two paths/URLs.
     *
     * @param aRoot The root path or URL.
     * @param aPath The path or URL to be joined with the root.
     *
     * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
     *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
     *   first.
     * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
     *   is updated with the result and aRoot is returned. Otherwise the result
     *   is returned.
     *   - If aPath is absolute, the result is aPath.
     *   - Otherwise the two paths are joined with a slash.
     * - Joining for example 'http://' and 'www.example.com' is also supported.
     */
    function join(aRoot, aPath) {
      if (aRoot === "") {
        aRoot = ".";
      }
      if (aPath === "") {
        aPath = ".";
      }
      var aPathUrl = urlParse(aPath);
      var aRootUrl = urlParse(aRoot);
      if (aRootUrl) {
        aRoot = aRootUrl.path || '/';
      }

      // `join(foo, '//www.example.org')`
      if (aPathUrl && !aPathUrl.scheme) {
        if (aRootUrl) {
          aPathUrl.scheme = aRootUrl.scheme;
        }
        return urlGenerate(aPathUrl);
      }

      if (aPathUrl || aPath.match(dataUrlRegexp)) {
        return aPath;
      }

      // `join('http://', 'www.example.com')`
      if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
        aRootUrl.host = aPath;
        return urlGenerate(aRootUrl);
      }

      var joined = aPath.charAt(0) === '/'
        ? aPath
        : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

      if (aRootUrl) {
        aRootUrl.path = joined;
        return urlGenerate(aRootUrl);
      }
      return joined;
    }
    exports.join = join;

    exports.isAbsolute = function (aPath) {
      return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
    };

    /**
     * Make a path relative to a URL or another path.
     *
     * @param aRoot The root path or URL.
     * @param aPath The path or URL to be made relative to aRoot.
     */
    function relative(aRoot, aPath) {
      if (aRoot === "") {
        aRoot = ".";
      }

      aRoot = aRoot.replace(/\/$/, '');

      // It is possible for the path to be above the root. In this case, simply
      // checking whether the root is a prefix of the path won't work. Instead, we
      // need to remove components from the root one by one, until either we find
      // a prefix that fits, or we run out of components to remove.
      var level = 0;
      while (aPath.indexOf(aRoot + '/') !== 0) {
        var index = aRoot.lastIndexOf("/");
        if (index < 0) {
          return aPath;
        }

        // If the only part of the root that is left is the scheme (i.e. http://,
        // file:///, etc.), one or more slashes (/), or simply nothing at all, we
        // have exhausted all components, so the path is not relative to the root.
        aRoot = aRoot.slice(0, index);
        if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
          return aPath;
        }

        ++level;
      }

      // Make sure we add a "../" for each component we removed from the root.
      return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
    }
    exports.relative = relative;

    var supportsNullProto = (function () {
      var obj = Object.create(null);
      return !('__proto__' in obj);
    }());

    function identity (s) {
      return s;
    }

    /**
     * Because behavior goes wacky when you set `__proto__` on objects, we
     * have to prefix all the strings in our set with an arbitrary character.
     *
     * See https://github.com/mozilla/source-map/pull/31 and
     * https://github.com/mozilla/source-map/issues/30
     *
     * @param String aStr
     */
    function toSetString(aStr) {
      if (isProtoString(aStr)) {
        return '$' + aStr;
      }

      return aStr;
    }
    exports.toSetString = supportsNullProto ? identity : toSetString;

    function fromSetString(aStr) {
      if (isProtoString(aStr)) {
        return aStr.slice(1);
      }

      return aStr;
    }
    exports.fromSetString = supportsNullProto ? identity : fromSetString;

    function isProtoString(s) {
      if (!s) {
        return false;
      }

      var length = s.length;

      if (length < 9 /* "__proto__".length */) {
        return false;
      }

      if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
          s.charCodeAt(length - 2) !== 95  /* '_' */ ||
          s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
          s.charCodeAt(length - 4) !== 116 /* 't' */ ||
          s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
          s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
          s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
          s.charCodeAt(length - 8) !== 95  /* '_' */ ||
          s.charCodeAt(length - 9) !== 95  /* '_' */) {
        return false;
      }

      for (var i = length - 10; i >= 0; i--) {
        if (s.charCodeAt(i) !== 36 /* '$' */) {
          return false;
        }
      }

      return true;
    }

    /**
     * Comparator between two mappings where the original positions are compared.
     *
     * Optionally pass in `true` as `onlyCompareGenerated` to consider two
     * mappings with the same original source/line/column, but different generated
     * line and column the same. Useful when searching for a mapping with a
     * stubbed out mapping.
     */
    function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
      var cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0 || onlyCompareOriginal) {
        return cmp;
      }

      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }

      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByOriginalPositions = compareByOriginalPositions;

    function compareByOriginalPositionsNoSource(mappingA, mappingB, onlyCompareOriginal) {
      var cmp;

      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0 || onlyCompareOriginal) {
        return cmp;
      }

      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }

      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByOriginalPositionsNoSource = compareByOriginalPositionsNoSource;

    /**
     * Comparator between two mappings with deflated source and name indices where
     * the generated positions are compared.
     *
     * Optionally pass in `true` as `onlyCompareGenerated` to consider two
     * mappings with the same generated line and column, but different
     * source/name/original line and column the same. Useful when searching for a
     * mapping with a stubbed out mapping.
     */
    function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
      var cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0 || onlyCompareGenerated) {
        return cmp;
      }

      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0) {
        return cmp;
      }

      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

    function compareByGeneratedPositionsDeflatedNoLine(mappingA, mappingB, onlyCompareGenerated) {
      var cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0 || onlyCompareGenerated) {
        return cmp;
      }

      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0) {
        return cmp;
      }

      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByGeneratedPositionsDeflatedNoLine = compareByGeneratedPositionsDeflatedNoLine;

    function strcmp(aStr1, aStr2) {
      if (aStr1 === aStr2) {
        return 0;
      }

      if (aStr1 === null) {
        return 1; // aStr2 !== null
      }

      if (aStr2 === null) {
        return -1; // aStr1 !== null
      }

      if (aStr1 > aStr2) {
        return 1;
      }

      return -1;
    }

    /**
     * Comparator between two mappings with inflated source and name strings where
     * the generated positions are compared.
     */
    function compareByGeneratedPositionsInflated(mappingA, mappingB) {
      var cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0) {
        return cmp;
      }

      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

    /**
     * Strip any JSON XSSI avoidance prefix from the string (as documented
     * in the source maps specification), and then parse the string as
     * JSON.
     */
    function parseSourceMapInput(str) {
      return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
    }
    exports.parseSourceMapInput = parseSourceMapInput;

    /**
     * Compute the URL of a source given the the source root, the source's
     * URL, and the source map's URL.
     */
    function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
      sourceURL = sourceURL || '';

      if (sourceRoot) {
        // This follows what Chrome does.
        if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
          sourceRoot += '/';
        }
        // The spec says:
        //   Line 4: An optional source root, useful for relocating source
        //   files on a server or removing repeated values in the
        //   “sources” entry.  This value is prepended to the individual
        //   entries in the “source” field.
        sourceURL = sourceRoot + sourceURL;
      }

      // Historically, SourceMapConsumer did not take the sourceMapURL as
      // a parameter.  This mode is still somewhat supported, which is why
      // this code block is conditional.  However, it's preferable to pass
      // the source map URL to SourceMapConsumer, so that this function
      // can implement the source URL resolution algorithm as outlined in
      // the spec.  This block is basically the equivalent of:
      //    new URL(sourceURL, sourceMapURL).toString()
      // ... except it avoids using URL, which wasn't available in the
      // older releases of node still supported by this library.
      //
      // The spec says:
      //   If the sources are not absolute URLs after prepending of the
      //   “sourceRoot”, the sources are resolved relative to the
      //   SourceMap (like resolving script src in a html document).
      if (sourceMapURL) {
        var parsed = urlParse(sourceMapURL);
        if (!parsed) {
          throw new Error("sourceMapURL could not be parsed");
        }
        if (parsed.path) {
          // Strip the last path component, but keep the "/".
          var index = parsed.path.lastIndexOf('/');
          if (index >= 0) {
            parsed.path = parsed.path.substring(0, index + 1);
          }
        }
        sourceURL = join(urlGenerate(parsed), sourceURL);
      }

      return normalize(sourceURL);
    }
    exports.computeSourceURL = computeSourceURL;
    }(util$5));

    var arraySet = {};

    /* -*- Mode: js; js-indent-level: 2; -*- */

    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    var util$4 = util$5;
    var has = Object.prototype.hasOwnProperty;
    var hasNativeMap = typeof Map !== "undefined";

    /**
     * A data structure which is a combination of an array and a set. Adding a new
     * member is O(1), testing for membership is O(1), and finding the index of an
     * element is O(1). Removing elements from the set is not supported. Only
     * strings are supported for membership.
     */
    function ArraySet$2() {
      this._array = [];
      this._set = hasNativeMap ? new Map() : Object.create(null);
    }

    /**
     * Static method for creating ArraySet instances from an existing array.
     */
    ArraySet$2.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
      var set = new ArraySet$2();
      for (var i = 0, len = aArray.length; i < len; i++) {
        set.add(aArray[i], aAllowDuplicates);
      }
      return set;
    };

    /**
     * Return how many unique items are in this ArraySet. If duplicates have been
     * added, than those do not count towards the size.
     *
     * @returns Number
     */
    ArraySet$2.prototype.size = function ArraySet_size() {
      return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
    };

    /**
     * Add the given string to this set.
     *
     * @param String aStr
     */
    ArraySet$2.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
      var sStr = hasNativeMap ? aStr : util$4.toSetString(aStr);
      var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
      var idx = this._array.length;
      if (!isDuplicate || aAllowDuplicates) {
        this._array.push(aStr);
      }
      if (!isDuplicate) {
        if (hasNativeMap) {
          this._set.set(aStr, idx);
        } else {
          this._set[sStr] = idx;
        }
      }
    };

    /**
     * Is the given string a member of this set?
     *
     * @param String aStr
     */
    ArraySet$2.prototype.has = function ArraySet_has(aStr) {
      if (hasNativeMap) {
        return this._set.has(aStr);
      } else {
        var sStr = util$4.toSetString(aStr);
        return has.call(this._set, sStr);
      }
    };

    /**
     * What is the index of the given string in the array?
     *
     * @param String aStr
     */
    ArraySet$2.prototype.indexOf = function ArraySet_indexOf(aStr) {
      if (hasNativeMap) {
        var idx = this._set.get(aStr);
        if (idx >= 0) {
            return idx;
        }
      } else {
        var sStr = util$4.toSetString(aStr);
        if (has.call(this._set, sStr)) {
          return this._set[sStr];
        }
      }

      throw new Error('"' + aStr + '" is not in the set.');
    };

    /**
     * What is the element at the given index?
     *
     * @param Number aIdx
     */
    ArraySet$2.prototype.at = function ArraySet_at(aIdx) {
      if (aIdx >= 0 && aIdx < this._array.length) {
        return this._array[aIdx];
      }
      throw new Error('No element indexed by ' + aIdx);
    };

    /**
     * Returns the array representation of this set (which has the proper indices
     * indicated by indexOf). Note that this is a copy of the internal array used
     * for storing the members so that no one can mess with internal state.
     */
    ArraySet$2.prototype.toArray = function ArraySet_toArray() {
      return this._array.slice();
    };

    arraySet.ArraySet = ArraySet$2;

    var mappingList = {};

    /* -*- Mode: js; js-indent-level: 2; -*- */

    /*
     * Copyright 2014 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    var util$3 = util$5;

    /**
     * Determine whether mappingB is after mappingA with respect to generated
     * position.
     */
    function generatedPositionAfter(mappingA, mappingB) {
      // Optimized for most common case
      var lineA = mappingA.generatedLine;
      var lineB = mappingB.generatedLine;
      var columnA = mappingA.generatedColumn;
      var columnB = mappingB.generatedColumn;
      return lineB > lineA || lineB == lineA && columnB >= columnA ||
             util$3.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
    }

    /**
     * A data structure to provide a sorted view of accumulated mappings in a
     * performance conscious manner. It trades a neglibable overhead in general
     * case for a large speedup in case of mappings being added in order.
     */
    function MappingList$1() {
      this._array = [];
      this._sorted = true;
      // Serves as infimum
      this._last = {generatedLine: -1, generatedColumn: 0};
    }

    /**
     * Iterate through internal items. This method takes the same arguments that
     * `Array.prototype.forEach` takes.
     *
     * NOTE: The order of the mappings is NOT guaranteed.
     */
    MappingList$1.prototype.unsortedForEach =
      function MappingList_forEach(aCallback, aThisArg) {
        this._array.forEach(aCallback, aThisArg);
      };

    /**
     * Add the given source mapping.
     *
     * @param Object aMapping
     */
    MappingList$1.prototype.add = function MappingList_add(aMapping) {
      if (generatedPositionAfter(this._last, aMapping)) {
        this._last = aMapping;
        this._array.push(aMapping);
      } else {
        this._sorted = false;
        this._array.push(aMapping);
      }
    };

    /**
     * Returns the flat, sorted array of mappings. The mappings are sorted by
     * generated position.
     *
     * WARNING: This method returns internal data without copying, for
     * performance. The return value must NOT be mutated, and should be treated as
     * an immutable borrow. If you want to take ownership, you must make your own
     * copy.
     */
    MappingList$1.prototype.toArray = function MappingList_toArray() {
      if (!this._sorted) {
        this._array.sort(util$3.compareByGeneratedPositionsInflated);
        this._sorted = true;
      }
      return this._array;
    };

    mappingList.MappingList = MappingList$1;

    /* -*- Mode: js; js-indent-level: 2; -*- */

    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    var base64VLQ$1 = base64Vlq;
    var util$2 = util$5;
    var ArraySet$1 = arraySet.ArraySet;
    var MappingList = mappingList.MappingList;

    /**
     * An instance of the SourceMapGenerator represents a source map which is
     * being built incrementally. You may pass an object with the following
     * properties:
     *
     *   - file: The filename of the generated source.
     *   - sourceRoot: A root for all relative URLs in this source map.
     */
    function SourceMapGenerator$4(aArgs) {
      if (!aArgs) {
        aArgs = {};
      }
      this._file = util$2.getArg(aArgs, 'file', null);
      this._sourceRoot = util$2.getArg(aArgs, 'sourceRoot', null);
      this._skipValidation = util$2.getArg(aArgs, 'skipValidation', false);
      this._sources = new ArraySet$1();
      this._names = new ArraySet$1();
      this._mappings = new MappingList();
      this._sourcesContents = null;
    }

    SourceMapGenerator$4.prototype._version = 3;

    /**
     * Creates a new SourceMapGenerator based on a SourceMapConsumer
     *
     * @param aSourceMapConsumer The SourceMap.
     */
    SourceMapGenerator$4.fromSourceMap =
      function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
        var sourceRoot = aSourceMapConsumer.sourceRoot;
        var generator = new SourceMapGenerator$4({
          file: aSourceMapConsumer.file,
          sourceRoot: sourceRoot
        });
        aSourceMapConsumer.eachMapping(function (mapping) {
          var newMapping = {
            generated: {
              line: mapping.generatedLine,
              column: mapping.generatedColumn
            }
          };

          if (mapping.source != null) {
            newMapping.source = mapping.source;
            if (sourceRoot != null) {
              newMapping.source = util$2.relative(sourceRoot, newMapping.source);
            }

            newMapping.original = {
              line: mapping.originalLine,
              column: mapping.originalColumn
            };

            if (mapping.name != null) {
              newMapping.name = mapping.name;
            }
          }

          generator.addMapping(newMapping);
        });
        aSourceMapConsumer.sources.forEach(function (sourceFile) {
          var sourceRelative = sourceFile;
          if (sourceRoot !== null) {
            sourceRelative = util$2.relative(sourceRoot, sourceFile);
          }

          if (!generator._sources.has(sourceRelative)) {
            generator._sources.add(sourceRelative);
          }

          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            generator.setSourceContent(sourceFile, content);
          }
        });
        return generator;
      };

    /**
     * Add a single mapping from original source line and column to the generated
     * source's line and column for this source map being created. The mapping
     * object should have the following properties:
     *
     *   - generated: An object with the generated line and column positions.
     *   - original: An object with the original line and column positions.
     *   - source: The original source file (relative to the sourceRoot).
     *   - name: An optional original token name for this mapping.
     */
    SourceMapGenerator$4.prototype.addMapping =
      function SourceMapGenerator_addMapping(aArgs) {
        var generated = util$2.getArg(aArgs, 'generated');
        var original = util$2.getArg(aArgs, 'original', null);
        var source = util$2.getArg(aArgs, 'source', null);
        var name = util$2.getArg(aArgs, 'name', null);

        if (!this._skipValidation) {
          this._validateMapping(generated, original, source, name);
        }

        if (source != null) {
          source = String(source);
          if (!this._sources.has(source)) {
            this._sources.add(source);
          }
        }

        if (name != null) {
          name = String(name);
          if (!this._names.has(name)) {
            this._names.add(name);
          }
        }

        this._mappings.add({
          generatedLine: generated.line,
          generatedColumn: generated.column,
          originalLine: original != null && original.line,
          originalColumn: original != null && original.column,
          source: source,
          name: name
        });
      };

    /**
     * Set the source content for a source file.
     */
    SourceMapGenerator$4.prototype.setSourceContent =
      function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
        var source = aSourceFile;
        if (this._sourceRoot != null) {
          source = util$2.relative(this._sourceRoot, source);
        }

        if (aSourceContent != null) {
          // Add the source content to the _sourcesContents map.
          // Create a new _sourcesContents map if the property is null.
          if (!this._sourcesContents) {
            this._sourcesContents = Object.create(null);
          }
          this._sourcesContents[util$2.toSetString(source)] = aSourceContent;
        } else if (this._sourcesContents) {
          // Remove the source file from the _sourcesContents map.
          // If the _sourcesContents map is empty, set the property to null.
          delete this._sourcesContents[util$2.toSetString(source)];
          if (Object.keys(this._sourcesContents).length === 0) {
            this._sourcesContents = null;
          }
        }
      };

    /**
     * Applies the mappings of a sub-source-map for a specific source file to the
     * source map being generated. Each mapping to the supplied source file is
     * rewritten using the supplied source map. Note: The resolution for the
     * resulting mappings is the minimium of this map and the supplied map.
     *
     * @param aSourceMapConsumer The source map to be applied.
     * @param aSourceFile Optional. The filename of the source file.
     *        If omitted, SourceMapConsumer's file property will be used.
     * @param aSourceMapPath Optional. The dirname of the path to the source map
     *        to be applied. If relative, it is relative to the SourceMapConsumer.
     *        This parameter is needed when the two source maps aren't in the same
     *        directory, and the source map to be applied contains relative source
     *        paths. If so, those relative source paths need to be rewritten
     *        relative to the SourceMapGenerator.
     */
    SourceMapGenerator$4.prototype.applySourceMap =
      function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
        var sourceFile = aSourceFile;
        // If aSourceFile is omitted, we will use the file property of the SourceMap
        if (aSourceFile == null) {
          if (aSourceMapConsumer.file == null) {
            throw new Error(
              'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
              'or the source map\'s "file" property. Both were omitted.'
            );
          }
          sourceFile = aSourceMapConsumer.file;
        }
        var sourceRoot = this._sourceRoot;
        // Make "sourceFile" relative if an absolute Url is passed.
        if (sourceRoot != null) {
          sourceFile = util$2.relative(sourceRoot, sourceFile);
        }
        // Applying the SourceMap can add and remove items from the sources and
        // the names array.
        var newSources = new ArraySet$1();
        var newNames = new ArraySet$1();

        // Find mappings for the "sourceFile"
        this._mappings.unsortedForEach(function (mapping) {
          if (mapping.source === sourceFile && mapping.originalLine != null) {
            // Check if it can be mapped by the source map, then update the mapping.
            var original = aSourceMapConsumer.originalPositionFor({
              line: mapping.originalLine,
              column: mapping.originalColumn
            });
            if (original.source != null) {
              // Copy mapping
              mapping.source = original.source;
              if (aSourceMapPath != null) {
                mapping.source = util$2.join(aSourceMapPath, mapping.source);
              }
              if (sourceRoot != null) {
                mapping.source = util$2.relative(sourceRoot, mapping.source);
              }
              mapping.originalLine = original.line;
              mapping.originalColumn = original.column;
              if (original.name != null) {
                mapping.name = original.name;
              }
            }
          }

          var source = mapping.source;
          if (source != null && !newSources.has(source)) {
            newSources.add(source);
          }

          var name = mapping.name;
          if (name != null && !newNames.has(name)) {
            newNames.add(name);
          }

        }, this);
        this._sources = newSources;
        this._names = newNames;

        // Copy sourcesContents of applied map.
        aSourceMapConsumer.sources.forEach(function (sourceFile) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            if (aSourceMapPath != null) {
              sourceFile = util$2.join(aSourceMapPath, sourceFile);
            }
            if (sourceRoot != null) {
              sourceFile = util$2.relative(sourceRoot, sourceFile);
            }
            this.setSourceContent(sourceFile, content);
          }
        }, this);
      };

    /**
     * A mapping can have one of the three levels of data:
     *
     *   1. Just the generated position.
     *   2. The Generated position, original position, and original source.
     *   3. Generated and original position, original source, as well as a name
     *      token.
     *
     * To maintain consistency, we validate that any new mapping being added falls
     * in to one of these categories.
     */
    SourceMapGenerator$4.prototype._validateMapping =
      function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                  aName) {
        // When aOriginal is truthy but has empty values for .line and .column,
        // it is most likely a programmer error. In this case we throw a very
        // specific error message to try to guide them the right way.
        // For example: https://github.com/Polymer/polymer-bundler/pull/519
        if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
            throw new Error(
                'original.line and original.column are not numbers -- you probably meant to omit ' +
                'the original mapping entirely and only map the generated position. If so, pass ' +
                'null for the original mapping instead of an object with empty or null values.'
            );
        }

        if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
            && aGenerated.line > 0 && aGenerated.column >= 0
            && !aOriginal && !aSource && !aName) {
          // Case 1.
          return;
        }
        else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
                 && aOriginal && 'line' in aOriginal && 'column' in aOriginal
                 && aGenerated.line > 0 && aGenerated.column >= 0
                 && aOriginal.line > 0 && aOriginal.column >= 0
                 && aSource) {
          // Cases 2 and 3.
          return;
        }
        else {
          throw new Error('Invalid mapping: ' + JSON.stringify({
            generated: aGenerated,
            source: aSource,
            original: aOriginal,
            name: aName
          }));
        }
      };

    /**
     * Serialize the accumulated mappings in to the stream of base 64 VLQs
     * specified by the source map format.
     */
    SourceMapGenerator$4.prototype._serializeMappings =
      function SourceMapGenerator_serializeMappings() {
        var previousGeneratedColumn = 0;
        var previousGeneratedLine = 1;
        var previousOriginalColumn = 0;
        var previousOriginalLine = 0;
        var previousName = 0;
        var previousSource = 0;
        var result = '';
        var next;
        var mapping;
        var nameIdx;
        var sourceIdx;

        var mappings = this._mappings.toArray();
        for (var i = 0, len = mappings.length; i < len; i++) {
          mapping = mappings[i];
          next = '';

          if (mapping.generatedLine !== previousGeneratedLine) {
            previousGeneratedColumn = 0;
            while (mapping.generatedLine !== previousGeneratedLine) {
              next += ';';
              previousGeneratedLine++;
            }
          }
          else {
            if (i > 0) {
              if (!util$2.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
                continue;
              }
              next += ',';
            }
          }

          next += base64VLQ$1.encode(mapping.generatedColumn
                                     - previousGeneratedColumn);
          previousGeneratedColumn = mapping.generatedColumn;

          if (mapping.source != null) {
            sourceIdx = this._sources.indexOf(mapping.source);
            next += base64VLQ$1.encode(sourceIdx - previousSource);
            previousSource = sourceIdx;

            // lines are stored 0-based in SourceMap spec version 3
            next += base64VLQ$1.encode(mapping.originalLine - 1
                                       - previousOriginalLine);
            previousOriginalLine = mapping.originalLine - 1;

            next += base64VLQ$1.encode(mapping.originalColumn
                                       - previousOriginalColumn);
            previousOriginalColumn = mapping.originalColumn;

            if (mapping.name != null) {
              nameIdx = this._names.indexOf(mapping.name);
              next += base64VLQ$1.encode(nameIdx - previousName);
              previousName = nameIdx;
            }
          }

          result += next;
        }

        return result;
      };

    SourceMapGenerator$4.prototype._generateSourcesContent =
      function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
        return aSources.map(function (source) {
          if (!this._sourcesContents) {
            return null;
          }
          if (aSourceRoot != null) {
            source = util$2.relative(aSourceRoot, source);
          }
          var key = util$2.toSetString(source);
          return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
            ? this._sourcesContents[key]
            : null;
        }, this);
      };

    /**
     * Externalize the source map.
     */
    SourceMapGenerator$4.prototype.toJSON =
      function SourceMapGenerator_toJSON() {
        var map = {
          version: this._version,
          sources: this._sources.toArray(),
          names: this._names.toArray(),
          mappings: this._serializeMappings()
        };
        if (this._file != null) {
          map.file = this._file;
        }
        if (this._sourceRoot != null) {
          map.sourceRoot = this._sourceRoot;
        }
        if (this._sourcesContents) {
          map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
        }

        return map;
      };

    /**
     * Render the source map being generated to a string.
     */
    SourceMapGenerator$4.prototype.toString =
      function SourceMapGenerator_toString() {
        return JSON.stringify(this.toJSON());
      };

    sourceMapGenerator.SourceMapGenerator = SourceMapGenerator$4;

    var sourceMapConsumer = {};

    var binarySearch$1 = {};

    /* -*- Mode: js; js-indent-level: 2; -*- */

    (function (exports) {
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    exports.GREATEST_LOWER_BOUND = 1;
    exports.LEAST_UPPER_BOUND = 2;

    /**
     * Recursive implementation of binary search.
     *
     * @param aLow Indices here and lower do not contain the needle.
     * @param aHigh Indices here and higher do not contain the needle.
     * @param aNeedle The element being searched for.
     * @param aHaystack The non-empty array being searched.
     * @param aCompare Function which takes two elements and returns -1, 0, or 1.
     * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
     *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
     *     closest element that is smaller than or greater than the one we are
     *     searching for, respectively, if the exact element cannot be found.
     */
    function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
      // This function terminates when one of the following is true:
      //
      //   1. We find the exact element we are looking for.
      //
      //   2. We did not find the exact element, but we can return the index of
      //      the next-closest element.
      //
      //   3. We did not find the exact element, and there is no next-closest
      //      element than the one we are searching for, so we return -1.
      var mid = Math.floor((aHigh - aLow) / 2) + aLow;
      var cmp = aCompare(aNeedle, aHaystack[mid], true);
      if (cmp === 0) {
        // Found the element we are looking for.
        return mid;
      }
      else if (cmp > 0) {
        // Our needle is greater than aHaystack[mid].
        if (aHigh - mid > 1) {
          // The element is in the upper half.
          return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
        }

        // The exact needle element was not found in this haystack. Determine if
        // we are in termination case (3) or (2) and return the appropriate thing.
        if (aBias == exports.LEAST_UPPER_BOUND) {
          return aHigh < aHaystack.length ? aHigh : -1;
        } else {
          return mid;
        }
      }
      else {
        // Our needle is less than aHaystack[mid].
        if (mid - aLow > 1) {
          // The element is in the lower half.
          return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
        }

        // we are in termination case (3) or (2) and return the appropriate thing.
        if (aBias == exports.LEAST_UPPER_BOUND) {
          return mid;
        } else {
          return aLow < 0 ? -1 : aLow;
        }
      }
    }

    /**
     * This is an implementation of binary search which will always try and return
     * the index of the closest element if there is no exact hit. This is because
     * mappings between original and generated line/col pairs are single points,
     * and there is an implicit region between each of them, so a miss just means
     * that you aren't on the very start of a region.
     *
     * @param aNeedle The element you are looking for.
     * @param aHaystack The array that is being searched.
     * @param aCompare A function which takes the needle and an element in the
     *     array and returns -1, 0, or 1 depending on whether the needle is less
     *     than, equal to, or greater than the element, respectively.
     * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
     *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
     *     closest element that is smaller than or greater than the one we are
     *     searching for, respectively, if the exact element cannot be found.
     *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
     */
    exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
      if (aHaystack.length === 0) {
        return -1;
      }

      var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                                  aCompare, aBias || exports.GREATEST_LOWER_BOUND);
      if (index < 0) {
        return -1;
      }

      // We have found either the exact element, or the next-closest element than
      // the one we are searching for. However, there may be more than one such
      // element. Make sure we always return the smallest of these.
      while (index - 1 >= 0) {
        if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
          break;
        }
        --index;
      }

      return index;
    };
    }(binarySearch$1));

    var quickSort$1 = {};

    /* -*- Mode: js; js-indent-level: 2; -*- */

    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    // It turns out that some (most?) JavaScript engines don't self-host
    // `Array.prototype.sort`. This makes sense because C++ will likely remain
    // faster than JS when doing raw CPU-intensive sorting. However, when using a
    // custom comparator function, calling back and forth between the VM's C++ and
    // JIT'd JS is rather slow *and* loses JIT type information, resulting in
    // worse generated code for the comparator function than would be optimal. In
    // fact, when sorting with a comparator, these costs outweigh the benefits of
    // sorting in C++. By using our own JS-implemented Quick Sort (below), we get
    // a ~3500ms mean speed-up in `bench/bench.html`.

    function SortTemplate(comparator) {

    /**
     * Swap the elements indexed by `x` and `y` in the array `ary`.
     *
     * @param {Array} ary
     *        The array.
     * @param {Number} x
     *        The index of the first item.
     * @param {Number} y
     *        The index of the second item.
     */
    function swap(ary, x, y) {
      var temp = ary[x];
      ary[x] = ary[y];
      ary[y] = temp;
    }

    /**
     * Returns a random integer within the range `low .. high` inclusive.
     *
     * @param {Number} low
     *        The lower bound on the range.
     * @param {Number} high
     *        The upper bound on the range.
     */
    function randomIntInRange(low, high) {
      return Math.round(low + (Math.random() * (high - low)));
    }

    /**
     * The Quick Sort algorithm.
     *
     * @param {Array} ary
     *        An array to sort.
     * @param {function} comparator
     *        Function to use to compare two items.
     * @param {Number} p
     *        Start index of the array
     * @param {Number} r
     *        End index of the array
     */
    function doQuickSort(ary, comparator, p, r) {
      // If our lower bound is less than our upper bound, we (1) partition the
      // array into two pieces and (2) recurse on each half. If it is not, this is
      // the empty array and our base case.

      if (p < r) {
        // (1) Partitioning.
        //
        // The partitioning chooses a pivot between `p` and `r` and moves all
        // elements that are less than or equal to the pivot to the before it, and
        // all the elements that are greater than it after it. The effect is that
        // once partition is done, the pivot is in the exact place it will be when
        // the array is put in sorted order, and it will not need to be moved
        // again. This runs in O(n) time.

        // Always choose a random pivot so that an input array which is reverse
        // sorted does not cause O(n^2) running time.
        var pivotIndex = randomIntInRange(p, r);
        var i = p - 1;

        swap(ary, pivotIndex, r);
        var pivot = ary[r];

        // Immediately after `j` is incremented in this loop, the following hold
        // true:
        //
        //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
        //
        //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
        for (var j = p; j < r; j++) {
          if (comparator(ary[j], pivot, false) <= 0) {
            i += 1;
            swap(ary, i, j);
          }
        }

        swap(ary, i + 1, j);
        var q = i + 1;

        // (2) Recurse on each half.

        doQuickSort(ary, comparator, p, q - 1);
        doQuickSort(ary, comparator, q + 1, r);
      }
    }

      return doQuickSort;
    }

    function cloneSort(comparator) {
      let template = SortTemplate.toString();
      let templateFn = new Function(`return ${template}`)();
      return templateFn(comparator);
    }

    /**
     * Sort the given array in-place with the given comparator function.
     *
     * @param {Array} ary
     *        An array to sort.
     * @param {function} comparator
     *        Function to use to compare two items.
     */

    let sortCache = new WeakMap();
    quickSort$1.quickSort = function (ary, comparator, start = 0) {
      let doQuickSort = sortCache.get(comparator);
      if (doQuickSort === void 0) {
        doQuickSort = cloneSort(comparator);
        sortCache.set(comparator, doQuickSort);
      }
      doQuickSort(ary, comparator, start, ary.length - 1);
    };

    /* -*- Mode: js; js-indent-level: 2; -*- */

    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    var util$1 = util$5;
    var binarySearch = binarySearch$1;
    var ArraySet = arraySet.ArraySet;
    var base64VLQ = base64Vlq;
    var quickSort = quickSort$1.quickSort;

    function SourceMapConsumer$3(aSourceMap, aSourceMapURL) {
      var sourceMap = aSourceMap;
      if (typeof aSourceMap === 'string') {
        sourceMap = util$1.parseSourceMapInput(aSourceMap);
      }

      return sourceMap.sections != null
        ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
        : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
    }

    SourceMapConsumer$3.fromSourceMap = function(aSourceMap, aSourceMapURL) {
      return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
    };

    /**
     * The version of the source mapping spec that we are consuming.
     */
    SourceMapConsumer$3.prototype._version = 3;

    // `__generatedMappings` and `__originalMappings` are arrays that hold the
    // parsed mapping coordinates from the source map's "mappings" attribute. They
    // are lazily instantiated, accessed via the `_generatedMappings` and
    // `_originalMappings` getters respectively, and we only parse the mappings
    // and create these arrays once queried for a source location. We jump through
    // these hoops because there can be many thousands of mappings, and parsing
    // them is expensive, so we only want to do it if we must.
    //
    // Each object in the arrays is of the form:
    //
    //     {
    //       generatedLine: The line number in the generated code,
    //       generatedColumn: The column number in the generated code,
    //       source: The path to the original source file that generated this
    //               chunk of code,
    //       originalLine: The line number in the original source that
    //                     corresponds to this chunk of generated code,
    //       originalColumn: The column number in the original source that
    //                       corresponds to this chunk of generated code,
    //       name: The name of the original symbol which generated this chunk of
    //             code.
    //     }
    //
    // All properties except for `generatedLine` and `generatedColumn` can be
    // `null`.
    //
    // `_generatedMappings` is ordered by the generated positions.
    //
    // `_originalMappings` is ordered by the original positions.

    SourceMapConsumer$3.prototype.__generatedMappings = null;
    Object.defineProperty(SourceMapConsumer$3.prototype, '_generatedMappings', {
      configurable: true,
      enumerable: true,
      get: function () {
        if (!this.__generatedMappings) {
          this._parseMappings(this._mappings, this.sourceRoot);
        }

        return this.__generatedMappings;
      }
    });

    SourceMapConsumer$3.prototype.__originalMappings = null;
    Object.defineProperty(SourceMapConsumer$3.prototype, '_originalMappings', {
      configurable: true,
      enumerable: true,
      get: function () {
        if (!this.__originalMappings) {
          this._parseMappings(this._mappings, this.sourceRoot);
        }

        return this.__originalMappings;
      }
    });

    SourceMapConsumer$3.prototype._charIsMappingSeparator =
      function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
        var c = aStr.charAt(index);
        return c === ";" || c === ",";
      };

    /**
     * Parse the mappings in a string in to a data structure which we can easily
     * query (the ordered arrays in the `this.__generatedMappings` and
     * `this.__originalMappings` properties).
     */
    SourceMapConsumer$3.prototype._parseMappings =
      function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        throw new Error("Subclasses must implement _parseMappings");
      };

    SourceMapConsumer$3.GENERATED_ORDER = 1;
    SourceMapConsumer$3.ORIGINAL_ORDER = 2;

    SourceMapConsumer$3.GREATEST_LOWER_BOUND = 1;
    SourceMapConsumer$3.LEAST_UPPER_BOUND = 2;

    /**
     * Iterate over each mapping between an original source/line/column and a
     * generated line/column in this source map.
     *
     * @param Function aCallback
     *        The function that is called with each mapping.
     * @param Object aContext
     *        Optional. If specified, this object will be the value of `this` every
     *        time that `aCallback` is called.
     * @param aOrder
     *        Either `SourceMapConsumer.GENERATED_ORDER` or
     *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
     *        iterate over the mappings sorted by the generated file's line/column
     *        order or the original's source/line/column order, respectively. Defaults to
     *        `SourceMapConsumer.GENERATED_ORDER`.
     */
    SourceMapConsumer$3.prototype.eachMapping =
      function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
        var context = aContext || null;
        var order = aOrder || SourceMapConsumer$3.GENERATED_ORDER;

        var mappings;
        switch (order) {
        case SourceMapConsumer$3.GENERATED_ORDER:
          mappings = this._generatedMappings;
          break;
        case SourceMapConsumer$3.ORIGINAL_ORDER:
          mappings = this._originalMappings;
          break;
        default:
          throw new Error("Unknown order of iteration.");
        }

        var sourceRoot = this.sourceRoot;
        var boundCallback = aCallback.bind(context);
        var names = this._names;
        var sources = this._sources;
        var sourceMapURL = this._sourceMapURL;

        for (var i = 0, n = mappings.length; i < n; i++) {
          var mapping = mappings[i];
          var source = mapping.source === null ? null : sources.at(mapping.source);
          source = util$1.computeSourceURL(sourceRoot, source, sourceMapURL);
          boundCallback({
            source: source,
            generatedLine: mapping.generatedLine,
            generatedColumn: mapping.generatedColumn,
            originalLine: mapping.originalLine,
            originalColumn: mapping.originalColumn,
            name: mapping.name === null ? null : names.at(mapping.name)
          });
        }
      };

    /**
     * Returns all generated line and column information for the original source,
     * line, and column provided. If no column is provided, returns all mappings
     * corresponding to a either the line we are searching for or the next
     * closest line that has any mappings. Otherwise, returns all mappings
     * corresponding to the given line and either the column we are searching for
     * or the next closest column that has any offsets.
     *
     * The only argument is an object with the following properties:
     *
     *   - source: The filename of the original source.
     *   - line: The line number in the original source.  The line number is 1-based.
     *   - column: Optional. the column number in the original source.
     *    The column number is 0-based.
     *
     * and an array of objects is returned, each with the following properties:
     *
     *   - line: The line number in the generated source, or null.  The
     *    line number is 1-based.
     *   - column: The column number in the generated source, or null.
     *    The column number is 0-based.
     */
    SourceMapConsumer$3.prototype.allGeneratedPositionsFor =
      function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
        var line = util$1.getArg(aArgs, 'line');

        // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
        // returns the index of the closest mapping less than the needle. By
        // setting needle.originalColumn to 0, we thus find the last mapping for
        // the given line, provided such a mapping exists.
        var needle = {
          source: util$1.getArg(aArgs, 'source'),
          originalLine: line,
          originalColumn: util$1.getArg(aArgs, 'column', 0)
        };

        needle.source = this._findSourceIndex(needle.source);
        if (needle.source < 0) {
          return [];
        }

        var mappings = [];

        var index = this._findMapping(needle,
                                      this._originalMappings,
                                      "originalLine",
                                      "originalColumn",
                                      util$1.compareByOriginalPositions,
                                      binarySearch.LEAST_UPPER_BOUND);
        if (index >= 0) {
          var mapping = this._originalMappings[index];

          if (aArgs.column === undefined) {
            var originalLine = mapping.originalLine;

            // Iterate until either we run out of mappings, or we run into
            // a mapping for a different line than the one we found. Since
            // mappings are sorted, this is guaranteed to find all mappings for
            // the line we found.
            while (mapping && mapping.originalLine === originalLine) {
              mappings.push({
                line: util$1.getArg(mapping, 'generatedLine', null),
                column: util$1.getArg(mapping, 'generatedColumn', null),
                lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
              });

              mapping = this._originalMappings[++index];
            }
          } else {
            var originalColumn = mapping.originalColumn;

            // Iterate until either we run out of mappings, or we run into
            // a mapping for a different line than the one we were searching for.
            // Since mappings are sorted, this is guaranteed to find all mappings for
            // the line we are searching for.
            while (mapping &&
                   mapping.originalLine === line &&
                   mapping.originalColumn == originalColumn) {
              mappings.push({
                line: util$1.getArg(mapping, 'generatedLine', null),
                column: util$1.getArg(mapping, 'generatedColumn', null),
                lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
              });

              mapping = this._originalMappings[++index];
            }
          }
        }

        return mappings;
      };

    sourceMapConsumer.SourceMapConsumer = SourceMapConsumer$3;

    /**
     * A BasicSourceMapConsumer instance represents a parsed source map which we can
     * query for information about the original file positions by giving it a file
     * position in the generated source.
     *
     * The first parameter is the raw source map (either as a JSON string, or
     * already parsed to an object). According to the spec, source maps have the
     * following attributes:
     *
     *   - version: Which version of the source map spec this map is following.
     *   - sources: An array of URLs to the original source files.
     *   - names: An array of identifiers which can be referrenced by individual mappings.
     *   - sourceRoot: Optional. The URL root from which all sources are relative.
     *   - sourcesContent: Optional. An array of contents of the original source files.
     *   - mappings: A string of base64 VLQs which contain the actual mappings.
     *   - file: Optional. The generated file this source map is associated with.
     *
     * Here is an example source map, taken from the source map spec[0]:
     *
     *     {
     *       version : 3,
     *       file: "out.js",
     *       sourceRoot : "",
     *       sources: ["foo.js", "bar.js"],
     *       names: ["src", "maps", "are", "fun"],
     *       mappings: "AA,AB;;ABCDE;"
     *     }
     *
     * The second parameter, if given, is a string whose value is the URL
     * at which the source map was found.  This URL is used to compute the
     * sources array.
     *
     * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
     */
    function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
      var sourceMap = aSourceMap;
      if (typeof aSourceMap === 'string') {
        sourceMap = util$1.parseSourceMapInput(aSourceMap);
      }

      var version = util$1.getArg(sourceMap, 'version');
      var sources = util$1.getArg(sourceMap, 'sources');
      // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
      // requires the array) to play nice here.
      var names = util$1.getArg(sourceMap, 'names', []);
      var sourceRoot = util$1.getArg(sourceMap, 'sourceRoot', null);
      var sourcesContent = util$1.getArg(sourceMap, 'sourcesContent', null);
      var mappings = util$1.getArg(sourceMap, 'mappings');
      var file = util$1.getArg(sourceMap, 'file', null);

      // Once again, Sass deviates from the spec and supplies the version as a
      // string rather than a number, so we use loose equality checking here.
      if (version != this._version) {
        throw new Error('Unsupported version: ' + version);
      }

      if (sourceRoot) {
        sourceRoot = util$1.normalize(sourceRoot);
      }

      sources = sources
        .map(String)
        // Some source maps produce relative source paths like "./foo.js" instead of
        // "foo.js".  Normalize these first so that future comparisons will succeed.
        // See bugzil.la/1090768.
        .map(util$1.normalize)
        // Always ensure that absolute sources are internally stored relative to
        // the source root, if the source root is absolute. Not doing this would
        // be particularly problematic when the source root is a prefix of the
        // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
        .map(function (source) {
          return sourceRoot && util$1.isAbsolute(sourceRoot) && util$1.isAbsolute(source)
            ? util$1.relative(sourceRoot, source)
            : source;
        });

      // Pass `true` below to allow duplicate names and sources. While source maps
      // are intended to be compressed and deduplicated, the TypeScript compiler
      // sometimes generates source maps with duplicates in them. See Github issue
      // #72 and bugzil.la/889492.
      this._names = ArraySet.fromArray(names.map(String), true);
      this._sources = ArraySet.fromArray(sources, true);

      this._absoluteSources = this._sources.toArray().map(function (s) {
        return util$1.computeSourceURL(sourceRoot, s, aSourceMapURL);
      });

      this.sourceRoot = sourceRoot;
      this.sourcesContent = sourcesContent;
      this._mappings = mappings;
      this._sourceMapURL = aSourceMapURL;
      this.file = file;
    }

    BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer$3.prototype);
    BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer$3;

    /**
     * Utility function to find the index of a source.  Returns -1 if not
     * found.
     */
    BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
      var relativeSource = aSource;
      if (this.sourceRoot != null) {
        relativeSource = util$1.relative(this.sourceRoot, relativeSource);
      }

      if (this._sources.has(relativeSource)) {
        return this._sources.indexOf(relativeSource);
      }

      // Maybe aSource is an absolute URL as returned by |sources|.  In
      // this case we can't simply undo the transform.
      var i;
      for (i = 0; i < this._absoluteSources.length; ++i) {
        if (this._absoluteSources[i] == aSource) {
          return i;
        }
      }

      return -1;
    };

    /**
     * Create a BasicSourceMapConsumer from a SourceMapGenerator.
     *
     * @param SourceMapGenerator aSourceMap
     *        The source map that will be consumed.
     * @param String aSourceMapURL
     *        The URL at which the source map can be found (optional)
     * @returns BasicSourceMapConsumer
     */
    BasicSourceMapConsumer.fromSourceMap =
      function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
        var smc = Object.create(BasicSourceMapConsumer.prototype);

        var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
        var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
        smc.sourceRoot = aSourceMap._sourceRoot;
        smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                                smc.sourceRoot);
        smc.file = aSourceMap._file;
        smc._sourceMapURL = aSourceMapURL;
        smc._absoluteSources = smc._sources.toArray().map(function (s) {
          return util$1.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
        });

        // Because we are modifying the entries (by converting string sources and
        // names to indices into the sources and names ArraySets), we have to make
        // a copy of the entry or else bad things happen. Shared mutable state
        // strikes again! See github issue #191.

        var generatedMappings = aSourceMap._mappings.toArray().slice();
        var destGeneratedMappings = smc.__generatedMappings = [];
        var destOriginalMappings = smc.__originalMappings = [];

        for (var i = 0, length = generatedMappings.length; i < length; i++) {
          var srcMapping = generatedMappings[i];
          var destMapping = new Mapping;
          destMapping.generatedLine = srcMapping.generatedLine;
          destMapping.generatedColumn = srcMapping.generatedColumn;

          if (srcMapping.source) {
            destMapping.source = sources.indexOf(srcMapping.source);
            destMapping.originalLine = srcMapping.originalLine;
            destMapping.originalColumn = srcMapping.originalColumn;

            if (srcMapping.name) {
              destMapping.name = names.indexOf(srcMapping.name);
            }

            destOriginalMappings.push(destMapping);
          }

          destGeneratedMappings.push(destMapping);
        }

        quickSort(smc.__originalMappings, util$1.compareByOriginalPositions);

        return smc;
      };

    /**
     * The version of the source mapping spec that we are consuming.
     */
    BasicSourceMapConsumer.prototype._version = 3;

    /**
     * The list of original sources.
     */
    Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
      get: function () {
        return this._absoluteSources.slice();
      }
    });

    /**
     * Provide the JIT with a nice shape / hidden class.
     */
    function Mapping() {
      this.generatedLine = 0;
      this.generatedColumn = 0;
      this.source = null;
      this.originalLine = null;
      this.originalColumn = null;
      this.name = null;
    }

    /**
     * Parse the mappings in a string in to a data structure which we can easily
     * query (the ordered arrays in the `this.__generatedMappings` and
     * `this.__originalMappings` properties).
     */

    const compareGenerated = util$1.compareByGeneratedPositionsDeflatedNoLine;
    function sortGenerated(array, start) {
      let l = array.length;
      let n = array.length - start;
      if (n <= 1) {
        return;
      } else if (n == 2) {
        let a = array[start];
        let b = array[start + 1];
        if (compareGenerated(a, b) > 0) {
          array[start] = b;
          array[start + 1] = a;
        }
      } else if (n < 20) {
        for (let i = start; i < l; i++) {
          for (let j = i; j > start; j--) {
            let a = array[j - 1];
            let b = array[j];
            if (compareGenerated(a, b) <= 0) {
              break;
            }
            array[j - 1] = b;
            array[j] = a;
          }
        }
      } else {
        quickSort(array, compareGenerated, start);
      }
    }
    BasicSourceMapConsumer.prototype._parseMappings =
      function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        var generatedLine = 1;
        var previousGeneratedColumn = 0;
        var previousOriginalLine = 0;
        var previousOriginalColumn = 0;
        var previousSource = 0;
        var previousName = 0;
        var length = aStr.length;
        var index = 0;
        var temp = {};
        var originalMappings = [];
        var generatedMappings = [];
        var mapping, segment, end, value;

        let subarrayStart = 0;
        while (index < length) {
          if (aStr.charAt(index) === ';') {
            generatedLine++;
            index++;
            previousGeneratedColumn = 0;

            sortGenerated(generatedMappings, subarrayStart);
            subarrayStart = generatedMappings.length;
          }
          else if (aStr.charAt(index) === ',') {
            index++;
          }
          else {
            mapping = new Mapping();
            mapping.generatedLine = generatedLine;

            for (end = index; end < length; end++) {
              if (this._charIsMappingSeparator(aStr, end)) {
                break;
              }
            }
            aStr.slice(index, end);

            segment = [];
            while (index < end) {
              base64VLQ.decode(aStr, index, temp);
              value = temp.value;
              index = temp.rest;
              segment.push(value);
            }

            if (segment.length === 2) {
              throw new Error('Found a source, but no line and column');
            }

            if (segment.length === 3) {
              throw new Error('Found a source and line, but no column');
            }

            // Generated column.
            mapping.generatedColumn = previousGeneratedColumn + segment[0];
            previousGeneratedColumn = mapping.generatedColumn;

            if (segment.length > 1) {
              // Original source.
              mapping.source = previousSource + segment[1];
              previousSource += segment[1];

              // Original line.
              mapping.originalLine = previousOriginalLine + segment[2];
              previousOriginalLine = mapping.originalLine;
              // Lines are stored 0-based
              mapping.originalLine += 1;

              // Original column.
              mapping.originalColumn = previousOriginalColumn + segment[3];
              previousOriginalColumn = mapping.originalColumn;

              if (segment.length > 4) {
                // Original name.
                mapping.name = previousName + segment[4];
                previousName += segment[4];
              }
            }

            generatedMappings.push(mapping);
            if (typeof mapping.originalLine === 'number') {
              let currentSource = mapping.source;
              while (originalMappings.length <= currentSource) {
                originalMappings.push(null);
              }
              if (originalMappings[currentSource] === null) {
                originalMappings[currentSource] = [];
              }
              originalMappings[currentSource].push(mapping);
            }
          }
        }

        sortGenerated(generatedMappings, subarrayStart);
        this.__generatedMappings = generatedMappings;

        for (var i = 0; i < originalMappings.length; i++) {
          if (originalMappings[i] != null) {
            quickSort(originalMappings[i], util$1.compareByOriginalPositionsNoSource);
          }
        }
        this.__originalMappings = [].concat(...originalMappings);
      };

    /**
     * Find the mapping that best matches the hypothetical "needle" mapping that
     * we are searching for in the given "haystack" of mappings.
     */
    BasicSourceMapConsumer.prototype._findMapping =
      function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                             aColumnName, aComparator, aBias) {
        // To return the position we are searching for, we must first find the
        // mapping for the given position and then return the opposite position it
        // points to. Because the mappings are sorted, we can use binary search to
        // find the best mapping.

        if (aNeedle[aLineName] <= 0) {
          throw new TypeError('Line must be greater than or equal to 1, got '
                              + aNeedle[aLineName]);
        }
        if (aNeedle[aColumnName] < 0) {
          throw new TypeError('Column must be greater than or equal to 0, got '
                              + aNeedle[aColumnName]);
        }

        return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
      };

    /**
     * Compute the last column for each generated mapping. The last column is
     * inclusive.
     */
    BasicSourceMapConsumer.prototype.computeColumnSpans =
      function SourceMapConsumer_computeColumnSpans() {
        for (var index = 0; index < this._generatedMappings.length; ++index) {
          var mapping = this._generatedMappings[index];

          // Mappings do not contain a field for the last generated columnt. We
          // can come up with an optimistic estimate, however, by assuming that
          // mappings are contiguous (i.e. given two consecutive mappings, the
          // first mapping ends where the second one starts).
          if (index + 1 < this._generatedMappings.length) {
            var nextMapping = this._generatedMappings[index + 1];

            if (mapping.generatedLine === nextMapping.generatedLine) {
              mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
              continue;
            }
          }

          // The last mapping for each line spans the entire line.
          mapping.lastGeneratedColumn = Infinity;
        }
      };

    /**
     * Returns the original source, line, and column information for the generated
     * source's line and column positions provided. The only argument is an object
     * with the following properties:
     *
     *   - line: The line number in the generated source.  The line number
     *     is 1-based.
     *   - column: The column number in the generated source.  The column
     *     number is 0-based.
     *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
     *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
     *     closest element that is smaller than or greater than the one we are
     *     searching for, respectively, if the exact element cannot be found.
     *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
     *
     * and an object is returned with the following properties:
     *
     *   - source: The original source file, or null.
     *   - line: The line number in the original source, or null.  The
     *     line number is 1-based.
     *   - column: The column number in the original source, or null.  The
     *     column number is 0-based.
     *   - name: The original identifier, or null.
     */
    BasicSourceMapConsumer.prototype.originalPositionFor =
      function SourceMapConsumer_originalPositionFor(aArgs) {
        var needle = {
          generatedLine: util$1.getArg(aArgs, 'line'),
          generatedColumn: util$1.getArg(aArgs, 'column')
        };

        var index = this._findMapping(
          needle,
          this._generatedMappings,
          "generatedLine",
          "generatedColumn",
          util$1.compareByGeneratedPositionsDeflated,
          util$1.getArg(aArgs, 'bias', SourceMapConsumer$3.GREATEST_LOWER_BOUND)
        );

        if (index >= 0) {
          var mapping = this._generatedMappings[index];

          if (mapping.generatedLine === needle.generatedLine) {
            var source = util$1.getArg(mapping, 'source', null);
            if (source !== null) {
              source = this._sources.at(source);
              source = util$1.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
            }
            var name = util$1.getArg(mapping, 'name', null);
            if (name !== null) {
              name = this._names.at(name);
            }
            return {
              source: source,
              line: util$1.getArg(mapping, 'originalLine', null),
              column: util$1.getArg(mapping, 'originalColumn', null),
              name: name
            };
          }
        }

        return {
          source: null,
          line: null,
          column: null,
          name: null
        };
      };

    /**
     * Return true if we have the source content for every source in the source
     * map, false otherwise.
     */
    BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
      function BasicSourceMapConsumer_hasContentsOfAllSources() {
        if (!this.sourcesContent) {
          return false;
        }
        return this.sourcesContent.length >= this._sources.size() &&
          !this.sourcesContent.some(function (sc) { return sc == null; });
      };

    /**
     * Returns the original source content. The only argument is the url of the
     * original source file. Returns null if no original source content is
     * available.
     */
    BasicSourceMapConsumer.prototype.sourceContentFor =
      function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
        if (!this.sourcesContent) {
          return null;
        }

        var index = this._findSourceIndex(aSource);
        if (index >= 0) {
          return this.sourcesContent[index];
        }

        var relativeSource = aSource;
        if (this.sourceRoot != null) {
          relativeSource = util$1.relative(this.sourceRoot, relativeSource);
        }

        var url;
        if (this.sourceRoot != null
            && (url = util$1.urlParse(this.sourceRoot))) {
          // XXX: file:// URIs and absolute paths lead to unexpected behavior for
          // many users. We can help them out when they expect file:// URIs to
          // behave like it would if they were running a local HTTP server. See
          // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
          var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
          if (url.scheme == "file"
              && this._sources.has(fileUriAbsPath)) {
            return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
          }

          if ((!url.path || url.path == "/")
              && this._sources.has("/" + relativeSource)) {
            return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
          }
        }

        // This function is used recursively from
        // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
        // don't want to throw if we can't find the source - we just want to
        // return null, so we provide a flag to exit gracefully.
        if (nullOnMissing) {
          return null;
        }
        else {
          throw new Error('"' + relativeSource + '" is not in the SourceMap.');
        }
      };

    /**
     * Returns the generated line and column information for the original source,
     * line, and column positions provided. The only argument is an object with
     * the following properties:
     *
     *   - source: The filename of the original source.
     *   - line: The line number in the original source.  The line number
     *     is 1-based.
     *   - column: The column number in the original source.  The column
     *     number is 0-based.
     *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
     *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
     *     closest element that is smaller than or greater than the one we are
     *     searching for, respectively, if the exact element cannot be found.
     *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
     *
     * and an object is returned with the following properties:
     *
     *   - line: The line number in the generated source, or null.  The
     *     line number is 1-based.
     *   - column: The column number in the generated source, or null.
     *     The column number is 0-based.
     */
    BasicSourceMapConsumer.prototype.generatedPositionFor =
      function SourceMapConsumer_generatedPositionFor(aArgs) {
        var source = util$1.getArg(aArgs, 'source');
        source = this._findSourceIndex(source);
        if (source < 0) {
          return {
            line: null,
            column: null,
            lastColumn: null
          };
        }

        var needle = {
          source: source,
          originalLine: util$1.getArg(aArgs, 'line'),
          originalColumn: util$1.getArg(aArgs, 'column')
        };

        var index = this._findMapping(
          needle,
          this._originalMappings,
          "originalLine",
          "originalColumn",
          util$1.compareByOriginalPositions,
          util$1.getArg(aArgs, 'bias', SourceMapConsumer$3.GREATEST_LOWER_BOUND)
        );

        if (index >= 0) {
          var mapping = this._originalMappings[index];

          if (mapping.source === needle.source) {
            return {
              line: util$1.getArg(mapping, 'generatedLine', null),
              column: util$1.getArg(mapping, 'generatedColumn', null),
              lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
            };
          }
        }

        return {
          line: null,
          column: null,
          lastColumn: null
        };
      };

    sourceMapConsumer.BasicSourceMapConsumer = BasicSourceMapConsumer;

    /**
     * An IndexedSourceMapConsumer instance represents a parsed source map which
     * we can query for information. It differs from BasicSourceMapConsumer in
     * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
     * input.
     *
     * The first parameter is a raw source map (either as a JSON string, or already
     * parsed to an object). According to the spec for indexed source maps, they
     * have the following attributes:
     *
     *   - version: Which version of the source map spec this map is following.
     *   - file: Optional. The generated file this source map is associated with.
     *   - sections: A list of section definitions.
     *
     * Each value under the "sections" field has two fields:
     *   - offset: The offset into the original specified at which this section
     *       begins to apply, defined as an object with a "line" and "column"
     *       field.
     *   - map: A source map definition. This source map could also be indexed,
     *       but doesn't have to be.
     *
     * Instead of the "map" field, it's also possible to have a "url" field
     * specifying a URL to retrieve a source map from, but that's currently
     * unsupported.
     *
     * Here's an example source map, taken from the source map spec[0], but
     * modified to omit a section which uses the "url" field.
     *
     *  {
     *    version : 3,
     *    file: "app.js",
     *    sections: [{
     *      offset: {line:100, column:10},
     *      map: {
     *        version : 3,
     *        file: "section.js",
     *        sources: ["foo.js", "bar.js"],
     *        names: ["src", "maps", "are", "fun"],
     *        mappings: "AAAA,E;;ABCDE;"
     *      }
     *    }],
     *  }
     *
     * The second parameter, if given, is a string whose value is the URL
     * at which the source map was found.  This URL is used to compute the
     * sources array.
     *
     * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
     */
    function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
      var sourceMap = aSourceMap;
      if (typeof aSourceMap === 'string') {
        sourceMap = util$1.parseSourceMapInput(aSourceMap);
      }

      var version = util$1.getArg(sourceMap, 'version');
      var sections = util$1.getArg(sourceMap, 'sections');

      if (version != this._version) {
        throw new Error('Unsupported version: ' + version);
      }

      this._sources = new ArraySet();
      this._names = new ArraySet();

      var lastOffset = {
        line: -1,
        column: 0
      };
      this._sections = sections.map(function (s) {
        if (s.url) {
          // The url field will require support for asynchronicity.
          // See https://github.com/mozilla/source-map/issues/16
          throw new Error('Support for url field in sections not implemented.');
        }
        var offset = util$1.getArg(s, 'offset');
        var offsetLine = util$1.getArg(offset, 'line');
        var offsetColumn = util$1.getArg(offset, 'column');

        if (offsetLine < lastOffset.line ||
            (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
          throw new Error('Section offsets must be ordered and non-overlapping.');
        }
        lastOffset = offset;

        return {
          generatedOffset: {
            // The offset fields are 0-based, but we use 1-based indices when
            // encoding/decoding from VLQ.
            generatedLine: offsetLine + 1,
            generatedColumn: offsetColumn + 1
          },
          consumer: new SourceMapConsumer$3(util$1.getArg(s, 'map'), aSourceMapURL)
        }
      });
    }

    IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer$3.prototype);
    IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer$3;

    /**
     * The version of the source mapping spec that we are consuming.
     */
    IndexedSourceMapConsumer.prototype._version = 3;

    /**
     * The list of original sources.
     */
    Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
      get: function () {
        var sources = [];
        for (var i = 0; i < this._sections.length; i++) {
          for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
            sources.push(this._sections[i].consumer.sources[j]);
          }
        }
        return sources;
      }
    });

    /**
     * Returns the original source, line, and column information for the generated
     * source's line and column positions provided. The only argument is an object
     * with the following properties:
     *
     *   - line: The line number in the generated source.  The line number
     *     is 1-based.
     *   - column: The column number in the generated source.  The column
     *     number is 0-based.
     *
     * and an object is returned with the following properties:
     *
     *   - source: The original source file, or null.
     *   - line: The line number in the original source, or null.  The
     *     line number is 1-based.
     *   - column: The column number in the original source, or null.  The
     *     column number is 0-based.
     *   - name: The original identifier, or null.
     */
    IndexedSourceMapConsumer.prototype.originalPositionFor =
      function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
        var needle = {
          generatedLine: util$1.getArg(aArgs, 'line'),
          generatedColumn: util$1.getArg(aArgs, 'column')
        };

        // Find the section containing the generated position we're trying to map
        // to an original position.
        var sectionIndex = binarySearch.search(needle, this._sections,
          function(needle, section) {
            var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
            if (cmp) {
              return cmp;
            }

            return (needle.generatedColumn -
                    section.generatedOffset.generatedColumn);
          });
        var section = this._sections[sectionIndex];

        if (!section) {
          return {
            source: null,
            line: null,
            column: null,
            name: null
          };
        }

        return section.consumer.originalPositionFor({
          line: needle.generatedLine -
            (section.generatedOffset.generatedLine - 1),
          column: needle.generatedColumn -
            (section.generatedOffset.generatedLine === needle.generatedLine
             ? section.generatedOffset.generatedColumn - 1
             : 0),
          bias: aArgs.bias
        });
      };

    /**
     * Return true if we have the source content for every source in the source
     * map, false otherwise.
     */
    IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
      function IndexedSourceMapConsumer_hasContentsOfAllSources() {
        return this._sections.every(function (s) {
          return s.consumer.hasContentsOfAllSources();
        });
      };

    /**
     * Returns the original source content. The only argument is the url of the
     * original source file. Returns null if no original source content is
     * available.
     */
    IndexedSourceMapConsumer.prototype.sourceContentFor =
      function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];

          var content = section.consumer.sourceContentFor(aSource, true);
          if (content) {
            return content;
          }
        }
        if (nullOnMissing) {
          return null;
        }
        else {
          throw new Error('"' + aSource + '" is not in the SourceMap.');
        }
      };

    /**
     * Returns the generated line and column information for the original source,
     * line, and column positions provided. The only argument is an object with
     * the following properties:
     *
     *   - source: The filename of the original source.
     *   - line: The line number in the original source.  The line number
     *     is 1-based.
     *   - column: The column number in the original source.  The column
     *     number is 0-based.
     *
     * and an object is returned with the following properties:
     *
     *   - line: The line number in the generated source, or null.  The
     *     line number is 1-based. 
     *   - column: The column number in the generated source, or null.
     *     The column number is 0-based.
     */
    IndexedSourceMapConsumer.prototype.generatedPositionFor =
      function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];

          // Only consider this section if the requested source is in the list of
          // sources of the consumer.
          if (section.consumer._findSourceIndex(util$1.getArg(aArgs, 'source')) === -1) {
            continue;
          }
          var generatedPosition = section.consumer.generatedPositionFor(aArgs);
          if (generatedPosition) {
            var ret = {
              line: generatedPosition.line +
                (section.generatedOffset.generatedLine - 1),
              column: generatedPosition.column +
                (section.generatedOffset.generatedLine === generatedPosition.line
                 ? section.generatedOffset.generatedColumn - 1
                 : 0)
            };
            return ret;
          }
        }

        return {
          line: null,
          column: null
        };
      };

    /**
     * Parse the mappings in a string in to a data structure which we can easily
     * query (the ordered arrays in the `this.__generatedMappings` and
     * `this.__originalMappings` properties).
     */
    IndexedSourceMapConsumer.prototype._parseMappings =
      function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];
          var sectionMappings = section.consumer._generatedMappings;
          for (var j = 0; j < sectionMappings.length; j++) {
            var mapping = sectionMappings[j];

            var source = section.consumer._sources.at(mapping.source);
            source = util$1.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
            this._sources.add(source);
            source = this._sources.indexOf(source);

            var name = null;
            if (mapping.name) {
              name = section.consumer._names.at(mapping.name);
              this._names.add(name);
              name = this._names.indexOf(name);
            }

            // The mappings coming from the consumer for the section have
            // generated positions relative to the start of the section, so we
            // need to offset them to be relative to the start of the concatenated
            // generated file.
            var adjustedMapping = {
              source: source,
              generatedLine: mapping.generatedLine +
                (section.generatedOffset.generatedLine - 1),
              generatedColumn: mapping.generatedColumn +
                (section.generatedOffset.generatedLine === mapping.generatedLine
                ? section.generatedOffset.generatedColumn - 1
                : 0),
              originalLine: mapping.originalLine,
              originalColumn: mapping.originalColumn,
              name: name
            };

            this.__generatedMappings.push(adjustedMapping);
            if (typeof adjustedMapping.originalLine === 'number') {
              this.__originalMappings.push(adjustedMapping);
            }
          }
        }

        quickSort(this.__generatedMappings, util$1.compareByGeneratedPositionsDeflated);
        quickSort(this.__originalMappings, util$1.compareByOriginalPositions);
      };

    sourceMapConsumer.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

    var sourceNode = {};

    /* -*- Mode: js; js-indent-level: 2; -*- */

    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    var SourceMapGenerator$3 = sourceMapGenerator.SourceMapGenerator;
    var util = util$5;

    // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
    // operating systems these days (capturing the result).
    var REGEX_NEWLINE = /(\r?\n)/;

    // Newline character code for charCodeAt() comparisons
    var NEWLINE_CODE = 10;

    // Private symbol for identifying `SourceNode`s when multiple versions of
    // the source-map library are loaded. This MUST NOT CHANGE across
    // versions!
    var isSourceNode = "$$$isSourceNode$$$";

    /**
     * SourceNodes provide a way to abstract over interpolating/concatenating
     * snippets of generated JavaScript source code while maintaining the line and
     * column information associated with the original source code.
     *
     * @param aLine The original line number.
     * @param aColumn The original column number.
     * @param aSource The original source's filename.
     * @param aChunks Optional. An array of strings which are snippets of
     *        generated JS, or other SourceNodes.
     * @param aName The original identifier.
     */
    function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
      this.children = [];
      this.sourceContents = {};
      this.line = aLine == null ? null : aLine;
      this.column = aColumn == null ? null : aColumn;
      this.source = aSource == null ? null : aSource;
      this.name = aName == null ? null : aName;
      this[isSourceNode] = true;
      if (aChunks != null) this.add(aChunks);
    }

    /**
     * Creates a SourceNode from generated code and a SourceMapConsumer.
     *
     * @param aGeneratedCode The generated code
     * @param aSourceMapConsumer The SourceMap for the generated code
     * @param aRelativePath Optional. The path that relative sources in the
     *        SourceMapConsumer should be relative to.
     */
    SourceNode.fromStringWithSourceMap =
      function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
        // The SourceNode we want to fill with the generated code
        // and the SourceMap
        var node = new SourceNode();

        // All even indices of this array are one line of the generated code,
        // while all odd indices are the newlines between two adjacent lines
        // (since `REGEX_NEWLINE` captures its match).
        // Processed fragments are accessed by calling `shiftNextLine`.
        var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
        var remainingLinesIndex = 0;
        var shiftNextLine = function() {
          var lineContents = getNextLine();
          // The last line of a file might not have a newline.
          var newLine = getNextLine() || "";
          return lineContents + newLine;

          function getNextLine() {
            return remainingLinesIndex < remainingLines.length ?
                remainingLines[remainingLinesIndex++] : undefined;
          }
        };

        // We need to remember the position of "remainingLines"
        var lastGeneratedLine = 1, lastGeneratedColumn = 0;

        // The generate SourceNodes we need a code range.
        // To extract it current and last mapping is used.
        // Here we store the last mapping.
        var lastMapping = null;

        aSourceMapConsumer.eachMapping(function (mapping) {
          if (lastMapping !== null) {
            // We add the code from "lastMapping" to "mapping":
            // First check if there is a new line in between.
            if (lastGeneratedLine < mapping.generatedLine) {
              // Associate first line with "lastMapping"
              addMappingWithCode(lastMapping, shiftNextLine());
              lastGeneratedLine++;
              lastGeneratedColumn = 0;
              // The remaining code is added without mapping
            } else {
              // There is no new line in between.
              // Associate the code between "lastGeneratedColumn" and
              // "mapping.generatedColumn" with "lastMapping"
              var nextLine = remainingLines[remainingLinesIndex] || '';
              var code = nextLine.substr(0, mapping.generatedColumn -
                                            lastGeneratedColumn);
              remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                                  lastGeneratedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
              addMappingWithCode(lastMapping, code);
              // No more remaining code, continue
              lastMapping = mapping;
              return;
            }
          }
          // We add the generated code until the first mapping
          // to the SourceNode without any mapping.
          // Each line is added as separate string.
          while (lastGeneratedLine < mapping.generatedLine) {
            node.add(shiftNextLine());
            lastGeneratedLine++;
          }
          if (lastGeneratedColumn < mapping.generatedColumn) {
            var nextLine = remainingLines[remainingLinesIndex] || '';
            node.add(nextLine.substr(0, mapping.generatedColumn));
            remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
          }
          lastMapping = mapping;
        }, this);
        // We have processed all mappings.
        if (remainingLinesIndex < remainingLines.length) {
          if (lastMapping) {
            // Associate the remaining code in the current line with "lastMapping"
            addMappingWithCode(lastMapping, shiftNextLine());
          }
          // and add the remaining lines without any mapping
          node.add(remainingLines.splice(remainingLinesIndex).join(""));
        }

        // Copy sourcesContent into SourceNode
        aSourceMapConsumer.sources.forEach(function (sourceFile) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            if (aRelativePath != null) {
              sourceFile = util.join(aRelativePath, sourceFile);
            }
            node.setSourceContent(sourceFile, content);
          }
        });

        return node;

        function addMappingWithCode(mapping, code) {
          if (mapping === null || mapping.source === undefined) {
            node.add(code);
          } else {
            var source = aRelativePath
              ? util.join(aRelativePath, mapping.source)
              : mapping.source;
            node.add(new SourceNode(mapping.originalLine,
                                    mapping.originalColumn,
                                    source,
                                    code,
                                    mapping.name));
          }
        }
      };

    /**
     * Add a chunk of generated JS to this source node.
     *
     * @param aChunk A string snippet of generated JS code, another instance of
     *        SourceNode, or an array where each member is one of those things.
     */
    SourceNode.prototype.add = function SourceNode_add(aChunk) {
      if (Array.isArray(aChunk)) {
        aChunk.forEach(function (chunk) {
          this.add(chunk);
        }, this);
      }
      else if (aChunk[isSourceNode] || typeof aChunk === "string") {
        if (aChunk) {
          this.children.push(aChunk);
        }
      }
      else {
        throw new TypeError(
          "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
        );
      }
      return this;
    };

    /**
     * Add a chunk of generated JS to the beginning of this source node.
     *
     * @param aChunk A string snippet of generated JS code, another instance of
     *        SourceNode, or an array where each member is one of those things.
     */
    SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
      if (Array.isArray(aChunk)) {
        for (var i = aChunk.length-1; i >= 0; i--) {
          this.prepend(aChunk[i]);
        }
      }
      else if (aChunk[isSourceNode] || typeof aChunk === "string") {
        this.children.unshift(aChunk);
      }
      else {
        throw new TypeError(
          "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
        );
      }
      return this;
    };

    /**
     * Walk over the tree of JS snippets in this node and its children. The
     * walking function is called once for each snippet of JS and is passed that
     * snippet and the its original associated source's line/column location.
     *
     * @param aFn The traversal function.
     */
    SourceNode.prototype.walk = function SourceNode_walk(aFn) {
      var chunk;
      for (var i = 0, len = this.children.length; i < len; i++) {
        chunk = this.children[i];
        if (chunk[isSourceNode]) {
          chunk.walk(aFn);
        }
        else {
          if (chunk !== '') {
            aFn(chunk, { source: this.source,
                         line: this.line,
                         column: this.column,
                         name: this.name });
          }
        }
      }
    };

    /**
     * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
     * each of `this.children`.
     *
     * @param aSep The separator.
     */
    SourceNode.prototype.join = function SourceNode_join(aSep) {
      var newChildren;
      var i;
      var len = this.children.length;
      if (len > 0) {
        newChildren = [];
        for (i = 0; i < len-1; i++) {
          newChildren.push(this.children[i]);
          newChildren.push(aSep);
        }
        newChildren.push(this.children[i]);
        this.children = newChildren;
      }
      return this;
    };

    /**
     * Call String.prototype.replace on the very right-most source snippet. Useful
     * for trimming whitespace from the end of a source node, etc.
     *
     * @param aPattern The pattern to replace.
     * @param aReplacement The thing to replace the pattern with.
     */
    SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
      var lastChild = this.children[this.children.length - 1];
      if (lastChild[isSourceNode]) {
        lastChild.replaceRight(aPattern, aReplacement);
      }
      else if (typeof lastChild === 'string') {
        this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
      }
      else {
        this.children.push(''.replace(aPattern, aReplacement));
      }
      return this;
    };

    /**
     * Set the source content for a source file. This will be added to the SourceMapGenerator
     * in the sourcesContent field.
     *
     * @param aSourceFile The filename of the source file
     * @param aSourceContent The content of the source file
     */
    SourceNode.prototype.setSourceContent =
      function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
        this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
      };

    /**
     * Walk over the tree of SourceNodes. The walking function is called for each
     * source file content and is passed the filename and source content.
     *
     * @param aFn The traversal function.
     */
    SourceNode.prototype.walkSourceContents =
      function SourceNode_walkSourceContents(aFn) {
        for (var i = 0, len = this.children.length; i < len; i++) {
          if (this.children[i][isSourceNode]) {
            this.children[i].walkSourceContents(aFn);
          }
        }

        var sources = Object.keys(this.sourceContents);
        for (var i = 0, len = sources.length; i < len; i++) {
          aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
        }
      };

    /**
     * Return the string representation of this source node. Walks over the tree
     * and concatenates all the various snippets together to one string.
     */
    SourceNode.prototype.toString = function SourceNode_toString() {
      var str = "";
      this.walk(function (chunk) {
        str += chunk;
      });
      return str;
    };

    /**
     * Returns the string representation of this source node along with a source
     * map.
     */
    SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
      var generated = {
        code: "",
        line: 1,
        column: 0
      };
      var map = new SourceMapGenerator$3(aArgs);
      var sourceMappingActive = false;
      var lastOriginalSource = null;
      var lastOriginalLine = null;
      var lastOriginalColumn = null;
      var lastOriginalName = null;
      this.walk(function (chunk, original) {
        generated.code += chunk;
        if (original.source !== null
            && original.line !== null
            && original.column !== null) {
          if(lastOriginalSource !== original.source
             || lastOriginalLine !== original.line
             || lastOriginalColumn !== original.column
             || lastOriginalName !== original.name) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
          lastOriginalSource = original.source;
          lastOriginalLine = original.line;
          lastOriginalColumn = original.column;
          lastOriginalName = original.name;
          sourceMappingActive = true;
        } else if (sourceMappingActive) {
          map.addMapping({
            generated: {
              line: generated.line,
              column: generated.column
            }
          });
          lastOriginalSource = null;
          sourceMappingActive = false;
        }
        for (var idx = 0, length = chunk.length; idx < length; idx++) {
          if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
            generated.line++;
            generated.column = 0;
            // Mappings end at eol
            if (idx + 1 === length) {
              lastOriginalSource = null;
              sourceMappingActive = false;
            } else if (sourceMappingActive) {
              map.addMapping({
                source: original.source,
                original: {
                  line: original.line,
                  column: original.column
                },
                generated: {
                  line: generated.line,
                  column: generated.column
                },
                name: original.name
              });
            }
          } else {
            generated.column++;
          }
        }
      });
      this.walkSourceContents(function (sourceFile, sourceContent) {
        map.setSourceContent(sourceFile, sourceContent);
      });

      return { code: generated.code, map: map };
    };

    sourceNode.SourceNode = SourceNode;

    /*
     * Copyright 2009-2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE.txt or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    sourceMap.SourceMapGenerator = sourceMapGenerator.SourceMapGenerator;
    sourceMap.SourceMapConsumer = sourceMapConsumer.SourceMapConsumer;
    sourceMap.SourceNode = sourceNode.SourceNode;

    let urlAlphabet =
      'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
    let customAlphabet = (alphabet, defaultSize = 21) => {
      return (size = defaultSize) => {
        let id = '';
        let i = size;
        while (i--) {
          id += alphabet[(Math.random() * alphabet.length) | 0];
        }
        return id
      }
    };
    let nanoid$1 = (size = 21) => {
      let id = '';
      let i = size;
      while (i--) {
        id += urlAlphabet[(Math.random() * 64) | 0];
      }
      return id
    };
    var nonSecure = { nanoid: nanoid$1, customAlphabet };

    let { SourceMapConsumer: SourceMapConsumer$2, SourceMapGenerator: SourceMapGenerator$2 } = sourceMap;
    let { existsSync, readFileSync } = require$$1__default["default"];
    let { dirname: dirname$1, join } = require$$2__default["default"];

    function fromBase64(str) {
      if (Buffer) {
        return Buffer.from(str, 'base64').toString()
      } else {
        /* c8 ignore next 2 */
        return window.atob(str)
      }
    }

    class PreviousMap$2 {
      constructor(css, opts) {
        if (opts.map === false) return
        this.loadAnnotation(css);
        this.inline = this.startWith(this.annotation, 'data:');

        let prev = opts.map ? opts.map.prev : undefined;
        let text = this.loadMap(opts.from, prev);
        if (!this.mapFile && opts.from) {
          this.mapFile = opts.from;
        }
        if (this.mapFile) this.root = dirname$1(this.mapFile);
        if (text) this.text = text;
      }

      consumer() {
        if (!this.consumerCache) {
          this.consumerCache = new SourceMapConsumer$2(this.text);
        }
        return this.consumerCache
      }

      decodeInline(text) {
        let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
        let baseUri = /^data:application\/json;base64,/;
        let charsetUri = /^data:application\/json;charset=utf-?8,/;
        let uri = /^data:application\/json,/;

        if (charsetUri.test(text) || uri.test(text)) {
          return decodeURIComponent(text.substr(RegExp.lastMatch.length))
        }

        if (baseCharsetUri.test(text) || baseUri.test(text)) {
          return fromBase64(text.substr(RegExp.lastMatch.length))
        }

        let encoding = text.match(/data:application\/json;([^,]+),/)[1];
        throw new Error('Unsupported source map encoding ' + encoding)
      }

      getAnnotationURL(sourceMapString) {
        return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, '').trim()
      }

      isMap(map) {
        if (typeof map !== 'object') return false
        return (
          typeof map.mappings === 'string' ||
          typeof map._mappings === 'string' ||
          Array.isArray(map.sections)
        )
      }

      loadAnnotation(css) {
        let comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
        if (!comments) return

        // sourceMappingURLs from comments, strings, etc.
        let start = css.lastIndexOf(comments.pop());
        let end = css.indexOf('*/', start);

        if (start > -1 && end > -1) {
          // Locate the last sourceMappingURL to avoid pickin
          this.annotation = this.getAnnotationURL(css.substring(start, end));
        }
      }

      loadFile(path) {
        this.root = dirname$1(path);
        if (existsSync(path)) {
          this.mapFile = path;
          return readFileSync(path, 'utf-8').toString().trim()
        }
      }

      loadMap(file, prev) {
        if (prev === false) return false

        if (prev) {
          if (typeof prev === 'string') {
            return prev
          } else if (typeof prev === 'function') {
            let prevPath = prev(file);
            if (prevPath) {
              let map = this.loadFile(prevPath);
              if (!map) {
                throw new Error(
                  'Unable to load previous source map: ' + prevPath.toString()
                )
              }
              return map
            }
          } else if (prev instanceof SourceMapConsumer$2) {
            return SourceMapGenerator$2.fromSourceMap(prev).toString()
          } else if (prev instanceof SourceMapGenerator$2) {
            return prev.toString()
          } else if (this.isMap(prev)) {
            return JSON.stringify(prev)
          } else {
            throw new Error(
              'Unsupported previous source map format: ' + prev.toString()
            )
          }
        } else if (this.inline) {
          return this.decodeInline(this.annotation)
        } else if (this.annotation) {
          let map = this.annotation;
          if (file) map = join(dirname$1(file), map);
          return this.loadFile(map)
        }
      }

      startWith(string, start) {
        if (!string) return false
        return string.substr(0, start.length) === start
      }

      withContent() {
        return !!(
          this.consumer().sourcesContent &&
          this.consumer().sourcesContent.length > 0
        )
      }
    }

    var previousMap = PreviousMap$2;
    PreviousMap$2.default = PreviousMap$2;

    let { SourceMapConsumer: SourceMapConsumer$1, SourceMapGenerator: SourceMapGenerator$1 } = sourceMap;
    let { fileURLToPath, pathToFileURL: pathToFileURL$1 } = require$$1__default$1["default"];
    let { isAbsolute, resolve: resolve$1 } = require$$2__default["default"];
    let { nanoid } = nonSecure;

    let terminalHighlight = terminalHighlight_1;
    let CssSyntaxError$1 = cssSyntaxError;
    let PreviousMap$1 = previousMap;

    let fromOffsetCache = Symbol('fromOffsetCache');

    let sourceMapAvailable$1 = Boolean(SourceMapConsumer$1 && SourceMapGenerator$1);
    let pathAvailable$1 = Boolean(resolve$1 && isAbsolute);

    class Input$4 {
      constructor(css, opts = {}) {
        if (
          css === null ||
          typeof css === 'undefined' ||
          (typeof css === 'object' && !css.toString)
        ) {
          throw new Error(`PostCSS received ${css} instead of CSS string`)
        }

        this.css = css.toString();

        if (this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE') {
          this.hasBOM = true;
          this.css = this.css.slice(1);
        } else {
          this.hasBOM = false;
        }

        if (opts.from) {
          if (
            !pathAvailable$1 ||
            /^\w+:\/\//.test(opts.from) ||
            isAbsolute(opts.from)
          ) {
            this.file = opts.from;
          } else {
            this.file = resolve$1(opts.from);
          }
        }

        if (pathAvailable$1 && sourceMapAvailable$1) {
          let map = new PreviousMap$1(this.css, opts);
          if (map.text) {
            this.map = map;
            let file = map.consumer().file;
            if (!this.file && file) this.file = this.mapResolve(file);
          }
        }

        if (!this.file) {
          this.id = '<input css ' + nanoid(6) + '>';
        }
        if (this.map) this.map.file = this.from;
      }

      error(message, line, column, opts = {}) {
        let result, endLine, endColumn;

        if (line && typeof line === 'object') {
          let start = line;
          let end = column;
          if (typeof start.offset === 'number') {
            let pos = this.fromOffset(start.offset);
            line = pos.line;
            column = pos.col;
          } else {
            line = start.line;
            column = start.column;
          }
          if (typeof end.offset === 'number') {
            let pos = this.fromOffset(end.offset);
            endLine = pos.line;
            endColumn = pos.col;
          } else {
            endLine = end.line;
            endColumn = end.column;
          }
        } else if (!column) {
          let pos = this.fromOffset(line);
          line = pos.line;
          column = pos.col;
        }

        let origin = this.origin(line, column, endLine, endColumn);
        if (origin) {
          result = new CssSyntaxError$1(
            message,
            origin.endLine === undefined
              ? origin.line
              : { column: origin.column, line: origin.line },
            origin.endLine === undefined
              ? origin.column
              : { column: origin.endColumn, line: origin.endLine },
            origin.source,
            origin.file,
            opts.plugin
          );
        } else {
          result = new CssSyntaxError$1(
            message,
            endLine === undefined ? line : { column, line },
            endLine === undefined ? column : { column: endColumn, line: endLine },
            this.css,
            this.file,
            opts.plugin
          );
        }

        result.input = { column, endColumn, endLine, line, source: this.css };
        if (this.file) {
          if (pathToFileURL$1) {
            result.input.url = pathToFileURL$1(this.file).toString();
          }
          result.input.file = this.file;
        }

        return result
      }

      fromOffset(offset) {
        let lastLine, lineToIndex;
        if (!this[fromOffsetCache]) {
          let lines = this.css.split('\n');
          lineToIndex = new Array(lines.length);
          let prevIndex = 0;

          for (let i = 0, l = lines.length; i < l; i++) {
            lineToIndex[i] = prevIndex;
            prevIndex += lines[i].length + 1;
          }

          this[fromOffsetCache] = lineToIndex;
        } else {
          lineToIndex = this[fromOffsetCache];
        }
        lastLine = lineToIndex[lineToIndex.length - 1];

        let min = 0;
        if (offset >= lastLine) {
          min = lineToIndex.length - 1;
        } else {
          let max = lineToIndex.length - 2;
          let mid;
          while (min < max) {
            mid = min + ((max - min) >> 1);
            if (offset < lineToIndex[mid]) {
              max = mid - 1;
            } else if (offset >= lineToIndex[mid + 1]) {
              min = mid + 1;
            } else {
              min = mid;
              break
            }
          }
        }
        return {
          col: offset - lineToIndex[min] + 1,
          line: min + 1
        }
      }

      mapResolve(file) {
        if (/^\w+:\/\//.test(file)) {
          return file
        }
        return resolve$1(this.map.consumer().sourceRoot || this.map.root || '.', file)
      }

      origin(line, column, endLine, endColumn) {
        if (!this.map) return false
        let consumer = this.map.consumer();

        let from = consumer.originalPositionFor({ column, line });
        if (!from.source) return false

        let to;
        if (typeof endLine === 'number') {
          to = consumer.originalPositionFor({ column: endColumn, line: endLine });
        }

        let fromUrl;

        if (isAbsolute(from.source)) {
          fromUrl = pathToFileURL$1(from.source);
        } else {
          fromUrl = new URL(
            from.source,
            this.map.consumer().sourceRoot || pathToFileURL$1(this.map.mapFile)
          );
        }

        let result = {
          column: from.column,
          endColumn: to && to.column,
          endLine: to && to.line,
          line: from.line,
          url: fromUrl.toString()
        };

        if (fromUrl.protocol === 'file:') {
          if (fileURLToPath) {
            result.file = fileURLToPath(fromUrl);
          } else {
            /* c8 ignore next 2 */
            throw new Error(`file: protocol is not available in this PostCSS build`)
          }
        }

        let source = consumer.sourceContentFor(from.source);
        if (source) result.source = source;

        return result
      }

      toJSON() {
        let json = {};
        for (let name of ['hasBOM', 'css', 'file', 'id']) {
          if (this[name] != null) {
            json[name] = this[name];
          }
        }
        if (this.map) {
          json.map = { ...this.map };
          if (json.map.consumerCache) {
            json.map.consumerCache = undefined;
          }
        }
        return json
      }

      get from() {
        return this.file || this.id
      }
    }

    var input = Input$4;
    Input$4.default = Input$4;

    if (terminalHighlight && terminalHighlight.registerInput) {
      terminalHighlight.registerInput(Input$4);
    }

    let { SourceMapConsumer, SourceMapGenerator } = sourceMap;
    let { dirname, relative, resolve, sep } = require$$2__default["default"];
    let { pathToFileURL } = require$$1__default$1["default"];

    let Input$3 = input;

    let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
    let pathAvailable = Boolean(dirname && resolve && relative && sep);

    class MapGenerator$2 {
      constructor(stringify, root, opts, cssString) {
        this.stringify = stringify;
        this.mapOpts = opts.map || {};
        this.root = root;
        this.opts = opts;
        this.css = cssString;
        this.originalCSS = cssString;
        this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;

        this.memoizedFileURLs = new Map();
        this.memoizedPaths = new Map();
        this.memoizedURLs = new Map();
      }

      addAnnotation() {
        let content;

        if (this.isInline()) {
          content =
            'data:application/json;base64,' + this.toBase64(this.map.toString());
        } else if (typeof this.mapOpts.annotation === 'string') {
          content = this.mapOpts.annotation;
        } else if (typeof this.mapOpts.annotation === 'function') {
          content = this.mapOpts.annotation(this.opts.to, this.root);
        } else {
          content = this.outputFile() + '.map';
        }
        let eol = '\n';
        if (this.css.includes('\r\n')) eol = '\r\n';

        this.css += eol + '/*# sourceMappingURL=' + content + ' */';
      }

      applyPrevMaps() {
        for (let prev of this.previous()) {
          let from = this.toUrl(this.path(prev.file));
          let root = prev.root || dirname(prev.file);
          let map;

          if (this.mapOpts.sourcesContent === false) {
            map = new SourceMapConsumer(prev.text);
            if (map.sourcesContent) {
              map.sourcesContent = null;
            }
          } else {
            map = prev.consumer();
          }

          this.map.applySourceMap(map, from, this.toUrl(this.path(root)));
        }
      }

      clearAnnotation() {
        if (this.mapOpts.annotation === false) return

        if (this.root) {
          let node;
          for (let i = this.root.nodes.length - 1; i >= 0; i--) {
            node = this.root.nodes[i];
            if (node.type !== 'comment') continue
            if (node.text.indexOf('# sourceMappingURL=') === 0) {
              this.root.removeChild(i);
            }
          }
        } else if (this.css) {
          this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, '');
        }
      }

      generate() {
        this.clearAnnotation();
        if (pathAvailable && sourceMapAvailable && this.isMap()) {
          return this.generateMap()
        } else {
          let result = '';
          this.stringify(this.root, i => {
            result += i;
          });
          return [result]
        }
      }

      generateMap() {
        if (this.root) {
          this.generateString();
        } else if (this.previous().length === 1) {
          let prev = this.previous()[0].consumer();
          prev.file = this.outputFile();
          this.map = SourceMapGenerator.fromSourceMap(prev);
        } else {
          this.map = new SourceMapGenerator({ file: this.outputFile() });
          this.map.addMapping({
            generated: { column: 0, line: 1 },
            original: { column: 0, line: 1 },
            source: this.opts.from
              ? this.toUrl(this.path(this.opts.from))
              : '<no source>'
          });
        }

        if (this.isSourcesContent()) this.setSourcesContent();
        if (this.root && this.previous().length > 0) this.applyPrevMaps();
        if (this.isAnnotation()) this.addAnnotation();

        if (this.isInline()) {
          return [this.css]
        } else {
          return [this.css, this.map]
        }
      }

      generateString() {
        this.css = '';
        this.map = new SourceMapGenerator({ file: this.outputFile() });

        let line = 1;
        let column = 1;

        let noSource = '<no source>';
        let mapping = {
          generated: { column: 0, line: 0 },
          original: { column: 0, line: 0 },
          source: ''
        };

        let lines, last;
        this.stringify(this.root, (str, node, type) => {
          this.css += str;

          if (node && type !== 'end') {
            mapping.generated.line = line;
            mapping.generated.column = column - 1;
            if (node.source && node.source.start) {
              mapping.source = this.sourcePath(node);
              mapping.original.line = node.source.start.line;
              mapping.original.column = node.source.start.column - 1;
              this.map.addMapping(mapping);
            } else {
              mapping.source = noSource;
              mapping.original.line = 1;
              mapping.original.column = 0;
              this.map.addMapping(mapping);
            }
          }

          lines = str.match(/\n/g);
          if (lines) {
            line += lines.length;
            last = str.lastIndexOf('\n');
            column = str.length - last;
          } else {
            column += str.length;
          }

          if (node && type !== 'start') {
            let p = node.parent || { raws: {} };
            let childless =
              node.type === 'decl' || (node.type === 'atrule' && !node.nodes);
            if (!childless || node !== p.last || p.raws.semicolon) {
              if (node.source && node.source.end) {
                mapping.source = this.sourcePath(node);
                mapping.original.line = node.source.end.line;
                mapping.original.column = node.source.end.column - 1;
                mapping.generated.line = line;
                mapping.generated.column = column - 2;
                this.map.addMapping(mapping);
              } else {
                mapping.source = noSource;
                mapping.original.line = 1;
                mapping.original.column = 0;
                mapping.generated.line = line;
                mapping.generated.column = column - 1;
                this.map.addMapping(mapping);
              }
            }
          }
        });
      }

      isAnnotation() {
        if (this.isInline()) {
          return true
        }
        if (typeof this.mapOpts.annotation !== 'undefined') {
          return this.mapOpts.annotation
        }
        if (this.previous().length) {
          return this.previous().some(i => i.annotation)
        }
        return true
      }

      isInline() {
        if (typeof this.mapOpts.inline !== 'undefined') {
          return this.mapOpts.inline
        }

        let annotation = this.mapOpts.annotation;
        if (typeof annotation !== 'undefined' && annotation !== true) {
          return false
        }

        if (this.previous().length) {
          return this.previous().some(i => i.inline)
        }
        return true
      }

      isMap() {
        if (typeof this.opts.map !== 'undefined') {
          return !!this.opts.map
        }
        return this.previous().length > 0
      }

      isSourcesContent() {
        if (typeof this.mapOpts.sourcesContent !== 'undefined') {
          return this.mapOpts.sourcesContent
        }
        if (this.previous().length) {
          return this.previous().some(i => i.withContent())
        }
        return true
      }

      outputFile() {
        if (this.opts.to) {
          return this.path(this.opts.to)
        } else if (this.opts.from) {
          return this.path(this.opts.from)
        } else {
          return 'to.css'
        }
      }

      path(file) {
        if (this.mapOpts.absolute) return file
        if (file.charCodeAt(0) === 60 /* `<` */) return file
        if (/^\w+:\/\//.test(file)) return file
        let cached = this.memoizedPaths.get(file);
        if (cached) return cached

        let from = this.opts.to ? dirname(this.opts.to) : '.';

        if (typeof this.mapOpts.annotation === 'string') {
          from = dirname(resolve(from, this.mapOpts.annotation));
        }

        let path = relative(from, file);
        this.memoizedPaths.set(file, path);

        return path
      }

      previous() {
        if (!this.previousMaps) {
          this.previousMaps = [];
          if (this.root) {
            this.root.walk(node => {
              if (node.source && node.source.input.map) {
                let map = node.source.input.map;
                if (!this.previousMaps.includes(map)) {
                  this.previousMaps.push(map);
                }
              }
            });
          } else {
            let input = new Input$3(this.originalCSS, this.opts);
            if (input.map) this.previousMaps.push(input.map);
          }
        }

        return this.previousMaps
      }

      setSourcesContent() {
        let already = {};
        if (this.root) {
          this.root.walk(node => {
            if (node.source) {
              let from = node.source.input.from;
              if (from && !already[from]) {
                already[from] = true;
                let fromUrl = this.usesFileUrls
                  ? this.toFileUrl(from)
                  : this.toUrl(this.path(from));
                this.map.setSourceContent(fromUrl, node.source.input.css);
              }
            }
          });
        } else if (this.css) {
          let from = this.opts.from
            ? this.toUrl(this.path(this.opts.from))
            : '<no source>';
          this.map.setSourceContent(from, this.css);
        }
      }

      sourcePath(node) {
        if (this.mapOpts.from) {
          return this.toUrl(this.mapOpts.from)
        } else if (this.usesFileUrls) {
          return this.toFileUrl(node.source.input.from)
        } else {
          return this.toUrl(this.path(node.source.input.from))
        }
      }

      toBase64(str) {
        if (Buffer) {
          return Buffer.from(str).toString('base64')
        } else {
          return window.btoa(unescape(encodeURIComponent(str)))
        }
      }

      toFileUrl(path) {
        let cached = this.memoizedFileURLs.get(path);
        if (cached) return cached

        if (pathToFileURL) {
          let fileURL = pathToFileURL(path).toString();
          this.memoizedFileURLs.set(path, fileURL);

          return fileURL
        } else {
          throw new Error(
            '`map.absolute` option is not available in this PostCSS build'
          )
        }
      }

      toUrl(path) {
        let cached = this.memoizedURLs.get(path);
        if (cached) return cached

        if (sep === '\\') {
          path = path.replace(/\\/g, '/');
        }

        let url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
        this.memoizedURLs.set(path, url);

        return url
      }
    }

    var mapGenerator = MapGenerator$2;

    let Node$2 = node_1;

    class Comment$4 extends Node$2 {
      constructor(defaults) {
        super(defaults);
        this.type = 'comment';
      }
    }

    var comment = Comment$4;
    Comment$4.default = Comment$4;

    let { isClean: isClean$1, my: my$1 } = symbols;
    let Declaration$3 = declaration;
    let Comment$3 = comment;
    let Node$1 = node_1;

    let parse$4, Rule$4, AtRule$4, Root$6;

    function cleanSource(nodes) {
      return nodes.map(i => {
        if (i.nodes) i.nodes = cleanSource(i.nodes);
        delete i.source;
        return i
      })
    }

    function markDirtyUp(node) {
      node[isClean$1] = false;
      if (node.proxyOf.nodes) {
        for (let i of node.proxyOf.nodes) {
          markDirtyUp(i);
        }
      }
    }

    class Container$7 extends Node$1 {
      append(...children) {
        for (let child of children) {
          let nodes = this.normalize(child, this.last);
          for (let node of nodes) this.proxyOf.nodes.push(node);
        }

        this.markDirty();

        return this
      }

      cleanRaws(keepBetween) {
        super.cleanRaws(keepBetween);
        if (this.nodes) {
          for (let node of this.nodes) node.cleanRaws(keepBetween);
        }
      }

      each(callback) {
        if (!this.proxyOf.nodes) return undefined
        let iterator = this.getIterator();

        let index, result;
        while (this.indexes[iterator] < this.proxyOf.nodes.length) {
          index = this.indexes[iterator];
          result = callback(this.proxyOf.nodes[index], index);
          if (result === false) break

          this.indexes[iterator] += 1;
        }

        delete this.indexes[iterator];
        return result
      }

      every(condition) {
        return this.nodes.every(condition)
      }

      getIterator() {
        if (!this.lastEach) this.lastEach = 0;
        if (!this.indexes) this.indexes = {};

        this.lastEach += 1;
        let iterator = this.lastEach;
        this.indexes[iterator] = 0;

        return iterator
      }

      getProxyProcessor() {
        return {
          get(node, prop) {
            if (prop === 'proxyOf') {
              return node
            } else if (!node[prop]) {
              return node[prop]
            } else if (
              prop === 'each' ||
              (typeof prop === 'string' && prop.startsWith('walk'))
            ) {
              return (...args) => {
                return node[prop](
                  ...args.map(i => {
                    if (typeof i === 'function') {
                      return (child, index) => i(child.toProxy(), index)
                    } else {
                      return i
                    }
                  })
                )
              }
            } else if (prop === 'every' || prop === 'some') {
              return cb => {
                return node[prop]((child, ...other) =>
                  cb(child.toProxy(), ...other)
                )
              }
            } else if (prop === 'root') {
              return () => node.root().toProxy()
            } else if (prop === 'nodes') {
              return node.nodes.map(i => i.toProxy())
            } else if (prop === 'first' || prop === 'last') {
              return node[prop].toProxy()
            } else {
              return node[prop]
            }
          },

          set(node, prop, value) {
            if (node[prop] === value) return true
            node[prop] = value;
            if (prop === 'name' || prop === 'params' || prop === 'selector') {
              node.markDirty();
            }
            return true
          }
        }
      }

      index(child) {
        if (typeof child === 'number') return child
        if (child.proxyOf) child = child.proxyOf;
        return this.proxyOf.nodes.indexOf(child)
      }

      insertAfter(exist, add) {
        let existIndex = this.index(exist);
        let nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
        existIndex = this.index(exist);
        for (let node of nodes) this.proxyOf.nodes.splice(existIndex + 1, 0, node);

        let index;
        for (let id in this.indexes) {
          index = this.indexes[id];
          if (existIndex < index) {
            this.indexes[id] = index + nodes.length;
          }
        }

        this.markDirty();

        return this
      }

      insertBefore(exist, add) {
        let existIndex = this.index(exist);
        let type = existIndex === 0 ? 'prepend' : false;
        let nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
        existIndex = this.index(exist);
        for (let node of nodes) this.proxyOf.nodes.splice(existIndex, 0, node);

        let index;
        for (let id in this.indexes) {
          index = this.indexes[id];
          if (existIndex <= index) {
            this.indexes[id] = index + nodes.length;
          }
        }

        this.markDirty();

        return this
      }

      normalize(nodes, sample) {
        if (typeof nodes === 'string') {
          nodes = cleanSource(parse$4(nodes).nodes);
        } else if (typeof nodes === 'undefined') {
          nodes = [];
        } else if (Array.isArray(nodes)) {
          nodes = nodes.slice(0);
          for (let i of nodes) {
            if (i.parent) i.parent.removeChild(i, 'ignore');
          }
        } else if (nodes.type === 'root' && this.type !== 'document') {
          nodes = nodes.nodes.slice(0);
          for (let i of nodes) {
            if (i.parent) i.parent.removeChild(i, 'ignore');
          }
        } else if (nodes.type) {
          nodes = [nodes];
        } else if (nodes.prop) {
          if (typeof nodes.value === 'undefined') {
            throw new Error('Value field is missed in node creation')
          } else if (typeof nodes.value !== 'string') {
            nodes.value = String(nodes.value);
          }
          nodes = [new Declaration$3(nodes)];
        } else if (nodes.selector) {
          nodes = [new Rule$4(nodes)];
        } else if (nodes.name) {
          nodes = [new AtRule$4(nodes)];
        } else if (nodes.text) {
          nodes = [new Comment$3(nodes)];
        } else {
          throw new Error('Unknown node type in node creation')
        }

        let processed = nodes.map(i => {
          /* c8 ignore next */
          if (!i[my$1]) Container$7.rebuild(i);
          i = i.proxyOf;
          if (i.parent) i.parent.removeChild(i);
          if (i[isClean$1]) markDirtyUp(i);
          if (typeof i.raws.before === 'undefined') {
            if (sample && typeof sample.raws.before !== 'undefined') {
              i.raws.before = sample.raws.before.replace(/\S/g, '');
            }
          }
          i.parent = this.proxyOf;
          return i
        });

        return processed
      }

      prepend(...children) {
        children = children.reverse();
        for (let child of children) {
          let nodes = this.normalize(child, this.first, 'prepend').reverse();
          for (let node of nodes) this.proxyOf.nodes.unshift(node);
          for (let id in this.indexes) {
            this.indexes[id] = this.indexes[id] + nodes.length;
          }
        }

        this.markDirty();

        return this
      }

      push(child) {
        child.parent = this;
        this.proxyOf.nodes.push(child);
        return this
      }

      removeAll() {
        for (let node of this.proxyOf.nodes) node.parent = undefined;
        this.proxyOf.nodes = [];

        this.markDirty();

        return this
      }

      removeChild(child) {
        child = this.index(child);
        this.proxyOf.nodes[child].parent = undefined;
        this.proxyOf.nodes.splice(child, 1);

        let index;
        for (let id in this.indexes) {
          index = this.indexes[id];
          if (index >= child) {
            this.indexes[id] = index - 1;
          }
        }

        this.markDirty();

        return this
      }

      replaceValues(pattern, opts, callback) {
        if (!callback) {
          callback = opts;
          opts = {};
        }

        this.walkDecls(decl => {
          if (opts.props && !opts.props.includes(decl.prop)) return
          if (opts.fast && !decl.value.includes(opts.fast)) return

          decl.value = decl.value.replace(pattern, callback);
        });

        this.markDirty();

        return this
      }

      some(condition) {
        return this.nodes.some(condition)
      }

      walk(callback) {
        return this.each((child, i) => {
          let result;
          try {
            result = callback(child, i);
          } catch (e) {
            throw child.addToError(e)
          }
          if (result !== false && child.walk) {
            result = child.walk(callback);
          }

          return result
        })
      }

      walkAtRules(name, callback) {
        if (!callback) {
          callback = name;
          return this.walk((child, i) => {
            if (child.type === 'atrule') {
              return callback(child, i)
            }
          })
        }
        if (name instanceof RegExp) {
          return this.walk((child, i) => {
            if (child.type === 'atrule' && name.test(child.name)) {
              return callback(child, i)
            }
          })
        }
        return this.walk((child, i) => {
          if (child.type === 'atrule' && child.name === name) {
            return callback(child, i)
          }
        })
      }

      walkComments(callback) {
        return this.walk((child, i) => {
          if (child.type === 'comment') {
            return callback(child, i)
          }
        })
      }

      walkDecls(prop, callback) {
        if (!callback) {
          callback = prop;
          return this.walk((child, i) => {
            if (child.type === 'decl') {
              return callback(child, i)
            }
          })
        }
        if (prop instanceof RegExp) {
          return this.walk((child, i) => {
            if (child.type === 'decl' && prop.test(child.prop)) {
              return callback(child, i)
            }
          })
        }
        return this.walk((child, i) => {
          if (child.type === 'decl' && child.prop === prop) {
            return callback(child, i)
          }
        })
      }

      walkRules(selector, callback) {
        if (!callback) {
          callback = selector;

          return this.walk((child, i) => {
            if (child.type === 'rule') {
              return callback(child, i)
            }
          })
        }
        if (selector instanceof RegExp) {
          return this.walk((child, i) => {
            if (child.type === 'rule' && selector.test(child.selector)) {
              return callback(child, i)
            }
          })
        }
        return this.walk((child, i) => {
          if (child.type === 'rule' && child.selector === selector) {
            return callback(child, i)
          }
        })
      }

      get first() {
        if (!this.proxyOf.nodes) return undefined
        return this.proxyOf.nodes[0]
      }

      get last() {
        if (!this.proxyOf.nodes) return undefined
        return this.proxyOf.nodes[this.proxyOf.nodes.length - 1]
      }
    }

    Container$7.registerParse = dependant => {
      parse$4 = dependant;
    };

    Container$7.registerRule = dependant => {
      Rule$4 = dependant;
    };

    Container$7.registerAtRule = dependant => {
      AtRule$4 = dependant;
    };

    Container$7.registerRoot = dependant => {
      Root$6 = dependant;
    };

    var container = Container$7;
    Container$7.default = Container$7;

    /* c8 ignore start */
    Container$7.rebuild = node => {
      if (node.type === 'atrule') {
        Object.setPrototypeOf(node, AtRule$4.prototype);
      } else if (node.type === 'rule') {
        Object.setPrototypeOf(node, Rule$4.prototype);
      } else if (node.type === 'decl') {
        Object.setPrototypeOf(node, Declaration$3.prototype);
      } else if (node.type === 'comment') {
        Object.setPrototypeOf(node, Comment$3.prototype);
      } else if (node.type === 'root') {
        Object.setPrototypeOf(node, Root$6.prototype);
      }

      node[my$1] = true;

      if (node.nodes) {
        node.nodes.forEach(child => {
          Container$7.rebuild(child);
        });
      }
    };

    let Container$6 = container;

    let LazyResult$4, Processor$3;

    class Document$3 extends Container$6 {
      constructor(defaults) {
        // type needs to be passed to super, otherwise child roots won't be normalized correctly
        super({ type: 'document', ...defaults });

        if (!this.nodes) {
          this.nodes = [];
        }
      }

      toResult(opts = {}) {
        let lazy = new LazyResult$4(new Processor$3(), this, opts);

        return lazy.stringify()
      }
    }

    Document$3.registerLazyResult = dependant => {
      LazyResult$4 = dependant;
    };

    Document$3.registerProcessor = dependant => {
      Processor$3 = dependant;
    };

    var document$1 = Document$3;
    Document$3.default = Document$3;

    /* eslint-disable no-console */

    let printed = {};

    var warnOnce$2 = function warnOnce(message) {
      if (printed[message]) return
      printed[message] = true;

      if (typeof console !== 'undefined' && console.warn) {
        console.warn(message);
      }
    };

    class Warning$2 {
      constructor(text, opts = {}) {
        this.type = 'warning';
        this.text = text;

        if (opts.node && opts.node.source) {
          let range = opts.node.rangeBy(opts);
          this.line = range.start.line;
          this.column = range.start.column;
          this.endLine = range.end.line;
          this.endColumn = range.end.column;
        }

        for (let opt in opts) this[opt] = opts[opt];
      }

      toString() {
        if (this.node) {
          return this.node.error(this.text, {
            index: this.index,
            plugin: this.plugin,
            word: this.word
          }).message
        }

        if (this.plugin) {
          return this.plugin + ': ' + this.text
        }

        return this.text
      }
    }

    var warning = Warning$2;
    Warning$2.default = Warning$2;

    let Warning$1 = warning;

    class Result$3 {
      constructor(processor, root, opts) {
        this.processor = processor;
        this.messages = [];
        this.root = root;
        this.opts = opts;
        this.css = undefined;
        this.map = undefined;
      }

      toString() {
        return this.css
      }

      warn(text, opts = {}) {
        if (!opts.plugin) {
          if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
            opts.plugin = this.lastPlugin.postcssPlugin;
          }
        }

        let warning = new Warning$1(text, opts);
        this.messages.push(warning);

        return warning
      }

      warnings() {
        return this.messages.filter(i => i.type === 'warning')
      }

      get content() {
        return this.css
      }
    }

    var result = Result$3;
    Result$3.default = Result$3;

    let Container$5 = container;

    class AtRule$3 extends Container$5 {
      constructor(defaults) {
        super(defaults);
        this.type = 'atrule';
      }

      append(...children) {
        if (!this.proxyOf.nodes) this.nodes = [];
        return super.append(...children)
      }

      prepend(...children) {
        if (!this.proxyOf.nodes) this.nodes = [];
        return super.prepend(...children)
      }
    }

    var atRule = AtRule$3;
    AtRule$3.default = AtRule$3;

    Container$5.registerAtRule(AtRule$3);

    let Container$4 = container;

    let LazyResult$3, Processor$2;

    class Root$5 extends Container$4 {
      constructor(defaults) {
        super(defaults);
        this.type = 'root';
        if (!this.nodes) this.nodes = [];
      }

      normalize(child, sample, type) {
        let nodes = super.normalize(child);

        if (sample) {
          if (type === 'prepend') {
            if (this.nodes.length > 1) {
              sample.raws.before = this.nodes[1].raws.before;
            } else {
              delete sample.raws.before;
            }
          } else if (this.first !== sample) {
            for (let node of nodes) {
              node.raws.before = sample.raws.before;
            }
          }
        }

        return nodes
      }

      removeChild(child, ignore) {
        let index = this.index(child);

        if (!ignore && index === 0 && this.nodes.length > 1) {
          this.nodes[1].raws.before = this.nodes[index].raws.before;
        }

        return super.removeChild(child)
      }

      toResult(opts = {}) {
        let lazy = new LazyResult$3(new Processor$2(), this, opts);
        return lazy.stringify()
      }
    }

    Root$5.registerLazyResult = dependant => {
      LazyResult$3 = dependant;
    };

    Root$5.registerProcessor = dependant => {
      Processor$2 = dependant;
    };

    var root = Root$5;
    Root$5.default = Root$5;

    Container$4.registerRoot(Root$5);

    let list$2 = {
      comma(string) {
        return list$2.split(string, [','], true)
      },

      space(string) {
        let spaces = [' ', '\n', '\t'];
        return list$2.split(string, spaces)
      },

      split(string, separators, last) {
        let array = [];
        let current = '';
        let split = false;

        let func = 0;
        let inQuote = false;
        let prevQuote = '';
        let escape = false;

        for (let letter of string) {
          if (escape) {
            escape = false;
          } else if (letter === '\\') {
            escape = true;
          } else if (inQuote) {
            if (letter === prevQuote) {
              inQuote = false;
            }
          } else if (letter === '"' || letter === "'") {
            inQuote = true;
            prevQuote = letter;
          } else if (letter === '(') {
            func += 1;
          } else if (letter === ')') {
            if (func > 0) func -= 1;
          } else if (func === 0) {
            if (separators.includes(letter)) split = true;
          }

          if (split) {
            if (current !== '') array.push(current.trim());
            current = '';
            split = false;
          } else {
            current += letter;
          }
        }

        if (last || current !== '') array.push(current.trim());
        return array
      }
    };

    var list_1 = list$2;
    list$2.default = list$2;

    let Container$3 = container;
    let list$1 = list_1;

    class Rule$3 extends Container$3 {
      constructor(defaults) {
        super(defaults);
        this.type = 'rule';
        if (!this.nodes) this.nodes = [];
      }

      get selectors() {
        return list$1.comma(this.selector)
      }

      set selectors(values) {
        let match = this.selector ? this.selector.match(/,\s*/) : null;
        let sep = match ? match[0] : ',' + this.raw('between', 'beforeOpen');
        this.selector = values.join(sep);
      }
    }

    var rule = Rule$3;
    Rule$3.default = Rule$3;

    Container$3.registerRule(Rule$3);

    let Declaration$2 = declaration;
    let tokenizer = tokenize;
    let Comment$2 = comment;
    let AtRule$2 = atRule;
    let Root$4 = root;
    let Rule$2 = rule;

    const SAFE_COMMENT_NEIGHBOR = {
      empty: true,
      space: true
    };

    function findLastWithPosition(tokens) {
      for (let i = tokens.length - 1; i >= 0; i--) {
        let token = tokens[i];
        let pos = token[3] || token[2];
        if (pos) return pos
      }
    }

    class Parser$1 {
      constructor(input) {
        this.input = input;

        this.root = new Root$4();
        this.current = this.root;
        this.spaces = '';
        this.semicolon = false;

        this.createTokenizer();
        this.root.source = { input, start: { column: 1, line: 1, offset: 0 } };
      }

      atrule(token) {
        let node = new AtRule$2();
        node.name = token[1].slice(1);
        if (node.name === '') {
          this.unnamedAtrule(node, token);
        }
        this.init(node, token[2]);

        let type;
        let prev;
        let shift;
        let last = false;
        let open = false;
        let params = [];
        let brackets = [];

        while (!this.tokenizer.endOfFile()) {
          token = this.tokenizer.nextToken();
          type = token[0];

          if (type === '(' || type === '[') {
            brackets.push(type === '(' ? ')' : ']');
          } else if (type === '{' && brackets.length > 0) {
            brackets.push('}');
          } else if (type === brackets[brackets.length - 1]) {
            brackets.pop();
          }

          if (brackets.length === 0) {
            if (type === ';') {
              node.source.end = this.getPosition(token[2]);
              node.source.end.offset++;
              this.semicolon = true;
              break
            } else if (type === '{') {
              open = true;
              break
            } else if (type === '}') {
              if (params.length > 0) {
                shift = params.length - 1;
                prev = params[shift];
                while (prev && prev[0] === 'space') {
                  prev = params[--shift];
                }
                if (prev) {
                  node.source.end = this.getPosition(prev[3] || prev[2]);
                  node.source.end.offset++;
                }
              }
              this.end(token);
              break
            } else {
              params.push(token);
            }
          } else {
            params.push(token);
          }

          if (this.tokenizer.endOfFile()) {
            last = true;
            break
          }
        }

        node.raws.between = this.spacesAndCommentsFromEnd(params);
        if (params.length) {
          node.raws.afterName = this.spacesAndCommentsFromStart(params);
          this.raw(node, 'params', params);
          if (last) {
            token = params[params.length - 1];
            node.source.end = this.getPosition(token[3] || token[2]);
            node.source.end.offset++;
            this.spaces = node.raws.between;
            node.raws.between = '';
          }
        } else {
          node.raws.afterName = '';
          node.params = '';
        }

        if (open) {
          node.nodes = [];
          this.current = node;
        }
      }

      checkMissedSemicolon(tokens) {
        let colon = this.colon(tokens);
        if (colon === false) return

        let founded = 0;
        let token;
        for (let j = colon - 1; j >= 0; j--) {
          token = tokens[j];
          if (token[0] !== 'space') {
            founded += 1;
            if (founded === 2) break
          }
        }
        // If the token is a word, e.g. `!important`, `red` or any other valid property's value.
        // Then we need to return the colon after that word token. [3] is the "end" colon of that word.
        // And because we need it after that one we do +1 to get the next one.
        throw this.input.error(
          'Missed semicolon',
          token[0] === 'word' ? token[3] + 1 : token[2]
        )
      }

      colon(tokens) {
        let brackets = 0;
        let token, type, prev;
        for (let [i, element] of tokens.entries()) {
          token = element;
          type = token[0];

          if (type === '(') {
            brackets += 1;
          }
          if (type === ')') {
            brackets -= 1;
          }
          if (brackets === 0 && type === ':') {
            if (!prev) {
              this.doubleColon(token);
            } else if (prev[0] === 'word' && prev[1] === 'progid') {
              continue
            } else {
              return i
            }
          }

          prev = token;
        }
        return false
      }

      comment(token) {
        let node = new Comment$2();
        this.init(node, token[2]);
        node.source.end = this.getPosition(token[3] || token[2]);
        node.source.end.offset++;

        let text = token[1].slice(2, -2);
        if (/^\s*$/.test(text)) {
          node.text = '';
          node.raws.left = text;
          node.raws.right = '';
        } else {
          let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
          node.text = match[2];
          node.raws.left = match[1];
          node.raws.right = match[3];
        }
      }

      createTokenizer() {
        this.tokenizer = tokenizer(this.input);
      }

      decl(tokens, customProperty) {
        let node = new Declaration$2();
        this.init(node, tokens[0][2]);

        let last = tokens[tokens.length - 1];
        if (last[0] === ';') {
          this.semicolon = true;
          tokens.pop();
        }

        node.source.end = this.getPosition(
          last[3] || last[2] || findLastWithPosition(tokens)
        );
        node.source.end.offset++;

        while (tokens[0][0] !== 'word') {
          if (tokens.length === 1) this.unknownWord(tokens);
          node.raws.before += tokens.shift()[1];
        }
        node.source.start = this.getPosition(tokens[0][2]);

        node.prop = '';
        while (tokens.length) {
          let type = tokens[0][0];
          if (type === ':' || type === 'space' || type === 'comment') {
            break
          }
          node.prop += tokens.shift()[1];
        }

        node.raws.between = '';

        let token;
        while (tokens.length) {
          token = tokens.shift();

          if (token[0] === ':') {
            node.raws.between += token[1];
            break
          } else {
            if (token[0] === 'word' && /\w/.test(token[1])) {
              this.unknownWord([token]);
            }
            node.raws.between += token[1];
          }
        }

        if (node.prop[0] === '_' || node.prop[0] === '*') {
          node.raws.before += node.prop[0];
          node.prop = node.prop.slice(1);
        }

        let firstSpaces = [];
        let next;
        while (tokens.length) {
          next = tokens[0][0];
          if (next !== 'space' && next !== 'comment') break
          firstSpaces.push(tokens.shift());
        }

        this.precheckMissedSemicolon(tokens);

        for (let i = tokens.length - 1; i >= 0; i--) {
          token = tokens[i];
          if (token[1].toLowerCase() === '!important') {
            node.important = true;
            let string = this.stringFrom(tokens, i);
            string = this.spacesFromEnd(tokens) + string;
            if (string !== ' !important') node.raws.important = string;
            break
          } else if (token[1].toLowerCase() === 'important') {
            let cache = tokens.slice(0);
            let str = '';
            for (let j = i; j > 0; j--) {
              let type = cache[j][0];
              if (str.trim().indexOf('!') === 0 && type !== 'space') {
                break
              }
              str = cache.pop()[1] + str;
            }
            if (str.trim().indexOf('!') === 0) {
              node.important = true;
              node.raws.important = str;
              tokens = cache;
            }
          }

          if (token[0] !== 'space' && token[0] !== 'comment') {
            break
          }
        }

        let hasWord = tokens.some(i => i[0] !== 'space' && i[0] !== 'comment');

        if (hasWord) {
          node.raws.between += firstSpaces.map(i => i[1]).join('');
          firstSpaces = [];
        }
        this.raw(node, 'value', firstSpaces.concat(tokens), customProperty);

        if (node.value.includes(':') && !customProperty) {
          this.checkMissedSemicolon(tokens);
        }
      }

      doubleColon(token) {
        throw this.input.error(
          'Double colon',
          { offset: token[2] },
          { offset: token[2] + token[1].length }
        )
      }

      emptyRule(token) {
        let node = new Rule$2();
        this.init(node, token[2]);
        node.selector = '';
        node.raws.between = '';
        this.current = node;
      }

      end(token) {
        if (this.current.nodes && this.current.nodes.length) {
          this.current.raws.semicolon = this.semicolon;
        }
        this.semicolon = false;

        this.current.raws.after = (this.current.raws.after || '') + this.spaces;
        this.spaces = '';

        if (this.current.parent) {
          this.current.source.end = this.getPosition(token[2]);
          this.current.source.end.offset++;
          this.current = this.current.parent;
        } else {
          this.unexpectedClose(token);
        }
      }

      endFile() {
        if (this.current.parent) this.unclosedBlock();
        if (this.current.nodes && this.current.nodes.length) {
          this.current.raws.semicolon = this.semicolon;
        }
        this.current.raws.after = (this.current.raws.after || '') + this.spaces;
        this.root.source.end = this.getPosition(this.tokenizer.position());
      }

      freeSemicolon(token) {
        this.spaces += token[1];
        if (this.current.nodes) {
          let prev = this.current.nodes[this.current.nodes.length - 1];
          if (prev && prev.type === 'rule' && !prev.raws.ownSemicolon) {
            prev.raws.ownSemicolon = this.spaces;
            this.spaces = '';
          }
        }
      }

      // Helpers

      getPosition(offset) {
        let pos = this.input.fromOffset(offset);
        return {
          column: pos.col,
          line: pos.line,
          offset
        }
      }

      init(node, offset) {
        this.current.push(node);
        node.source = {
          input: this.input,
          start: this.getPosition(offset)
        };
        node.raws.before = this.spaces;
        this.spaces = '';
        if (node.type !== 'comment') this.semicolon = false;
      }

      other(start) {
        let end = false;
        let type = null;
        let colon = false;
        let bracket = null;
        let brackets = [];
        let customProperty = start[1].startsWith('--');

        let tokens = [];
        let token = start;
        while (token) {
          type = token[0];
          tokens.push(token);

          if (type === '(' || type === '[') {
            if (!bracket) bracket = token;
            brackets.push(type === '(' ? ')' : ']');
          } else if (customProperty && colon && type === '{') {
            if (!bracket) bracket = token;
            brackets.push('}');
          } else if (brackets.length === 0) {
            if (type === ';') {
              if (colon) {
                this.decl(tokens, customProperty);
                return
              } else {
                break
              }
            } else if (type === '{') {
              this.rule(tokens);
              return
            } else if (type === '}') {
              this.tokenizer.back(tokens.pop());
              end = true;
              break
            } else if (type === ':') {
              colon = true;
            }
          } else if (type === brackets[brackets.length - 1]) {
            brackets.pop();
            if (brackets.length === 0) bracket = null;
          }

          token = this.tokenizer.nextToken();
        }

        if (this.tokenizer.endOfFile()) end = true;
        if (brackets.length > 0) this.unclosedBracket(bracket);

        if (end && colon) {
          if (!customProperty) {
            while (tokens.length) {
              token = tokens[tokens.length - 1][0];
              if (token !== 'space' && token !== 'comment') break
              this.tokenizer.back(tokens.pop());
            }
          }
          this.decl(tokens, customProperty);
        } else {
          this.unknownWord(tokens);
        }
      }

      parse() {
        let token;
        while (!this.tokenizer.endOfFile()) {
          token = this.tokenizer.nextToken();

          switch (token[0]) {
            case 'space':
              this.spaces += token[1];
              break

            case ';':
              this.freeSemicolon(token);
              break

            case '}':
              this.end(token);
              break

            case 'comment':
              this.comment(token);
              break

            case 'at-word':
              this.atrule(token);
              break

            case '{':
              this.emptyRule(token);
              break

            default:
              this.other(token);
              break
          }
        }
        this.endFile();
      }

      precheckMissedSemicolon(/* tokens */) {
        // Hook for Safe Parser
      }

      raw(node, prop, tokens, customProperty) {
        let token, type;
        let length = tokens.length;
        let value = '';
        let clean = true;
        let next, prev;

        for (let i = 0; i < length; i += 1) {
          token = tokens[i];
          type = token[0];
          if (type === 'space' && i === length - 1 && !customProperty) {
            clean = false;
          } else if (type === 'comment') {
            prev = tokens[i - 1] ? tokens[i - 1][0] : 'empty';
            next = tokens[i + 1] ? tokens[i + 1][0] : 'empty';
            if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
              if (value.slice(-1) === ',') {
                clean = false;
              } else {
                value += token[1];
              }
            } else {
              clean = false;
            }
          } else {
            value += token[1];
          }
        }
        if (!clean) {
          let raw = tokens.reduce((all, i) => all + i[1], '');
          node.raws[prop] = { raw, value };
        }
        node[prop] = value;
      }

      rule(tokens) {
        tokens.pop();

        let node = new Rule$2();
        this.init(node, tokens[0][2]);

        node.raws.between = this.spacesAndCommentsFromEnd(tokens);
        this.raw(node, 'selector', tokens);
        this.current = node;
      }

      spacesAndCommentsFromEnd(tokens) {
        let lastTokenType;
        let spaces = '';
        while (tokens.length) {
          lastTokenType = tokens[tokens.length - 1][0];
          if (lastTokenType !== 'space' && lastTokenType !== 'comment') break
          spaces = tokens.pop()[1] + spaces;
        }
        return spaces
      }

      // Errors

      spacesAndCommentsFromStart(tokens) {
        let next;
        let spaces = '';
        while (tokens.length) {
          next = tokens[0][0];
          if (next !== 'space' && next !== 'comment') break
          spaces += tokens.shift()[1];
        }
        return spaces
      }

      spacesFromEnd(tokens) {
        let lastTokenType;
        let spaces = '';
        while (tokens.length) {
          lastTokenType = tokens[tokens.length - 1][0];
          if (lastTokenType !== 'space') break
          spaces = tokens.pop()[1] + spaces;
        }
        return spaces
      }

      stringFrom(tokens, from) {
        let result = '';
        for (let i = from; i < tokens.length; i++) {
          result += tokens[i][1];
        }
        tokens.splice(from, tokens.length - from);
        return result
      }

      unclosedBlock() {
        let pos = this.current.source.start;
        throw this.input.error('Unclosed block', pos.line, pos.column)
      }

      unclosedBracket(bracket) {
        throw this.input.error(
          'Unclosed bracket',
          { offset: bracket[2] },
          { offset: bracket[2] + 1 }
        )
      }

      unexpectedClose(token) {
        throw this.input.error(
          'Unexpected }',
          { offset: token[2] },
          { offset: token[2] + 1 }
        )
      }

      unknownWord(tokens) {
        throw this.input.error(
          'Unknown word',
          { offset: tokens[0][2] },
          { offset: tokens[0][2] + tokens[0][1].length }
        )
      }

      unnamedAtrule(node, token) {
        throw this.input.error(
          'At-rule without name',
          { offset: token[2] },
          { offset: token[2] + token[1].length }
        )
      }
    }

    var parser = Parser$1;

    let Container$2 = container;
    let Parser = parser;
    let Input$2 = input;

    function parse$3(css, opts) {
      let input = new Input$2(css, opts);
      let parser = new Parser(input);
      try {
        parser.parse();
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          if (e.name === 'CssSyntaxError' && opts && opts.from) {
            if (/\.scss$/i.test(opts.from)) {
              e.message +=
                '\nYou tried to parse SCSS with ' +
                'the standard CSS parser; ' +
                'try again with the postcss-scss parser';
            } else if (/\.sass/i.test(opts.from)) {
              e.message +=
                '\nYou tried to parse Sass with ' +
                'the standard CSS parser; ' +
                'try again with the postcss-sass parser';
            } else if (/\.less$/i.test(opts.from)) {
              e.message +=
                '\nYou tried to parse Less with ' +
                'the standard CSS parser; ' +
                'try again with the postcss-less parser';
            }
          }
        }
        throw e
      }

      return parser.root
    }

    var parse_1 = parse$3;
    parse$3.default = parse$3;

    Container$2.registerParse(parse$3);

    let { isClean, my } = symbols;
    let MapGenerator$1 = mapGenerator;
    let stringify$2 = stringify_1;
    let Container$1 = container;
    let Document$2 = document$1;
    let warnOnce$1 = warnOnce$2;
    let Result$2 = result;
    let parse$2 = parse_1;
    let Root$3 = root;

    const TYPE_TO_CLASS_NAME = {
      atrule: 'AtRule',
      comment: 'Comment',
      decl: 'Declaration',
      document: 'Document',
      root: 'Root',
      rule: 'Rule'
    };

    const PLUGIN_PROPS = {
      AtRule: true,
      AtRuleExit: true,
      Comment: true,
      CommentExit: true,
      Declaration: true,
      DeclarationExit: true,
      Document: true,
      DocumentExit: true,
      Once: true,
      OnceExit: true,
      postcssPlugin: true,
      prepare: true,
      Root: true,
      RootExit: true,
      Rule: true,
      RuleExit: true
    };

    const NOT_VISITORS = {
      Once: true,
      postcssPlugin: true,
      prepare: true
    };

    const CHILDREN = 0;

    function isPromise(obj) {
      return typeof obj === 'object' && typeof obj.then === 'function'
    }

    function getEvents(node) {
      let key = false;
      let type = TYPE_TO_CLASS_NAME[node.type];
      if (node.type === 'decl') {
        key = node.prop.toLowerCase();
      } else if (node.type === 'atrule') {
        key = node.name.toLowerCase();
      }

      if (key && node.append) {
        return [
          type,
          type + '-' + key,
          CHILDREN,
          type + 'Exit',
          type + 'Exit-' + key
        ]
      } else if (key) {
        return [type, type + '-' + key, type + 'Exit', type + 'Exit-' + key]
      } else if (node.append) {
        return [type, CHILDREN, type + 'Exit']
      } else {
        return [type, type + 'Exit']
      }
    }

    function toStack(node) {
      let events;
      if (node.type === 'document') {
        events = ['Document', CHILDREN, 'DocumentExit'];
      } else if (node.type === 'root') {
        events = ['Root', CHILDREN, 'RootExit'];
      } else {
        events = getEvents(node);
      }

      return {
        eventIndex: 0,
        events,
        iterator: 0,
        node,
        visitorIndex: 0,
        visitors: []
      }
    }

    function cleanMarks(node) {
      node[isClean] = false;
      if (node.nodes) node.nodes.forEach(i => cleanMarks(i));
      return node
    }

    let postcss$1 = {};

    class LazyResult$2 {
      constructor(processor, css, opts) {
        this.stringified = false;
        this.processed = false;

        let root;
        if (
          typeof css === 'object' &&
          css !== null &&
          (css.type === 'root' || css.type === 'document')
        ) {
          root = cleanMarks(css);
        } else if (css instanceof LazyResult$2 || css instanceof Result$2) {
          root = cleanMarks(css.root);
          if (css.map) {
            if (typeof opts.map === 'undefined') opts.map = {};
            if (!opts.map.inline) opts.map.inline = false;
            opts.map.prev = css.map;
          }
        } else {
          let parser = parse$2;
          if (opts.syntax) parser = opts.syntax.parse;
          if (opts.parser) parser = opts.parser;
          if (parser.parse) parser = parser.parse;

          try {
            root = parser(css, opts);
          } catch (error) {
            this.processed = true;
            this.error = error;
          }

          if (root && !root[my]) {
            /* c8 ignore next 2 */
            Container$1.rebuild(root);
          }
        }

        this.result = new Result$2(processor, root, opts);
        this.helpers = { ...postcss$1, postcss: postcss$1, result: this.result };
        this.plugins = this.processor.plugins.map(plugin => {
          if (typeof plugin === 'object' && plugin.prepare) {
            return { ...plugin, ...plugin.prepare(this.result) }
          } else {
            return plugin
          }
        });
      }

      async() {
        if (this.error) return Promise.reject(this.error)
        if (this.processed) return Promise.resolve(this.result)
        if (!this.processing) {
          this.processing = this.runAsync();
        }
        return this.processing
      }

      catch(onRejected) {
        return this.async().catch(onRejected)
      }

      finally(onFinally) {
        return this.async().then(onFinally, onFinally)
      }

      getAsyncError() {
        throw new Error('Use process(css).then(cb) to work with async plugins')
      }

      handleError(error, node) {
        let plugin = this.result.lastPlugin;
        try {
          if (node) node.addToError(error);
          this.error = error;
          if (error.name === 'CssSyntaxError' && !error.plugin) {
            error.plugin = plugin.postcssPlugin;
            error.setMessage();
          } else if (plugin.postcssVersion) {
            if (process.env.NODE_ENV !== 'production') {
              let pluginName = plugin.postcssPlugin;
              let pluginVer = plugin.postcssVersion;
              let runtimeVer = this.result.processor.version;
              let a = pluginVer.split('.');
              let b = runtimeVer.split('.');

              if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
                // eslint-disable-next-line no-console
                console.error(
                  'Unknown error from PostCSS plugin. Your current PostCSS ' +
                    'version is ' +
                    runtimeVer +
                    ', but ' +
                    pluginName +
                    ' uses ' +
                    pluginVer +
                    '. Perhaps this is the source of the error below.'
                );
              }
            }
          }
        } catch (err) {
          /* c8 ignore next 3 */
          // eslint-disable-next-line no-console
          if (console && console.error) console.error(err);
        }
        return error
      }

      prepareVisitors() {
        this.listeners = {};
        let add = (plugin, type, cb) => {
          if (!this.listeners[type]) this.listeners[type] = [];
          this.listeners[type].push([plugin, cb]);
        };
        for (let plugin of this.plugins) {
          if (typeof plugin === 'object') {
            for (let event in plugin) {
              if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
                throw new Error(
                  `Unknown event ${event} in ${plugin.postcssPlugin}. ` +
                    `Try to update PostCSS (${this.processor.version} now).`
                )
              }
              if (!NOT_VISITORS[event]) {
                if (typeof plugin[event] === 'object') {
                  for (let filter in plugin[event]) {
                    if (filter === '*') {
                      add(plugin, event, plugin[event][filter]);
                    } else {
                      add(
                        plugin,
                        event + '-' + filter.toLowerCase(),
                        plugin[event][filter]
                      );
                    }
                  }
                } else if (typeof plugin[event] === 'function') {
                  add(plugin, event, plugin[event]);
                }
              }
            }
          }
        }
        this.hasListener = Object.keys(this.listeners).length > 0;
      }

      async runAsync() {
        this.plugin = 0;
        for (let i = 0; i < this.plugins.length; i++) {
          let plugin = this.plugins[i];
          let promise = this.runOnRoot(plugin);
          if (isPromise(promise)) {
            try {
              await promise;
            } catch (error) {
              throw this.handleError(error)
            }
          }
        }

        this.prepareVisitors();
        if (this.hasListener) {
          let root = this.result.root;
          while (!root[isClean]) {
            root[isClean] = true;
            let stack = [toStack(root)];
            while (stack.length > 0) {
              let promise = this.visitTick(stack);
              if (isPromise(promise)) {
                try {
                  await promise;
                } catch (e) {
                  let node = stack[stack.length - 1].node;
                  throw this.handleError(e, node)
                }
              }
            }
          }

          if (this.listeners.OnceExit) {
            for (let [plugin, visitor] of this.listeners.OnceExit) {
              this.result.lastPlugin = plugin;
              try {
                if (root.type === 'document') {
                  let roots = root.nodes.map(subRoot =>
                    visitor(subRoot, this.helpers)
                  );

                  await Promise.all(roots);
                } else {
                  await visitor(root, this.helpers);
                }
              } catch (e) {
                throw this.handleError(e)
              }
            }
          }
        }

        this.processed = true;
        return this.stringify()
      }

      runOnRoot(plugin) {
        this.result.lastPlugin = plugin;
        try {
          if (typeof plugin === 'object' && plugin.Once) {
            if (this.result.root.type === 'document') {
              let roots = this.result.root.nodes.map(root =>
                plugin.Once(root, this.helpers)
              );

              if (isPromise(roots[0])) {
                return Promise.all(roots)
              }

              return roots
            }

            return plugin.Once(this.result.root, this.helpers)
          } else if (typeof plugin === 'function') {
            return plugin(this.result.root, this.result)
          }
        } catch (error) {
          throw this.handleError(error)
        }
      }

      stringify() {
        if (this.error) throw this.error
        if (this.stringified) return this.result
        this.stringified = true;

        this.sync();

        let opts = this.result.opts;
        let str = stringify$2;
        if (opts.syntax) str = opts.syntax.stringify;
        if (opts.stringifier) str = opts.stringifier;
        if (str.stringify) str = str.stringify;

        let map = new MapGenerator$1(str, this.result.root, this.result.opts);
        let data = map.generate();
        this.result.css = data[0];
        this.result.map = data[1];

        return this.result
      }

      sync() {
        if (this.error) throw this.error
        if (this.processed) return this.result
        this.processed = true;

        if (this.processing) {
          throw this.getAsyncError()
        }

        for (let plugin of this.plugins) {
          let promise = this.runOnRoot(plugin);
          if (isPromise(promise)) {
            throw this.getAsyncError()
          }
        }

        this.prepareVisitors();
        if (this.hasListener) {
          let root = this.result.root;
          while (!root[isClean]) {
            root[isClean] = true;
            this.walkSync(root);
          }
          if (this.listeners.OnceExit) {
            if (root.type === 'document') {
              for (let subRoot of root.nodes) {
                this.visitSync(this.listeners.OnceExit, subRoot);
              }
            } else {
              this.visitSync(this.listeners.OnceExit, root);
            }
          }
        }

        return this.result
      }

      then(onFulfilled, onRejected) {
        if (process.env.NODE_ENV !== 'production') {
          if (!('from' in this.opts)) {
            warnOnce$1(
              'Without `from` option PostCSS could generate wrong source map ' +
                'and will not find Browserslist config. Set it to CSS file path ' +
                'or to `undefined` to prevent this warning.'
            );
          }
        }
        return this.async().then(onFulfilled, onRejected)
      }

      toString() {
        return this.css
      }

      visitSync(visitors, node) {
        for (let [plugin, visitor] of visitors) {
          this.result.lastPlugin = plugin;
          let promise;
          try {
            promise = visitor(node, this.helpers);
          } catch (e) {
            throw this.handleError(e, node.proxyOf)
          }
          if (node.type !== 'root' && node.type !== 'document' && !node.parent) {
            return true
          }
          if (isPromise(promise)) {
            throw this.getAsyncError()
          }
        }
      }

      visitTick(stack) {
        let visit = stack[stack.length - 1];
        let { node, visitors } = visit;

        if (node.type !== 'root' && node.type !== 'document' && !node.parent) {
          stack.pop();
          return
        }

        if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
          let [plugin, visitor] = visitors[visit.visitorIndex];
          visit.visitorIndex += 1;
          if (visit.visitorIndex === visitors.length) {
            visit.visitors = [];
            visit.visitorIndex = 0;
          }
          this.result.lastPlugin = plugin;
          try {
            return visitor(node.toProxy(), this.helpers)
          } catch (e) {
            throw this.handleError(e, node)
          }
        }

        if (visit.iterator !== 0) {
          let iterator = visit.iterator;
          let child;
          while ((child = node.nodes[node.indexes[iterator]])) {
            node.indexes[iterator] += 1;
            if (!child[isClean]) {
              child[isClean] = true;
              stack.push(toStack(child));
              return
            }
          }
          visit.iterator = 0;
          delete node.indexes[iterator];
        }

        let events = visit.events;
        while (visit.eventIndex < events.length) {
          let event = events[visit.eventIndex];
          visit.eventIndex += 1;
          if (event === CHILDREN) {
            if (node.nodes && node.nodes.length) {
              node[isClean] = true;
              visit.iterator = node.getIterator();
            }
            return
          } else if (this.listeners[event]) {
            visit.visitors = this.listeners[event];
            return
          }
        }
        stack.pop();
      }

      walkSync(node) {
        node[isClean] = true;
        let events = getEvents(node);
        for (let event of events) {
          if (event === CHILDREN) {
            if (node.nodes) {
              node.each(child => {
                if (!child[isClean]) this.walkSync(child);
              });
            }
          } else {
            let visitors = this.listeners[event];
            if (visitors) {
              if (this.visitSync(visitors, node.toProxy())) return
            }
          }
        }
      }

      warnings() {
        return this.sync().warnings()
      }

      get content() {
        return this.stringify().content
      }

      get css() {
        return this.stringify().css
      }

      get map() {
        return this.stringify().map
      }

      get messages() {
        return this.sync().messages
      }

      get opts() {
        return this.result.opts
      }

      get processor() {
        return this.result.processor
      }

      get root() {
        return this.sync().root
      }

      get [Symbol.toStringTag]() {
        return 'LazyResult'
      }
    }

    LazyResult$2.registerPostcss = dependant => {
      postcss$1 = dependant;
    };

    var lazyResult = LazyResult$2;
    LazyResult$2.default = LazyResult$2;

    Root$3.registerLazyResult(LazyResult$2);
    Document$2.registerLazyResult(LazyResult$2);

    let MapGenerator = mapGenerator;
    let stringify$1 = stringify_1;
    let warnOnce = warnOnce$2;
    let parse$1 = parse_1;
    const Result$1 = result;

    class NoWorkResult$1 {
      constructor(processor, css, opts) {
        css = css.toString();
        this.stringified = false;

        this._processor = processor;
        this._css = css;
        this._opts = opts;
        this._map = undefined;
        let root;

        let str = stringify$1;
        this.result = new Result$1(this._processor, root, this._opts);
        this.result.css = css;

        let self = this;
        Object.defineProperty(this.result, 'root', {
          get() {
            return self.root
          }
        });

        let map = new MapGenerator(str, root, this._opts, css);
        if (map.isMap()) {
          let [generatedCSS, generatedMap] = map.generate();
          if (generatedCSS) {
            this.result.css = generatedCSS;
          }
          if (generatedMap) {
            this.result.map = generatedMap;
          }
        } else {
          map.clearAnnotation();
          this.result.css = map.css;
        }
      }

      async() {
        if (this.error) return Promise.reject(this.error)
        return Promise.resolve(this.result)
      }

      catch(onRejected) {
        return this.async().catch(onRejected)
      }

      finally(onFinally) {
        return this.async().then(onFinally, onFinally)
      }

      sync() {
        if (this.error) throw this.error
        return this.result
      }

      then(onFulfilled, onRejected) {
        if (process.env.NODE_ENV !== 'production') {
          if (!('from' in this._opts)) {
            warnOnce(
              'Without `from` option PostCSS could generate wrong source map ' +
                'and will not find Browserslist config. Set it to CSS file path ' +
                'or to `undefined` to prevent this warning.'
            );
          }
        }

        return this.async().then(onFulfilled, onRejected)
      }

      toString() {
        return this._css
      }

      warnings() {
        return []
      }

      get content() {
        return this.result.css
      }

      get css() {
        return this.result.css
      }

      get map() {
        return this.result.map
      }

      get messages() {
        return []
      }

      get opts() {
        return this.result.opts
      }

      get processor() {
        return this.result.processor
      }

      get root() {
        if (this._root) {
          return this._root
        }

        let root;
        let parser = parse$1;

        try {
          root = parser(this._css, this._opts);
        } catch (error) {
          this.error = error;
        }

        if (this.error) {
          throw this.error
        } else {
          this._root = root;
          return root
        }
      }

      get [Symbol.toStringTag]() {
        return 'NoWorkResult'
      }
    }

    var noWorkResult = NoWorkResult$1;
    NoWorkResult$1.default = NoWorkResult$1;

    let NoWorkResult = noWorkResult;
    let LazyResult$1 = lazyResult;
    let Document$1 = document$1;
    let Root$2 = root;

    class Processor$1 {
      constructor(plugins = []) {
        this.version = '8.4.35';
        this.plugins = this.normalize(plugins);
      }

      normalize(plugins) {
        let normalized = [];
        for (let i of plugins) {
          if (i.postcss === true) {
            i = i();
          } else if (i.postcss) {
            i = i.postcss;
          }

          if (typeof i === 'object' && Array.isArray(i.plugins)) {
            normalized = normalized.concat(i.plugins);
          } else if (typeof i === 'object' && i.postcssPlugin) {
            normalized.push(i);
          } else if (typeof i === 'function') {
            normalized.push(i);
          } else if (typeof i === 'object' && (i.parse || i.stringify)) {
            if (process.env.NODE_ENV !== 'production') {
              throw new Error(
                'PostCSS syntaxes cannot be used as plugins. Instead, please use ' +
                  'one of the syntax/parser/stringifier options as outlined ' +
                  'in your PostCSS runner documentation.'
              )
            }
          } else {
            throw new Error(i + ' is not a PostCSS plugin')
          }
        }
        return normalized
      }

      process(css, opts = {}) {
        if (
          !this.plugins.length &&
          !opts.parser &&
          !opts.stringifier &&
          !opts.syntax
        ) {
          return new NoWorkResult(this, css, opts)
        } else {
          return new LazyResult$1(this, css, opts)
        }
      }

      use(plugin) {
        this.plugins = this.plugins.concat(this.normalize([plugin]));
        return this
      }
    }

    var processor = Processor$1;
    Processor$1.default = Processor$1;

    Root$2.registerProcessor(Processor$1);
    Document$1.registerProcessor(Processor$1);

    let Declaration$1 = declaration;
    let PreviousMap = previousMap;
    let Comment$1 = comment;
    let AtRule$1 = atRule;
    let Input$1 = input;
    let Root$1 = root;
    let Rule$1 = rule;

    function fromJSON$1(json, inputs) {
      if (Array.isArray(json)) return json.map(n => fromJSON$1(n))

      let { inputs: ownInputs, ...defaults } = json;
      if (ownInputs) {
        inputs = [];
        for (let input of ownInputs) {
          let inputHydrated = { ...input, __proto__: Input$1.prototype };
          if (inputHydrated.map) {
            inputHydrated.map = {
              ...inputHydrated.map,
              __proto__: PreviousMap.prototype
            };
          }
          inputs.push(inputHydrated);
        }
      }
      if (defaults.nodes) {
        defaults.nodes = json.nodes.map(n => fromJSON$1(n, inputs));
      }
      if (defaults.source) {
        let { inputId, ...source } = defaults.source;
        defaults.source = source;
        if (inputId != null) {
          defaults.source.input = inputs[inputId];
        }
      }
      if (defaults.type === 'root') {
        return new Root$1(defaults)
      } else if (defaults.type === 'decl') {
        return new Declaration$1(defaults)
      } else if (defaults.type === 'rule') {
        return new Rule$1(defaults)
      } else if (defaults.type === 'comment') {
        return new Comment$1(defaults)
      } else if (defaults.type === 'atrule') {
        return new AtRule$1(defaults)
      } else {
        throw new Error('Unknown node type: ' + json.type)
      }
    }

    var fromJSON_1 = fromJSON$1;
    fromJSON$1.default = fromJSON$1;

    let CssSyntaxError = cssSyntaxError;
    let Declaration = declaration;
    let LazyResult = lazyResult;
    let Container = container;
    let Processor = processor;
    let stringify = stringify_1;
    let fromJSON = fromJSON_1;
    let Document = document$1;
    let Warning = warning;
    let Comment = comment;
    let AtRule = atRule;
    let Result = result;
    let Input = input;
    let parse = parse_1;
    let list = list_1;
    let Rule = rule;
    let Root = root;
    let Node = node_1;

    function postcss(...plugins) {
      if (plugins.length === 1 && Array.isArray(plugins[0])) {
        plugins = plugins[0];
      }
      return new Processor(plugins)
    }

    postcss.plugin = function plugin(name, initializer) {
      let warningPrinted = false;
      function creator(...args) {
        // eslint-disable-next-line no-console
        if (console && console.warn && !warningPrinted) {
          warningPrinted = true;
          // eslint-disable-next-line no-console
          console.warn(
            name +
              ': postcss.plugin was deprecated. Migration guide:\n' +
              'https://evilmartians.com/chronicles/postcss-8-plugin-migration'
          );
          if (process.env.LANG && process.env.LANG.startsWith('cn')) {
            /* c8 ignore next 7 */
            // eslint-disable-next-line no-console
            console.warn(
              name +
                ': 里面 postcss.plugin 被弃用. 迁移指南:\n' +
                'https://www.w3ctech.com/topic/2226'
            );
          }
        }
        let transformer = initializer(...args);
        transformer.postcssPlugin = name;
        transformer.postcssVersion = new Processor().version;
        return transformer
      }

      let cache;
      Object.defineProperty(creator, 'postcss', {
        get() {
          if (!cache) cache = creator();
          return cache
        }
      });

      creator.process = function (css, processOpts, pluginOpts) {
        return postcss([creator(pluginOpts)]).process(css, processOpts)
      };

      return creator
    };

    postcss.stringify = stringify;
    postcss.parse = parse;
    postcss.fromJSON = fromJSON;
    postcss.list = list;

    postcss.comment = defaults => new Comment(defaults);
    postcss.atRule = defaults => new AtRule(defaults);
    postcss.decl = defaults => new Declaration(defaults);
    postcss.rule = defaults => new Rule(defaults);
    postcss.root = defaults => new Root(defaults);
    postcss.document = defaults => new Document(defaults);

    postcss.CssSyntaxError = CssSyntaxError;
    postcss.Declaration = Declaration;
    postcss.Container = Container;
    postcss.Processor = Processor;
    postcss.Document = Document;
    postcss.Comment = Comment;
    postcss.Warning = Warning;
    postcss.AtRule = AtRule;
    postcss.Result = Result;
    postcss.Input = Input;
    postcss.Rule = Rule;
    postcss.Root = Root;
    postcss.Node = Node;

    LazyResult.registerPostcss(postcss);

    var postcss_1 = postcss;
    postcss.default = postcss;

    postcss_1.stringify;
    postcss_1.fromJSON;
    postcss_1.plugin;
    postcss_1.parse;
    postcss_1.list;

    postcss_1.document;
    postcss_1.comment;
    postcss_1.atRule;
    postcss_1.rule;
    postcss_1.decl;
    postcss_1.root;

    postcss_1.CssSyntaxError;
    postcss_1.Declaration;
    postcss_1.Container;
    postcss_1.Processor;
    postcss_1.Document;
    postcss_1.Comment;
    postcss_1.Warning;
    postcss_1.AtRule;
    postcss_1.Result;
    postcss_1.Input;
    postcss_1.Rule;
    postcss_1.Root;
    postcss_1.Node;

    class FlightkitTreeNavigation extends HTMLElement {
        base;
        contents;
        component;
        listType = 'ul';
        // currently just by adding this, it will change the iconset to database.
        iconSet;
        filter = { value: '', caseSensitive: false };

        static get observedAttributes() {
            return ['contents', 'icon-set', 'max-depth', 'filter'];
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

            this.iconSet = this.getAttribute('icon-set') ? this.getAttribute('icon-type') : 'file';
            this.maxDepth = this.getAttribute('max-depth') ? parseInt(this.getAttribute('max-depth')) : -1;
            this.setFilter(this.getAttribute('filter'));

            this.style.display = 'block';
            this.style.maxWidth = 'fit-content';
            this.style.margin = '0 1rem 0 0';
            this.base.addEvent('.flk-branch', 'click', this.emitNodeToggle);
        }

        emitNodeToggle(event) {
            event.stopPropagation();
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

            /** because of internal array, we have to do a substring. */
            const path = item.substring(item.indexOf('.') + 1);

            let leafText = flkElement.createLeafText(trail.reverse()[0]);
            flkElement._emit('tree-click', flkElement, { path, data, key: `${leafText.titleText} ${leafText.commentText}`.trim(), branch: typeof data === 'object' });
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
            let match;
            const detailsEl = element.tagName.toLowerCase() === 'details';

            if (this.filter.caseSensitive) {
                match = element.dataset.branchValues.includes(this.filter.value);
            }
            else {
                match = element.dataset.branchValues.toLowerCase().includes(this.filter.value.toLowerCase());
            }

            /** hide the <li> */
            if (match) {
                element.parentElement.classList.remove('hidden');
            }
            else {
                element.parentElement.classList.add('hidden');
            }

            if (detailsEl && match) {
                element.setAttribute('open', '');
            }
            else {
                element.removeAttribute('open');
            }
        }

        resetTree(element) {
            element.parentElement.classList.remove('hidden');
            element.removeAttribute('open');
        }

        filterTree() {
            let searchTimer = setTimeout(() => {
                let foundElements = this.querySelectorAll('[data-branch-values]');

                for (const element of foundElements) {

                    let filterCleared = this.filter.value === undefined || this.filter.value.length === 0;
                    if (filterCleared) {
                        this.resetTree(element);
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
            let hasComment = typeof text === 'string' ? text.includes('(') || text.includes('[') : false;

            let titleText = '';
            let commentText = '';

            if (hasComment) {
                let roundBracketIndex = text.indexOf('(');
                let squareBracketIndex = text.indexOf('[');
                let indexToCut = squareBracketIndex === -1 ? roundBracketIndex : squareBracketIndex;

                titleText = this.convertJsonKeyToTitle(text.substring(0, indexToCut));
                commentText = text.substring(indexToCut);
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
            /** This is the 'leaf' but if we have branch values we want to know where we click on */
            if (branchValues.length) {
                leafText.dataset.leafKey = allBranchValues[0];
            }

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

})(require$$0, require$$2, require$$1$1, require$$1);