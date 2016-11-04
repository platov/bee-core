'use strict';

/**
 * Chrome DTO
 *
 * @typedef {Object} ChromeDTO
 *
 * @property {String}           id
 * @property {String}           type
 * @property {String}           fieldType
 * @property {HTMLElement}      [openTag]
 * @property {HTMLElement}      [closeTag]
 * @property {HTMLElement}      [tag]
 * @property {String}           template
 * @property {Array<ChromeDTO>} [renderings]
 * @property {Boolean}          isFragment
 * */

import dom from './utils/dom';

const OPEN_SELECTOR = `[kind='open']`;
const CLOSE_SELECTOR = `[kind='close']`;
const PLACEHOLDER_SELECTOR = `code[chrometype='placeholder']`;
const RENDERING_SELECTOR = `code[chrometype='rendering']`;
const FIELD_SELECTOR = `code[chrometype='field']`;
const FIELD2_SELECTOR = `.scWebEditInput`;
const CHROME_SELECTOR = `${PLACEHOLDER_SELECTOR}${OPEN_SELECTOR}, 
                        ${RENDERING_SELECTOR}${OPEN_SELECTOR},
                        ${FIELD_SELECTOR}${OPEN_SELECTOR},
                        ${FIELD_SELECTOR}${CLOSE_SELECTOR},
                        ${FIELD2_SELECTOR},
                        ${RENDERING_SELECTOR}${CLOSE_SELECTOR}, 
                        ${PLACEHOLDER_SELECTOR}${CLOSE_SELECTOR}`;

/**
 * Abstract Components Tree Class
 * */
class ACT {

    /**
     * @param {Object} options
     * @param {Function} options.placeholderTemplate    Template function for Placeholder Chrome
     * @param {Function} options.renderingTemplate      Template function for Rendering Chrome
     * @param {Function} options.fieldTemplate          Template function for Field Chrome
     * */
    constructor(options) {
        this.placeholderTemplate = options.placeholderTemplate;
        this.renderingTemplate = options.renderingTemplate;
        this.fieldTemplate = options.fieldTemplate;
    }

    /**
     * Check chrome element is fragment type
     *
     * @param {HTMLElement} el Chrome element
     *
     * @return {Boolean}
     * */
    static chromeElementIsFragment(el) {
        return dom.is(el, `code${OPEN_SELECTOR}, code${CLOSE_SELECTOR}`);
    }


    /**
     * Resolve type of chrome element
     *
     * @param {HTMLElement} el
     *
     * @return {String} Chrome type
     * */
    static getChromeElementType(el) {
        if (dom.is(el, PLACEHOLDER_SELECTOR)) {
            return 'placeholder';
        } else if (dom.is(el, RENDERING_SELECTOR)) {
            return 'rendering';
        } else if (dom.is(el, `${FIELD_SELECTOR}, ${FIELD2_SELECTOR}`)) {
            return 'field';
        } else {
            throw '[bee-core/ACT] Cannot resolve element chrome type';
        }
    }


    /**
     * Get field type of chrome element
     *
     * Chrome has type like `placeholder, rendering, field`.
     * If Chrome type is `field` then it also should contain fieldType like `image, rich text, single-line text`
     *
     * @param {HTMLElement} el Chrome element
     *
     * @return {String} Field type
     * */
    static getChromeElementFieldType(el) {
        return el.getAttribute('scfieldtype')
    }


    /**
     * Generate flat list of open/close chrome rags
     *
     * @param {HTMLElement} el
     *
     * @return {Array<ChromeDTO>} Chromes list
     * */
    static generateFlatChromeList(el) {
        /** @type {Array<ChromeDTO>} */
        let result = [];

        /** @type Array<HTMLElement>*/
        let chromeElements = dom.find(CHROME_SELECTOR, el);

        /** @type {Number} */
        let level = 0;

        if (!chromeElements.length) {
            return result;
        }

        Array.prototype.forEach.call(chromeElements, el => {
            /** @type {String} */
            let type = ACT.getChromeElementType(el);

            /** @type {Boolean} */
            let chromeElementIsFragment = ACT.chromeElementIsFragment(el);

            /** @type {String} */
            let id = el.id.replace('_edit', '');

            /** @type {ChromeDTO} */
            let obj;


            /*
             * If closing tag - just decrement level and continue
             * */
            if (dom.is(el, CLOSE_SELECTOR)) {
                level--;
                return;
            }

            if (chromeElementIsFragment) {
                obj = {
                    isFragment: true,
                    openTag   : el,
                    level     : ++level,
                    id,
                    type
                };
            } else {
                obj = {
                    isFragment: false,
                    tag       : el,
                    level     : level + 1,
                    id,
                    type
                };
            }


            /*
             * If type of Chrome is `field` the get subType of `field`
             * */
            if ('field' === obj.type) {
                obj.fieldType = ACT.getChromeElementFieldType(el);
            }

            result.push(obj);
        });

        return result;
    }


    /**
     * Generate Abstract Component tree from provided DOM
     *
     * @param {HTMLElement} el
     * */
    generate(el) {
        /** @type {Array<ChromeDTO>} */
        let flatChromesList;

        /** @type {HTMLElement} */
        let clonedHTML;

        /** @type {Object} */
        let tree = {renderings: []};


        if ('development' === process.env.NODE_ENV) {
            console.time('ACT generated');
        }

        clonedHTML = dom.clone(el);

        flatChromesList = ACT.generateFlatChromeList(clonedHTML);

        this.flatListToACT(tree, flatChromesList);

        tree.template = clonedHTML.outerHTML;

        if ('development' === process.env.NODE_ENV) {
            console.timeEnd('ACT generated');
        }

        return tree;
    }


