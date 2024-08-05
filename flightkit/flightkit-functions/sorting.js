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

        const valueAHasNumber = extractNumber(valueA)
        const valueBHasNumber = extractNumber(valueB)

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