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
        let flatChromesList, clonedHTML, tree = {};

        if ('development' === process.env.NODE_ENV) {
            console.time('ACT generated');
        }

        clonedHTML = dom.clone(element);

        flatChromesList = ACT.generateFlatChromeList(clonedHTML);

        ACT.flatListToACT(tree, flatChromesList, this.placeholderTemplate, this.renderingTemplate);

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
     * @param {Function} placeholderTemplate            Placeholder Template function
     * @param {Function} renderingTemplate              rendering Template function
     *
     * @void
     * */
    static flatListToACT(root, chromeElements, placeholderTemplate, renderingTemplate) {
        loop(root, 1);

        /**
         * @param {Array<ChromeDTO>} collection
         * @param {Number} scopeLevel
         * */
        function loop(collection, scopeLevel) {
            /** @type {FlatChromeDTO} */
            let chrome = chromeElements.shift();

            /** @type {Array<ChromeDTO>} */
            let scopeCollection = [];

            /** @type {ChromeDTO} */
            let result = {
                id     : chrome.id,
                type   : chrome.type,
                openTag: chrome.openTag,
            };

            const CLOSE_TAG_SELECTOR = chrome.type === 'placeholder'
                ? PLACEHOLDER_SELECTOR : RENDERING_SELECTOR + CLOSE_SELECTOR;

            if ('placeholder' === chrome.type) {
                result.renderings = scopeCollection;
            }

            // Assign to the scope
            if (collection instanceof Array) {
                collection.push(result);
            } else {
                collection[chrome.id] = result;
            }

            // If next item is child - open new scope
            if (chromeElements.length && chromeElements[0].level > scopeLevel) {
                // jump in
                loop(
                    chrome.type === 'placeholder' ? scopeCollection : result,
                    scopeLevel + 1
                );
            }

            result.closeTag = dom.nextMatch(chrome.openTag, CLOSE_TAG_SELECTOR);
            result.template = ACT.extractTemplate(result, placeholderTemplate, renderingTemplate);

            // Go to next sibling
            if (chromeElements.length && chromeElements[0].level === scopeLevel) {
                loop(collection, scopeLevel);
            }
        }
    }


    /**
     * Extract html string for provided ChromeDTO
     *
     * @param {ChromeDTO} chrome
     * @param {Function} placeholderTemplate    Placeholder Template function
     * @param {Function} renderingTemplate      rendering Template function
     *
     * @return {string} Template string
     * */
    static extractTemplate(chrome, placeholderTemplate, renderingTemplate) {
        switch (chrome.type) {
            case 'placeholder':
                return ACT.extractPlaceholderTemplate(chrome, placeholderTemplate, renderingTemplate);
            case 'rendering':
                return ACT.extractRenderingTemplate(chrome);
        }
    }

    static extractPlaceholderTemplate(chrome, placeholderTemplate, renderingTemplate) {
        /** @type {HTMLElement} */
        let temp = dom.eval('<div />');

        /** @type {HTMLElement} */
        let placeholderElem = chrome.openTag.parentElement;

        /** @type {HTMLElement} */
        let placeholderComponent = dom.eval(placeholderTemplate(chrome));

        /** @type {HTMLElement} */
        let renderingComponentTag = dom.eval(renderingTemplate(chrome));


        dom.detach(chrome.openTag);
        dom.detach(chrome.closeTag);

        placeholderElem.parentElement.insertBefore(placeholderComponent, placeholderElem);
        placeholderElem.appendChild(renderingComponentTag);
        placeholderElem.appendChild(chrome.closeTag);
        placeholderElem.insertBefore(chrome.openTag, placeholderElem.children[0]);

        temp.appendChild(placeholderElem);


        return temp.innerHTML;
    }

    static extractRenderingTemplate(chrome) {
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