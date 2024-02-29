function isFlightkitElement(tagName) {
    return tagName.toUpperCase().includes('FLK-');
}

/**
 * @returns top level flightkit element
 */
export function returnEventWithTopLevelElement(event) {
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

export function returnDataSetValue(event, datasetName) {
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