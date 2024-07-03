/**
 * @param {*} jsonArray 
 * @param {Object} sortDetails ( propertyName: string, direction: 'asc' | 'desc' )  
 * @returns 
 */
export function sortJsonArray(jsonArray, sortDetails) {
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
};

export const sortGroupedJsonArray = (groupedJsonArray, sortDetails) => {
    const result = [];
    for (const jsonArray of groupedJsonArray) {
        result.push(jsonArray.sort(sortFunction(sortDetails)));
    }
    return result;
};

function extractNumber(value) {
    let testString = value.toString()
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

function sortFunction(applicableSorters, index = 0) {
    return function (a, b) {

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

        const valueAHasNumber = extractNumber(valueA)
        const valueBHasNumber = extractNumber(valueB)

        if (valuesAreNumbers) {
            valueA = parseFloat(valueA).toPrecision(12);
            valueB = parseFloat(valueB).toPrecision(12);
        }
        else if (valueAHasNumber !== null && valueBHasNumber !== null) {
            valueA = parseFloat(valueAHasNumber).toPrecision(12);
            valueB = parseFloat(valueBHasNumber).toPrecision(12);
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