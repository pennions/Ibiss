import { folderListIcon, fileListIcon, databaseListIcon, tableListIcon, columnListIcon } from '../flightkit-functions/icons';
import { returnDataSetValue, returnEventWithTopLevelElement } from '../flightkit-functions/domTraversal';
import { BaseComponent } from './extensions/base_component';

export class FlightkitTreeNavigation extends HTMLElement {
    base;
    contents;
    component;
    listType = 'ul';
    commentType = ''
    // currently just by adding this, it will change the iconset to database.
    iconSet;
    filter = { value: '', caseSensitive: false };
    selectedElements = [];

    static get observedAttributes() {
        return ['contents', 'icon-set', 'max-depth', 'filter'];
    };

    _jsonToValueArray(json) {

        let jsonString = JSON.stringify(json);
        /** replace any array and object brackets */
        jsonString = jsonString.replace(/[\[\]{}\"]/g, "");
        let jsonKeyValueArray = jsonString.split(',');
        let values = [];

        for (const kvPair of jsonKeyValueArray) {
            values = values.concat(kvPair.split(":"));
        }
        return [...new Set(values)];
    }

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
        this.commentType = this.getAttribute('comment') ?? '';
        this.iconSet = this.getAttribute('icon-set') ?? 'file';
        this.maxDepth = this.getAttribute('max-depth') ? parseInt(this.getAttribute('max-depth')) : -1;
        this.setFilter(this.getAttribute('filter'));

        this.style.display = 'block';
        this.style.maxWidth = 'fit-content';
        this.style.margin = '0 1rem 0 0';
        this.base.addEvent('.flk-branch', 'click', this.emitNodeToggle);
    }

    deselectTree() {
        if (this.selectedElements.length) {
            for (const selectedElement of this.selectedElements) {
                selectedElement.classList.remove('font-weight-bold');
                delete selectedElement.dataset.selected;
            }
        }
    }

    emitNodeToggle(event) {
        event.stopPropagation();

        /** Clicked in between items in a list, ignore. */
        if (["LI", "UL"].includes(event.target.tagName)) {
            return false;
        }

        const flkEvent = returnEventWithTopLevelElement(event, 'flk-tree-nav');
        const flkElement = flkEvent.target;
        const item = returnDataSetValue(event, 'branchKey');

        let data = flkElement.contents;
        const trail = item.split('.');

        for (const crumb of trail) {
            if (data[crumb]) {
                data = data[crumb];
            }
            else if (data[crumb] === null) {
                data = null
            }
            else {
                /** Dealing with an array of objects */
                let extractedData = [];
                for (const obj of data) {
                    if (obj[crumb]) {
                        extractedData.push(obj[crumb])
                    }
                }
                data = extractedData;
            }
        }

        let leafKey;
        let parent = event.target

        do {
            if (parent.dataset && parent.dataset.leafKey) {
                leafKey = parent.dataset.leafKey
            }
            else {
                parent = parent.parentNode || parent.parentElement;
            }
        }
        while (!leafKey)

        if (flkElement.selectedElements.length) {
            flkElement.deselectTree();
        }

        // flkElement.previousElements = flkElement.selectedElements;
        flkElement.selectedElements = [];


        if (parent.tagName === 'DETAILS') {
            flkElement.selectedElements.push(parent.childNodes[0]);

            /** for when we have 2 spans */
            if (parent.childNodes.length && parent.childNodes[0].childNodes.length && parent.childNodes[0].childNodes[0].tagName === 'DIV') {
                console.log(parent.childNodes[0].childNodes)
                flkElement.selectedElements = parent.childNodes[0].childNodes[0].childNodes
            }
        }
        else {
            flkElement.selectedElements.push(parent)
        }

        for (const selectedElement of flkElement.selectedElements) {
            if (!selectedElement.dataset.selected) {
                selectedElement.classList.add('font-weight-bold');
                selectedElement.dataset.selected = true;
            }
        }

        /** because of internal array, we have to do a substring. */
        const path = item.substring(item.indexOf('.') + 1);

        let leafText = flkElement.createLeafText(trail.reverse()[0])
        flkElement._emit('tree-click', flkElement, { path, data, key: leafKey, label: `${leafText.titleText} ${leafText.commentText}`.trim(), branch: typeof data === 'object' });
    }

    convertJsonKeyToTitle(jsonKey) {
        if (!jsonKey) return '';

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
                    this.contents = JSON.parse(valueToSet);
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

    applyFilter(element) {
        let match;
        const detailsEl = element.tagName.toLowerCase() === 'details';

        if (this.filter.caseSensitive) {
            match = element.dataset.branchValues.includes(this.filter.value);
        }
        else {
            match = element.dataset.branchValues.toLowerCase().includes(this.filter.value.toLowerCase());
        }

        /** hide the <li> */
        if (match) {
            element.parentElement.classList.remove('hidden');
        }
        else {
            element.parentElement.classList.add('hidden');
        }

        if (detailsEl && match) {
            element.setAttribute('open', '');
        }
        else {
            element.removeAttribute('open');
        }
    }

    resetTree(element) {
        element.parentElement.classList.remove('hidden');
        element.removeAttribute('open');
    }

    filterTree() {
        let searchTimer = setTimeout(() => {
            let foundElements = this.querySelectorAll('[data-branch-values]');

            for (const element of foundElements) {

                let filterCleared = this.filter.value === undefined || this.filter.value.length === 0;
                if (filterCleared) {
                    this.resetTree(element);
                }
                else {
                    this.applyFilter(element);
                }
            }
            clearTimeout(searchTimer);
        }, 10);
    }

    setFilter(newValue) {
        /** check if it came from an attibute callback, or directly set as property */
        const valueToSet = newValue || {};
        try {
            switch (typeof valueToSet) {
                case 'string': {
                    if (valueToSet.includes('{')) {
                        this.filter = JSON.parse(valueToSet);
                        if (this.filter.caseSensitive === false) {
                            this.filter.value = this.filter.value.toLowerCase();
                        }
                    }
                    else {
                        this.filter.value = newValue.toLowerCase();
                    }
                    break;
                }
                case 'object': {
                    this.filter = valueToSet;
                    break;
                }
            }
        }
        catch (e) {
            console.log(e);
        }
        this.filterTree();
    }


    createLeafText(text) {
        let hasComment = typeof text === 'string' && this.commentType.length ? text.includes(this.commentType[0]) : false;

        let titleText = '';
        let commentText = ''

        if (hasComment) {
            let commentBracketIndex = text.indexOf(this.commentType[0]);
            titleText = this.convertJsonKeyToTitle(text.substring(0, commentBracketIndex));
            commentText = text.substring(commentBracketIndex + 1, text.length - 1).trim();
        }
        else {
            titleText = this.convertJsonKeyToTitle(text);
        }
        return { titleText, commentText }
    }

    createTextTag(text, element) {
        let leafText = this.createLeafText(text);

        if (leafText.commentText) {
            let tagContainer = document.createElement('div');
            let mainTitleElement = document.createElement('span');

            mainTitleElement.innerText = leafText.titleText;

            let commentElement = document.createElement('small');
            commentElement.innerText = leafText.commentText;
            commentElement.style.marginLeft = '1rem';

            tagContainer.append(mainTitleElement, commentElement);
            tagContainer.style.display = 'inline-flex';
            tagContainer.style.alignItems = 'center';

            element.append(tagContainer);
        }
        else {
            element.innerText = leafText.titleText;
        }
    }

    createLeaf(text, element, key, branchValues = []) {
        let leaf = document.createElement('li');
        leaf.classList.add('cursor-no-select');
        leaf.style.marginTop = '0.4rem';
        leaf.dataset.branchKey = key;

        const iconToUse = this.iconSet === 'file' ? fileListIcon : columnListIcon;
        leaf.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;
        leaf.style.position = 'relative';
        leaf.style.left = '2px';
        let leafText = document.createElement('span');

        let allBranchValues = [text].concat(branchValues);
        leafText.dataset.branchValues = [...new Set(allBranchValues)].join();
        /** to get the leaf */
        leafText.dataset.leafKey = allBranchValues[0];

        this.createTextTag(text, leafText);

        leafText.style.position = 'relative';
        leafText.style.top = '-3px';
        leaf.append(leafText);

        if (element.tagName.toLowerCase() !== this.listType) {
            let listContainer = document.createElement(this.listType);
            const iconToUse = this.iconSet === 'file' ? folderListIcon : tableListIcon;
            listContainer.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;
            listContainer.append(leaf);
            element.append(listContainer);
        }
        else {
            element.append(leaf);
        }
        return;
    }

    createBranch(node, element, key, depth) {
        /** We can now cap the depth, for better visualization */
        if (depth === this.maxDepth && typeof node === 'object') {
            let leafNodes = Array.isArray(node) ? node : Object.keys(node);

            for (const leaf of leafNodes) {
                let branchValues;
                if (node[leaf]) {
                    branchValues = this._jsonToValueArray(node[leaf]);
                }
                this.createLeaf(leaf, element, `${key}.${leaf}`, branchValues);
            }
        }
        else if (Array.isArray(node)) {
            for (let nodeKey in node) {
                let branch = document.createElement(this.listType);
                element.append(this.createBranch(node[nodeKey], branch, `${key}.${nodeKey}`, depth + 1));
            }
        }
        else if (node !== null && typeof node === 'object') {
            let nodeKeys = Object.keys(node);
            const branches = [];
            for (const nodeKey of nodeKeys) {

                let trunk = document.createElement('li');
                trunk.classList.add('cursor-no-select');
                trunk.style.position = 'relative';
                trunk.style.left = '2px';
                trunk.dataset.branchKey = `${key}.${nodeKey}`;


                let branch = document.createElement('details');
                branch.classList.add('flk-branch');
                /** set values as we go down, for easy filtering */
                branch.dataset.branchValues = [nodeKey].concat(this._jsonToValueArray(node[nodeKey])); /** also want to key above. */

                /** fix offset for custom icon */
                branch.style.position = 'relative';
                branch.style.top = '-3px';
                branch.classList.add('cursor-default');
                let branchName = document.createElement('summary');

                this.createTextTag(nodeKey, branchName);
                branch.dataset.leafKey = nodeKey;

                branch.append(branchName);
                trunk.append(this.createBranch(node[nodeKey], branch, `${key}.${nodeKey}`, depth + 1));
                branches.push(trunk);
            }

            /** check if we started with a list or not.  */
            if (element.tagName.toLowerCase() !== this.listType) {
                let listContainer = document.createElement(this.listType);
                const iconToUse = this.iconSet === 'file' ? folderListIcon : tableListIcon;
                listContainer.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;

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
            this.createLeaf(node, element, key);
        }
        return element;
    }

    createHtml() {
        let mainList = document.createElement(this.listType);

        const iconToUse = this.iconSet === 'file' ? folderListIcon : databaseListIcon;
        mainList.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;
        mainList.style.marginLeft = '3rem';

        if (!this.contents.length) {
            this.component = mainList;
            return;
        }

        let contentsToRender = this.contents;

        for (const key in contentsToRender) {
            mainList = this.createBranch(this.contents[key], mainList, key, 0);
        }
        this.component = mainList;
    };


    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents": {
                this.setContents(newValue);
                break;
            }
            case "icon-set": {
                this.iconSet = newValue;
                break;
            }
            case "max-depth": {
                this.maxDepth = typeof newValue === 'string' ? parseInt(newValue) : newValue;
                break;
            }
            case "filter": {
                this.setFilter(newValue);
                break;
            }
        }
        /** in Vue3 this is not triggered. You need to set a :key property and handle that */
        this.init();
    }

    /** grab inner HTML from here */
    connectedCallback() {
        this.init();
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
