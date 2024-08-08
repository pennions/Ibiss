export function getPropertyValue(property, object) {
    const propertyTrail = property.split(/(?<!\.)\.(?!\.)/);

    let value = '';

    for (const trailProperty of propertyTrail) {
        const property = trailProperty.trim();
        if (!value || !Object.keys(value).length) {
            value = object[property] ? object[property] : '';
        } else {
            if (typeof value === 'object' && value[property]) {
                value = value[property];
            } else {
                value = null;
                break;
            }
        }
    }
    return value;
}

export function getAllValuesAndKeysFromJson(rawJson) {
    let json = rawJson;

    if (!rawJson) return [];
    if (typeof rawJson === 'string' && rawJson.includes('{')) {
        json = JSON.parse(json)
    }
    else if (typeof rawJson !== 'object') {
        return [rawJson]
    }

    let allValuesAndKeys = []

    if (Array.isArray(json)) {
        if (typeof json[0] === 'object') {
            for (const jsonObj of json) {
                allValuesAndKeys = allValuesAndKeys.concat(Object.keys(jsonObj));
                const jsonObjValues = Object.values(jsonObj)

                for (const jsonValue of jsonObjValues) {
                    if (typeof jsonValue === 'object') {
                        allValuesAndKeys = allValuesAndKeys.concat(getAllValuesAndKeysFromJson(jsonValue))
                    }
                    else {
                        allValuesAndKeys.push(jsonValue)
                    }
                }
            }
        }
    }
    else if (typeof json === 'object') {
        allValuesAndKeys = allValuesAndKeys.concat(Object.keys(json));
        const jsonObjValues = Object.values(json)

        for (const jsonValue of jsonObjValues) {
            if (typeof jsonValue === 'object') {
                allValuesAndKeys = allValuesAndKeys.concat(getAllValuesAndKeysFromJson(jsonValue))
            }
            else {
                allValuesAndKeys.push(jsonValue)
            }
        }
    }
    else {
        allValuesAndKeys.push(json)
    }
    return allValuesAndKeys;
}