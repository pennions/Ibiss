import { folderListIcon, fileListIcon, databaseListIcon, tableListIcon, columnListIcon } from '../flightkit-functions/icons';
import { returnDataSetValue, returnEventWithTopLevelElement } from '../flightkit-functions/domTraversal';
import { BaseComponent } from './extensions/base_component';
import { variableUID } from '../flightkit-functions/uuid_v4';
import { getAllValuesAndKeysFromJson } from '../flightkit-functions/json';

export class FlightkitTreeNavigation extends HTMLElement {
    base;
    contents;
    component;
    listType = 'ul';
    commentType = ''
    invertComment = false;
    searchStyle = '';
    // currently just by adding this, it will change the iconset to database.
    iconSet;
    filter = { value: '', caseSensitive: false };
    selectedElements = [];
    _setup = true;

    /** Keep track of bubbling event, because we cannot stop propagation, it conflicts with things like dropdown */
    _lastEventEmitted = 0;

    /** To make it so, something will not collapse when clicking, remember that we filtered, so the next click action will not close if open. */
    _justFiltered = false;

    /** making a dictionary for the tree values so that it is not rendered in the dom for large trees */
    _treeValues = {}

    static get observedAttributes() {
        return ['contents', 'icon-set', 'max-depth', 'filter', 'search-style', 'comment', 'invert-comment'];
    };

    _jsonToValueArray(json) {
        return [...new Set(getAllValuesAndKeysFromJson(json))];
    }

    _emit(event, flkElement, detail) {
        let selectEvent = new CustomEvent(event, {
            detail,
            bubbles: true,
            cancelable: true
        });
        flkElement.dispatchEvent(selectEvent);
    }

    constructor() {
        super();
        this.base = new BaseComponent();
    }

