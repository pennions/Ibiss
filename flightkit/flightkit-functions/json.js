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
