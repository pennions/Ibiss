import { folderListIcon, fileListIcon, databaseListIcon, tableListIcon, columnListIcon } from '../htmlbuilder/icons';
import { BaseComponent } from './extensions/base_component';

export class FlightkitTreeNavigation extends HTMLElement {
    base;
    contents;
    component;
    listType = 'ul';
    // currently just by adding this, it will change the iconset to table.
    iconType;

    static get observedAttributes() {
        return ['contents', 'icon-type'];
    };

    constructor() {
        super();
        this.base = new BaseComponent();
        /** Check if there is contents already there. */
        this.setContents(this.getAttribute('contents'));
        this.iconType = this.getAttribute('icon-type') ? this.getAttribute('icon-type') : 'file'
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

    // todo: add crumb trail > so we can navigate back a.b.c.0 etc. [also depth gauge for icons]
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

                let trunk = document.createElement('li');
                trunk.style.position = 'relative';
                trunk.style.left = '2px';
                trunk.dataset.leafKey = key;

                let branch = document.createElement('details');
                /** fix offset for custom icon */
                branch.style.position = 'relative';
                branch.style.top = '-3px'
                branch.classList.add('cursor-default')
                let branchName = document.createElement('summary');
                branchName.innerText = this.convertJsonKeyToTitle(key);
                branch.append(branchName);
                trunk.append(this.createBranch(node[key], branch));
                branches.push(trunk);
            }

            /** check if we started with a list or not.  */
            if (element.tagName.toLowerCase() !== this.listType) {
                let listContainer = document.createElement(this.listType);
                const iconToUse = this.iconType === 'file' ? folderListIcon : tableListIcon
                listContainer.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`

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
            leaf.style.marginTop = '0.4rem'
            leaf.dataset.leafContents = node;

            const iconToUse = this.iconType === 'file' ? fileListIcon : columnListIcon
            leaf.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`
            leaf.style.position = 'relative';
            leaf.style.left = '2px';
            let leafText = document.createElement('span');
            leafText.innerText = node;
            leafText.style.position = 'relative';
            leafText.style.top = '-2px'
            leaf.append(leafText)

            if (element.tagName.toLowerCase() !== this.listType) {
                let listContainer = document.createElement(this.listType);
                const iconToUse = this.iconType === 'file' ? folderListIcon : tableListIcon
                listContainer.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`

                listContainer.append(leaf)
                element.append(listContainer)
            }
            else {
                element.append(leaf)
            }
        }
        return element;
    }

    createHtml() {
        let mainList = document.createElement(this.listType);

        const iconToUse = this.iconType === 'file' ? folderListIcon : databaseListIcon
        mainList.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`
        mainList.style.marginLeft = '3rem'

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
