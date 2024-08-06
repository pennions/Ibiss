export function uuidv4() {
    const guid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );

    if (!window.$flightkitUUIDStore) {
        window.$flightkitUUIDStore = {};
    }

    /** verify to be absolutely sure ;) */
    if (window.$flightkitUUIDStore[guid] !== undefined) {
        return uuidv4();
    }
    else {
        window.$flightkitUUIDStore[guid] = true;
        return guid;
    }
};

export function variableUID(length = 3) {
    let guid = 'x'.repeat(length).replace(/[x]/g, () =>
        (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf).toString(16)
    );

    if (!window.$flightkitUUIDStore) {
        window.$flightkitUUIDStore = {};
    }

    /** verify to be absolutely sure ;) */
    if (window.$flightkitUUIDStore[guid] !== undefined) {
        /** if we did hit it, make sure we limit the amount of hits by just adding to the length */
        return variableUID(length + 1);
    }
    else {
        window.$flightkitUUIDStore[guid] = true;
        return guid;
    }
}