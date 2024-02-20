export function uuidv4() {
    const guid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    /** This will be unique enough */
    const newGuid = guid.split('-')[0];

    if (!window._flightkitUUIDStore) {
        window._flightkitUUIDStore = [];
    }

    /** verify to be absolutely sure ;) */
    if (window._flightkitUUIDStore.some(guid => guid === newGuid)) {
        return uuidv4();
    }
    else {
        window._flightkitUUIDStore.push(newGuid);
        return newGuid;
    }
};
