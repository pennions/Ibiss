function isFlightkitElement(tagName, flkTag) {
    const compareTo = flkTag ? flkTag.toUpperCase() : 'FLK-';
    return tagName.toUpperCase().includes(compareTo);
}

/**
 * @returns top level flightkit element
 */
export function returnEventWithTopLevelElement(event, flkTag) {
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