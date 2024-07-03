import { returnEventWithTopLevelElement } from '../flightkit-functions/domTraversal';
import { chevronDownIcon, chevronUpIcon, rehydrateSvg } from '../flightkit-functions/icons';
import { BaseComponent } from './extensions/base_component';

export class FlightkitDropdown extends HTMLElement {
    base;
    _buttonId;
    _drawerId;
    _iconId;

    constructor() {
        super();
        this.base = new BaseComponent();
    }

    /** grab inner HTML from here */
    connectedCallback() {
        this.style.position = 'relative';
        this.style.display = 'flex'; /** fixes drawer positioning */
        this.style.width = 'fit-content'; /** fixes flex taking up 100% */
        this._buttonId = this.base.generateId();

        const btnElement = document.createElement('button');
        btnElement.setAttribute('type', 'button');
        btnElement.classList.add('row');
        btnElement.id = this._buttonId;

        const btnTextElement = document.createElement('span');
        btnTextElement.classList.add("self-align-center");
        btnTextElement.innerText = this.getAttribute('text');

        this._iconId = this.base.generateId();

        const iconElement = document.createElement('span');
        iconElement.classList.add("self-align-center");
        const closedIcon = rehydrateSvg(chevronDownIcon);

        const openIcon = rehydrateSvg(chevronUpIcon);
        openIcon.classList.add('hidden');

        iconElement.append(closedIcon, openIcon);
        iconElement.id = this._iconId;

        btnElement.append(btnTextElement, iconElement);

        this._drawerId = this.base.generateId();
        const drawerElement = document.createElement('div');
        drawerElement.id = this._drawerId;
        drawerElement.classList.add('shadow', 'inline-block', 'bg-white');
        drawerElement.style.position = 'absolute';
        drawerElement.style.zIndex = '1040';

        /** a template tag will not be rendered. It will be nicer this way. */
        const templateElement = this.querySelector('template');

        /**innerHTML works in vanilla, but firstChild due to Vue3.*/
        if (templateElement.innerHTML.length) {
            drawerElement.innerHTML = templateElement.innerHTML;
        }
        else {
            drawerElement.append(templateElement.firstChild);
        }

        drawerElement.style.display = 'none';

        /** set it to be rendered */
        this.component = [btnElement, drawerElement];

        this.base.addEvent(`#${this._buttonId}`, 'click', this.toggleMenu);

        const bodyEl = document.querySelector('body');

        if (bodyEl.getAttribute('flk-close-dropdown') !== '') {
            bodyEl.setAttribute('flk-close-dropdown', '');
            bodyEl.addEventListener('click', this.closeAllDropdownButtons);
        }

        this.base.render(this);
    };
    disconnectedCallback() {
        this.base.removeEvents(this);
        const allDropdownButtons = document.querySelectorAll('flk-dropdown');

        if (!allDropdownButtons || !allDropdownButtons.length) {
            const bodyEl = document.querySelector('body');
            bodyEl.removeAttribute('flk-close-dropdown');
            bodyEl.removeEventListener('click', this.closeAllDropdownButtons);
        }
    }

    toggleMenu(event) {
        const topLevelElement = returnEventWithTopLevelElement(event);
        const ftElement = topLevelElement.target;
        const drawerToToggleId = ftElement._drawerId;
        const drawerToToggle = document.getElementById(drawerToToggleId);

        const drawerOpen = drawerToToggle.style.display !== 'none';
        drawerToToggle.style.display = drawerOpen ? 'none' : 'block';

        const specifiedWidth = ftElement.getAttribute('drawer-width');
        const alignRight = typeof ftElement.getAttribute('right') === 'string';

        if (alignRight) {
            drawerToToggle.style.right = "0px";
        }

        drawerToToggle.style.top = ftElement.offsetHeight + "px";
        drawerToToggle.style.width = specifiedWidth || ftElement.offsetWidth + "px";

        const iconToToggleId = ftElement._iconId;
        const iconToToggle = document.getElementById(iconToToggleId);

        /** because I checked if the previous state was open then we close.
         * So therefor we need to do the opposite, if it _was_ open, now its closed.
         */

        if (drawerOpen) {
            iconToToggle.childNodes[0].classList.remove('hidden');
            iconToToggle.childNodes[1].classList.add('hidden');
        }
        else {
            iconToToggle.childNodes[0].classList.add('hidden');
            iconToToggle.childNodes[1].classList.remove('hidden');
        };
    }

    _closeDropdown() {
        const drawerToToggleId = this._drawerId;
        const drawerToToggle = document.getElementById(drawerToToggleId);
        const drawerOpen = drawerToToggle.style.display !== 'none';

        if (drawerOpen) {
            const iconToToggleId = this._iconId;
            const iconToToggle = document.getElementById(iconToToggleId);

            drawerToToggle.style.display = 'none';
            iconToToggle.childNodes[0].classList.remove('hidden');
            iconToToggle.childNodes[1].classList.add('hidden');
        }
    }

    closeAllDropdownButtons(event) {
        const topLevelElement = returnEventWithTopLevelElement(event, 'flk-dropdown');
        const ftElement = topLevelElement.target;

        const allDropdownButtons = document.querySelectorAll('flk-dropdown');

        if (ftElement) {
            for (const dropdownButton of allDropdownButtons) {
                /**if you click on a dropdown. close the others */
                if (ftElement._buttonId !== dropdownButton._buttonId) {
                    const drawerToToggleId = dropdownButton._drawerId;
                    const drawerToToggle = document.getElementById(drawerToToggleId);
                    const drawerOpen = drawerToToggle.style.display !== 'none';

                    if (drawerOpen) {
                        dropdownButton._closeDropdown();
                    }
                }
            }
        } else {
            /** close all dropdowns */
            for (const dropdownButton of allDropdownButtons) {
                dropdownButton._closeDropdown();
            }
        }
    }
}

