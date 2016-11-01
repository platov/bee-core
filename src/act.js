'use strict';

/**
 * Flat Chrome DTO
 *
 * @typedef {Object} FlatChromeDTO
 *
 * @property {String}       id
 * @property {string}       type
 * @property {HTMLElement}  openTag
 * @property {number}       level
 * */


/**
 * Chrome DTO
 *
 * @typedef {Object} ChromeDTO
 *
 * @property {String}           id
 * @property {String}           type
 * @property {HTMLElement}      openTag
 * @property {HTMLElement}      closeTag
 * @property {String}           template
 * @property {Array<ChromeDTO>} [renderings]
 * */

import dom from './utils/dom';

const OPEN_SELECTOR = `[kind='open']`;
const CLOSE_SELECTOR = `[kind='close']`;
const PLACEHOLDER_SELECTOR = `code[chrometype='placeholder']`;
const RENDERING_SELECTOR = `code[chrometype='rendering']`;
const CHROME_SELECTOR = `${PLACEHOLDER_SELECTOR}${OPEN_SELECTOR}, ${RENDERING_SELECTOR}${OPEN_SELECTOR}, ${PLACEHOLDER_SELECTOR}${CLOSE_SELECTOR}, ${RENDERING_SELECTOR}${CLOSE_SELECTOR}`;

/**
 * Abstract Components Tree Class
 * */
class ACT {
    constructor(options) {
        this.placeholderTemplate = options.placeholderTemplate;
        this.renderingTemplate = options.renderingTemplate;
    }

    generate(element) {
        let flatChromesList,
            clonedHTML,
            tree = {renderings: []};

        if ('development' === process.env.NODE_ENV) {
            console.time('ACT generated');
        }

        clonedHTML = dom.clone(element);

        flatChromesList = ACT.generateFlatChromeList(clonedHTML);

        this.flatListToACT(tree, flatChromesList, this.placeholderTemplate, this.renderingTemplate);

        tree.template = clonedHTML.outerHTML;

        if ('development' === process.env.NODE_ENV) {
            console.timeEnd('ACT generated');
        }

        return tree;
    }


    /**
     * Resolve type of chrome element
     *
     * @param {HTMLElement} el
     *
     * @return {string} Chrome type
     * */
    static getElementChromeType(el) {
        if (dom.is(el, PLACEHOLDER_SELECTOR)) {
            return 'placeholder';
        } else if (dom.is(el, RENDERING_SELECTOR)) {
            return 'rendering';
        }
    }


    /**
     * Generate flat list of open/close chrome rags
     *
     * @param {HTMLElement} el
     *
     * @return {Array<FlatChromeDTO>} Chromes list
     * */
    static generateFlatChromeList(el) {
        /** @type {Array<FlatChromeDTO>} */
        let result = [];

        /** @type Array<HTMLElement>*/
        let chromeElements = dom.find(CHROME_SELECTOR, el);

        let level = 0;

        if (!chromeElements.length) {
            return result;
        }

        Array.prototype.forEach.call(chromeElements, el => {
            /** @type {String} */
            let type;

            /** @type {Boolean} */
            let isMatching;


            if (dom.is(el, OPEN_SELECTOR)) {
                level++;
            } else if (dom.is(el, CLOSE_SELECTOR)) {
                level--;
                return;
            } else {
                throw '[bee-core/ACT] Incorrect type of Chrome element';
            }

            type = ACT.getElementChromeType(el);
            isMatching = ['rendering', 'placeholder'].indexOf(type) > -1;

            if (!isMatching) {
                return;
            }

            result.push(/** @type FlatChromeDTO */{
                id     : el.id,
                openTag: el,
                type,
                level
            });
        });

        return result;
    }


    /**
     * Convert flat chrome elements list to Abstract Components Tree
     *
     * @param {Object} root                             Root object
     * @param {Array<FlatChromeDTO>} chromeElements     Flat list of chrome objects
     *
     * @void
     * */
    flatListToACT(root, chromeElements) {
        loop.call(this, root, 1);

        /**
         * @param {ChromeDTO} scope
         * @param {Number} scopeLevel
         * */
        function loop(scope, scopeLevel) {
            /** @type {FlatChromeDTO} */
            let chrome = chromeElements.shift();

            /** @type {ChromeDTO} */
            let result = {
                id     : chrome.id,
                type   : chrome.type,
                openTag: chrome.openTag
            };

            const CLOSE_TAG_SELECTOR = chrome.type === 'placeholder'
                ? PLACEHOLDER_SELECTOR : RENDERING_SELECTOR + CLOSE_SELECTOR;

            if ('placeholder' === chrome.type) {
                result.renderings = [];
            }

            // Assign to the scope
            if ('rendering' === chrome.type) {
                scope.renderings.push(result);
            } else {
                scope[chrome.id] = result;
            }

            // If next item is child - open new scope
            if (chromeElements.length && chromeElements[0].level > scopeLevel) {
                // jump in
                loop.call(this, result, scopeLevel + 1);
            }

            result.closeTag = dom.nextMatch(chrome.openTag, CLOSE_TAG_SELECTOR);
            result.template = this.extractTemplate(result);

            // Go to next sibling
            if (chromeElements.length && chromeElements[0].level === scopeLevel) {
                loop.call(this, scope, scopeLevel);
            }
        }
    }


    /**
     * Extract html string for provided ChromeDTO
     *
     * @param {ChromeDTO} chrome
     *
     * @return {string} Template string
     * */
    extractTemplate(chrome) {
        switch (chrome.type) {
            case 'placeholder':
                return this.extractPlaceholderTemplate(chrome);
            case 'rendering':
                return this.extractRenderingTemplate(chrome);
        }
    }

    extractPlaceholderTemplate(chrome) {
        /** @type {HTMLElement} */
        let temp = dom.eval('<div />');

        /** @type {HTMLElement} */
        let placeholderElem = chrome.openTag.parentElement;

        /** @type {HTMLElement} */
        let placeholderComponent = dom.eval(this.placeholderTemplate(chrome));

        /** @type {HTMLElement} */
        let renderingComponentTag = dom.eval(this.renderingTemplate(chrome));


        dom.detach(chrome.openTag);
        dom.detach(chrome.closeTag);

        placeholderElem.parentElement.insertBefore(placeholderComponent, placeholderElem);
        placeholderElem.appendChild(renderingComponentTag);

        temp.appendChild(placeholderElem);


        return temp.innerHTML;
    }

    extractRenderingTemplate(chrome) {
        /** @type {HTMLElement} */
        let temp = dom.eval('<div />');

        /** @type {Array<HTMLElement>} */
        let content = dom.nextUntil(chrome.openTag, chrome.closeTag);


        dom.detach(chrome.openTag);
        dom.detach(chrome.closeTag);

        content.forEach(el => temp.appendChild(el));


        return temp.innerHTML;
    }
}

export default ACT;