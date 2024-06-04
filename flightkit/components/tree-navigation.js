import { folderListIcon, fileListIcon, databaseListIcon, tableListIcon, columnListIcon } from '../htmlbuilder/icons';
import { returnDataSetValue, returnEventWithTopLevelElement } from '../htmlbuilder/domTraversal';
import { BaseComponent } from './extensions/base_component';

export class FlightkitTreeNavigation extends HTMLElement {
    base;
    contents;
    component;
    listType = 'ul';
    // currently just by adding this, it will change the iconset to table.
    iconSet;

    static get observedAttributes() {
        return ['contents', 'icon-type'];
    };

    _emit(event, ftElement, detail) {
        let selectEvent = new CustomEvent(event, {
            detail,
            bubbles: true,
            cancelable: true
        });
        ftElement.dispatchEvent(selectEvent);
    }

    constructor() {
        super();
        this.base = new BaseComponent();
        /** Check if there is contents already there. */
        this.setContents(this.getAttribute('contents'));
        this.iconSet = this.getAttribute('icon-set') ? this.getAttribute('icon-type') : 'file';

        this.style.display = 'block';
        this.style.maxWidth = 'fit-content';
        this.style.margin = '0.5rem 1rem 0 0';

        this.base.addEvent('.flk-branch', 'click', this.emitNodeToggle)
    }

    emitNodeToggle(event) {
        event.stopPropagation();
        const flkEvent = returnEventWithTopLevelElement(event, 'flk-tree-nav');
        const flkElement = flkEvent.target;
        const item = returnDataSetValue(event, 'branchKey');

        /** because of internal array, we have to do a substring. */
        const key = item.substring(item.indexOf('.') + 1);

        flkElement._emit('tree-click', flkElement, key)
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

    createBranch(node, element, key) {

        if (Array.isArray(node)) {
            for (let nodeKey in node) {
                let branch = document.createElement(this.listType);
                element.append(this.createBranch(node[nodeKey], branch, `${key}.${nodeKey}`));
            }
        }
        else if (typeof node === 'object') {
            let nodeKeys = Object.keys(node);
            const branches = [];
            for (const nodeKey of nodeKeys) {

                let trunk = document.createElement('li');
                trunk.classList.add('flk-branch', 'cursor-no-select')
                trunk.style.position = 'relative';
                trunk.style.left = '2px';
                trunk.dataset.branchKey = `${key}.${nodeKey}`;

                let branch = document.createElement('details');
                /** fix offset for custom icon */
                branch.style.position = 'relative';
                branch.style.top = '-3px'
                branch.classList.add('cursor-default')
                let branchName = document.createElement('summary');
                branchName.innerText = this.convertJsonKeyToTitle(nodeKey);
                branch.append(branchName);
                trunk.append(this.createBranch(node[nodeKey], branch, `${key}.${nodeKey}`));
                branches.push(trunk);
            }

            /** check if we started with a list or not.  */
            if (element.tagName.toLowerCase() !== this.listType) {
                let listContainer = document.createElement(this.listType);
                const iconToUse = this.iconSet === 'file' ? folderListIcon : tableListIcon
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
            leaf.classList.add('flk-branch', 'cursor-no-select')
            leaf.style.marginTop = '0.4rem'
            leaf.dataset.branchKey = key;

            const iconToUse = this.iconSet === 'file' ? fileListIcon : columnListIcon
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
                const iconToUse = this.iconSet === 'file' ? folderListIcon : tableListIcon
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

        const iconToUse = this.iconSet === 'file' ? folderListIcon : databaseListIcon
        mainList.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`
        mainList.style.marginLeft = '3rem'

        if (!this.contents.length) {
            this.component = mainList
            return;
        }

        for (const key in this.contents) {
            mainList = this.createBranch(this.contents[key], mainList, key);
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