    stopCollapseWhenJustFiltered(event) {
        const flkEvent = returnEventWithTopLevelElement(event, 'flk-tree-nav');
        const flkElement = flkEvent.target;

        if (!flkElement._justFiltered) {
            return true
        }

        let detailsElement = event.target

        do {
            if (detailsElement.tagName !== 'DETAILS') {
                detailsElement = detailsElement.parentNode || detailsElement.parentElement;
            }
        }
        while (detailsElement.tagName !== 'DETAILS')

        if (flkElement._justFiltered === true && detailsElement.open) {
            event.preventDefault();
            flkElement._justFiltered = false;
        }
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
        /** Clicked in between items in a list, ignore. */
        if (["LI", "UL"].includes(event.target.tagName)) {
            return false;
        }
        const flkEvent = returnEventWithTopLevelElement(event, 'flk-tree-nav');
        const flkElement = flkEvent.target;

       /** Check if an event bubbled, so we do not do it twice. */
        var lastEventEmitted = flkElement._lastEventEmitted;
        flkElement._lastEventEmitted = event.timeStamp;

        if (lastEventEmitted !== 0) {
            var noSignificantChange = event.timeStamp - lastEventEmitted < 30
            if (noSignificantChange) {
                return false;
            }
        }
        const item = returnDataSetValue(event, 'branchKey');
        const depth = parseInt(returnDataSetValue(event, 'depth'));
        let data = flkElement.contents;
        const trail = item.split('¶'); /** using pilcrow (¶) here because sometimes we have a . in the name */

        for (const crumb of trail) {
            if (data[crumb]) {
                data = data[crumb];
            }
            else if (data[crumb] === null) {
                data = null
            }
            else if (Array.isArray(data)) {
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
            flkElement.selectedElements = [];
        }

        if (parent.tagName === 'DETAILS') {
            flkElement.selectedElements.push(parent.childNodes[0]);

            /** for when we have 2 spans */
            if (parent.childNodes.length && parent.childNodes[0].childNodes.length && parent.childNodes[0].childNodes[0].tagName === 'DIV') {
                flkElement.selectedElements = parent.childNodes[0].childNodes[0].childNodes
            }
        }
        else {
            flkElement.selectedElements.push(parent)
            if (parent.childNodes.length && parent.childNodes[0].tagName === 'DIV') {
                flkElement.selectedElements = parent.childNodes[0].childNodes
            }
        }

        for (const selectedElement of flkElement.selectedElements) {
            if (!selectedElement.dataset.selected) {
                selectedElement.classList.add('font-weight-bold');
                selectedElement.dataset.selected = true;
            }
        }

        let leafText = flkElement.createLeafText(trail.reverse()[0])
        /** somehow there is always a 0 on the end. remove that and then reverse to get the correct path as array to avoid any . issues */
        trail.pop();
        const path = trail.reverse()
        flkElement._emit('tree-click', flkElement, { depth, path, data, key: leafKey, label: `${leafText.titleText} ${leafText.commentText}`.trim(), branch: typeof data === 'object' });
    }

    convertJsonKeyToTitle(jsonKey) {
        if (!jsonKey) return '';

        if (typeof jsonKey !== 'string') jsonKey = jsonKey.toString();

        const result = jsonKey.replace(/([-_])/g, ($1) => {
            if ($1 === "_") return " ";
            else return $1;
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
        this._justFiltered = true;
        let match, childMatch;
        const detailsEl = element.tagName.toLowerCase() === 'details';

        /** doing a little bit more magic. Only open if a child is found that matches */
        let childElements = structuredClone(this._treeValues[element.dataset.branchValueId]);
        const isBranch = Array.isArray(childElements);

        /** When it is a leaf. */
        let searchValues = isBranch ? childElements.join() : childElements;

        /** remove the branch */
        if (isBranch) {
            childElements.shift();
        }

        let childValues = isBranch ? childElements.join() : '';

        if (this.filter.caseSensitive) {
            match = searchValues.includes(this.filter.value);
            childMatch = childValues.includes(this.filter.value);
        }
        else {
            match = searchValues.toLowerCase().includes(this.filter.value.toLowerCase());
            childMatch = childValues.toLowerCase().includes(this.filter.value.toLowerCase());
        }

        /** show the <li> */
        if (match) {
            this.unselectTree(element);
        }
        else {
            /** doing the opposite, so we are making the non-matches lighter. */
            if (this.searchStyle === 'highlight') {
                element.parentElement.style.color = "rgba(0, 0, 0, 0.5)";
            }
            else {
                element.parentElement.classList.add('hidden');
            }
        }

        if (detailsEl && match && childMatch) {
            element.setAttribute('open', '');
        }
        else {
            element.removeAttribute('open');
        }
    }

    resetTree(all = true) {
        let foundElements = this.querySelectorAll('[data-branch-value-id]');

        for (const element of foundElements) {
            element.parentElement.style.color = '';
            element.parentElement.classList.remove('hidden');
            if (all) {
                element.removeAttribute('open');
            }
        }
    }

    unselectTree(element) {
        if (this.searchStyle === 'highlight') {
            element.parentElement.style.color = '';
        }
        else {
            element.parentElement.classList.remove('hidden');
        }
        element.removeAttribute('open');
    }

    clearFilter() {
        this.resetTree(false);
        this.filter = { value: '', caseSensitive: false };
    }

    filterTree() {
        let filterCleared = this.filter.value === undefined || this.filter.value.length === 0;
        if (filterCleared) {
            this.resetTree();
            return;
        }

        let searchTimer = setTimeout(() => {
            let foundElements = this.querySelectorAll('[data-branch-value-id]');
            for (const element of foundElements) {
                this.applyFilter(element);
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
                    /** if it is added as a stringified json */
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

            if (this.invertComment) {
                let tmpTitleText = titleText;
                titleText = commentText;
                commentText = tmpTitleText;
            }
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

        return leafText;
    }

    createLeaf(text, element, key, depth, branchValues = []) {
        let leaf = document.createElement('li');
        leaf.classList.add('cursor-pointer');
        leaf.style.paddingTop = '0.4rem';
        leaf.dataset.branchKey = key;
        leaf.dataset.depth = depth;

        const iconToUse = this.iconSet === 'file' ? fileListIcon : columnListIcon;
        leaf.style.listStyleImage = `url('data:image/svg+xml,${iconToUse}')`;
        leaf.style.position = 'relative';
        leaf.style.left = '2px';
        let leafText = document.createElement('span');

        let branchValueId = variableUID();
        leafText.dataset.branchValueId = branchValueId;

        let allBranchValues = [text].concat(branchValues);
        this._treeValues[branchValueId] = [...new Set(allBranchValues)].join();

        /** to get the leaf */
        leafText.dataset.leafKey = allBranchValues[0];

        const appliedText = this.createTextTag(text, leafText);

        if (appliedText.commentText) {
            leaf.title = `${appliedText.titleText} ${appliedText.commentText}`;
        }
        else {
            leaf.title = appliedText.titleText;
        }

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
        const newDepth = depth + 1;

        /** We can now cap the depth, for better visualization */
        if (depth === this.maxDepth && typeof node === 'object') {

            if (Array.isArray(node)) {
                for (const leafNodeKey in node) {
                    let branchValues;
                    if (node[leafNodeKey]) {
                        branchValues = this._jsonToValueArray(node[leafNodeKey]);
                    }
                    // todo does not work for arrays yet.
                    if (typeof node[leafNodeKey] === 'object') {
                        const leafKeys = Object.keys(node[leafNodeKey])
                        for (const leafKey of leafKeys) {
                            this.createLeaf(leafKey, element, `${key}¶${leafNodeKey}`, depth, branchValues);
                        }
                    }
                    else {
                        this.createLeaf(node[leafNodeKey], element, `${key}¶${leafNodeKey}`, depth, branchValues);
                    }
                }
            }
            else {
                let leafNodes = Object.keys(node);

                for (const leaf of leafNodes) {
                    let branchValues;
                    if (node[leaf]) {
                        branchValues = this._jsonToValueArray(node[leaf]);
                    }
                    this.createLeaf(leaf, element, `${key}¶${leaf}`, depth, branchValues);
                }
            }
        }
        else if (Array.isArray(node)) {
            for (let nodeKey in node) {
                let branch = document.createElement(this.listType);
                element.append(this.createBranch(node[nodeKey], branch, `${key}¶${nodeKey}`, newDepth));
            }
        }
        else if (node !== null && typeof node === 'object') {
            let nodeKeys = Object.keys(node);
            const branches = [];
            for (const nodeKey of nodeKeys) {

                let trunk = document.createElement('li');
                trunk.classList.add('cursor-pointer');
                trunk.style.position = 'relative';
                trunk.style.left = '2px';
                trunk.dataset.branchKey = `${key}¶${nodeKey}`;
                trunk.dataset.depth = depth;

                let branch = document.createElement('details');
                branch.classList.add('flk-branch');
                /** set values as we go down, for easy filtering */
                let branchValueId = variableUID();

                branch.dataset.branchValueId = branchValueId;
                this._treeValues[branchValueId] = [nodeKey].concat(this._jsonToValueArray(node[nodeKey])); /** also want to key above. */

                /** fix offset for custom icon */
                branch.style.position = 'relative';
                branch.style.top = '-3px';
                branch.classList.add('cursor-pointer');
                let branchName = document.createElement('summary');
                branchName.classList.add('flk-tree-summary');

                let appliedText = this.createTextTag(nodeKey, branchName);
                branch.dataset.leafKey = nodeKey;

                if (appliedText.commentText) {
                    branch.title = `${appliedText.titleText} ${appliedText.commentText}`;
                }
                else {
                    branch.title = appliedText.titleText;
                }

                branch.append(branchName);
                trunk.append(this.createBranch(node[nodeKey], branch, `${key}¶${nodeKey}`, newDepth));
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
            this.createLeaf(node, element, key, depth);
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
            case "comment": {
                this.commentType = newValue;
                break;
            }
            case "invert-comment": {
                if (typeof newValue === 'boolean') {
                    this.invertComment = newValue

                }
                else {
                    this.invertComment = newValue.toString().toLowerCase() === 'true';
                }
                break;
            }
            case "search-style": {
                this.searchStyle = newValue;
                this.resetTree(false);
                this.filterTree();
                break;
            }
            case "filter": {
                this.setFilter(newValue);
                break;
            }
        }
        if (!['filter', 'search-style'].includes(name) && !this._setup) {
            this.init();
        }
    }

    connectedCallback() {
        /** Check if there is contents already there. */
        this.setContents(this.getAttribute('contents'));
        this.commentType = this.getAttribute('comment') ?? '';
        this.iconSet = this.getAttribute('icon-set') ?? 'file';
        this.searchStyle = this.getAttribute('search-style') ?? 'highlight';
        this.maxDepth = this.getAttribute('max-depth') ? parseInt(this.getAttribute('max-depth')) : -1;
        this.invertComment = this.getAttribute('invert-comment') ? true : false;
        this.setFilter(this.getAttribute('filter'));

        this.style.display = 'block';
        this.style.maxWidth = 'fit-content';
        this.style.margin = '0 1rem 0 0';
        this.base.addEvent('.flk-branch', 'click', this.emitNodeToggle);
        this.base.addEvent('.flk-tree-summary', 'click', this.stopCollapseWhenJustFiltered)

        if (!this._setup) {
            this.init();
        }
    };

    disconnectedCallback() {
        this.base.removeEvents(this);
    };

    /** You need to use this way to use the tree nav*/
    init() {
        this.createHtml();
        this.base.render(this);
        this._setup = false;
    };
}
