/** example component */
import { BaseComponent } from './extensions/base_component';

export class FlightkitTreeNavigation extends HTMLElement {
    base;
    contents;
    component;
    listType;

    static get observedAttributes() {
        return ['contents', 'sorted'];
    };

    constructor() {
        super();
        this.base = new BaseComponent();
        /** Check if there is contents already there. */
        this.setContents(this.getAttribute('contents'));
        this.listType = this.getAttribute('sorted') ? 'ol' : 'ul'
    }

    convertJsonKeyToTitle(jsonKey) {
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
    };

    // todo: add depth gauge and icons
    createBranch(node, element) {
        if (Array.isArray(node)) {
            for (let subNode of node) {
                let branch = document.createElement(this.listType);
                element.append(this.createBranch(subNode, branch));
            }
        }
        else if (typeof node === 'object') {
            let keys = Object.keys(node);
            const branches = [];
            for (const key of keys) {

                if (typeof node[key] === 'object') {
                    let trunk = document.createElement('li');
                    let branch = document.createElement('details');
                    let branchName = document.createElement('summary');
                    branchName.innerText = this.convertJsonKeyToTitle(key);
                    branch.append(branchName);
                    trunk.append(this.createBranch(node[key], branch));

                    branches.push(trunk);
                }
                else {
                    let leaf = document.createElement('li');
                    leaf.dataset.leafkey = key;
                    leaf.dataset.leaf = node[key];
                    leaf.innerText = node[key];
                    element.append(leaf);
                }
            }

            /** check if we started with a list or not.  */
            if (element.tagName.toLowerCase() !== this.listType) {
                let listContainer = document.createElement(this.listType);
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
            let leaf = document.createElement('li');
            leaf.dataset.leaf = node;
            leaf.innerText = node;
            element.append(leaf)
        }
        return element;
    }

    createHtml() {
        let mainList = document.createElement(this.listType);

        if (!this.contents.length) {
            this.component = mainList
            return;
        }

        for (const node of this.contents) {

            mainList = this.createBranch(node, mainList);

        }
        this.component = mainList;
    };

    /** grab inner HTML from here */
    connectedCallback() {
        this.createHtml();
        this.base.render(this);
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