    /**
     * Convert flat chrome elements list to Abstract Components Tree
     *
     * @param {Object} root                         Root object (mutates)
     * @param {Array<ChromeDTO>} chromeElements     Flat list of chrome objects
     *
     * @void
     * */
    flatListToACT(root, chromeElements) {
        loop.call(this, root, 1);

        /**
         * Recursive traveling through flat Chromes List
         *
         * @param {ChromeDTO} scopeObj
         * @param {Number} scopeLevel
         * */
        function loop(scopeObj, scopeLevel) {
            /** @type {ChromeDTO} */
            let chrome = chromeElements.shift();


            if ('placeholder' === chrome.type) {
                chrome.renderings = [];
            }

            // Assign to the scope
            if ('rendering' === chrome.type) {
                scopeObj.renderings.push(chrome);
            } else {
                scopeObj[chrome.id] = chrome;
            }

            // If next item is child - open new scope
            if (chromeElements.length && chromeElements[0].level > scopeLevel) {
                // jump in
                loop.call(this, chrome, scopeLevel + 1);
            }

            // if Chrome is Fragment - find his close tag
            if (chrome.isFragment) {
                chrome.closeTag = dom.nextMatch(chrome.openTag, `code[chrometype='${chrome.type}']${CLOSE_SELECTOR}`);
            }

            // Extract Chrome template
            chrome.template = this.extractTemplate(chrome);

            // Go to next sibling
            if (chromeElements.length && chromeElements[0].level === scopeLevel) {
                loop.call(this, scopeObj, scopeLevel);
            }
        }
    }


    /**
     * Extract html string for provided Chrome
     *
     * @param {ChromeDTO} chrome
     *
     * @return {String} Template string
     * */
    extractTemplate(chrome) {
        switch (chrome.type) {
            case 'placeholder':
                return this.extractPlaceholderTemplate(chrome);
            case 'rendering':
                return this.extractRenderingTemplate(chrome);
            case 'field':
                return this.extractFieldTemplate(chrome);
            default:
                throw `[bee-core/ACT] Got unknown Chrome type while extracting template`;
        }
    }


    /**
     * Extract Placeholder template
     *
     * @param {ChromeDTO} chrome
     *
     * @return {String}
     * */
    extractPlaceholderTemplate(chrome) {
        /** @type {HTMLElement} */
        let temp = dom.eval('<div />');

        /** @type {HTMLElement} */
        let parentEl = chrome.openTag.parentElement;

        /** @type {HTMLElement} */
        let placeholderComponent = dom.eval(this.placeholderTemplate(chrome));

        /** @type {HTMLElement} */
        let renderingComponentTag = dom.eval(this.renderingTemplate(chrome));

        if (parentEl.children > 2) {
            console.error(`[bee-core/ACT] Placeholder parent element should contain only placeholder chrome tags. 
            Found ${parentEl.children - 2} unexpected element(s)`, chrome);
            return '';
        }

        dom.detach(chrome.openTag);
        dom.detach(chrome.closeTag);

        dom.insertBefore(parentEl, placeholderComponent);
        parentEl.appendChild(renderingComponentTag);

        temp.appendChild(parentEl);

        return temp.innerHTML;
    }


    /**
     * Extract Rendering template
     *
     * @param {ChromeDTO} chrome
     *
     * @return {String}
     * */
    extractRenderingTemplate(chrome) {
        /** @type {HTMLElement} */
        let temp = dom.eval('<div />');

        /** @type {Array<HTMLElement>} */
        let content = dom.nextUntil(chrome.openTag, chrome.closeTag, true);


        dom.detach(chrome.openTag);
        dom.detach(chrome.closeTag);

        if (content.length === 0) {
            console.warn(`[bee-core/ACT] No elements found between fragment Chrome tags while extracting Rendering template`, chrome);
            return '';
        }

        if (content.length > 1) {
            console.error(`[bee-core/ACT] Unexpected multiple elements found between fragment Chrome tags while extracting Rendering template`, chrome);
            return '';
        }

        temp.appendChild(content[0]);


        return temp.innerHTML;
    }


    /**
     * Extract Field template
     *
     * @param {ChromeDTO} chrome
     *
     * @return {String}
     * */
    extractFieldTemplate(chrome) {
        /** @type {HTMLElement} */
        let fieldComponent = dom.eval(this.fieldTemplate(chrome));

        if (chrome.isFragment) {
            /** @type {HTMLElement} */
            let temp = dom.eval('<div />');

            /** @type {Array<HTMLElement>} */
            let content = dom.nextUntil(chrome.openTag, chrome.closeTag, true);

            dom.insertBefore(chrome.openTag, fieldComponent);

            dom.detach(chrome.openTag);
            dom.detach(chrome.closeTag);

            if (content.length === 0) {
                console.error(`[bee-core/ACT] Element not found between fragment Chrome tags while extracting Field template`, chrome);
                return '';
            }

            if (content.length > 1) {
                console.error(`[bee-core/ACT] Unexpected multiple elements found between fragment Chrome tags while extracting Field template`, chrome);
                return '';
            }

            temp.appendChild(content[0]);

            return temp.innerHTML;
        } else {
            dom.insertBefore(chrome.tag, fieldComponent);

            dom.detach(chrome.tag);

            return chrome.tag.outerHTML;
        }
    }
}

export default ACT;