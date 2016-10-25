import EventEmitter from 'eventemitter3';
import $ from 'jquery';
import _ from "lodash/wrapperLodash";
import mixin from 'lodash/mixin';
import flattenDeep from 'lodash/flattenDeep';

mixin(_, {flattenDeep, mixin});


class BeeCore {
    constructor() {
        let _resolve;

        this.isExperienceEditor = false;
        this.mediator = new EventEmitter();
        this.promise = new Promise(res => _resolve = res);

        // Wait for DOM loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.isExperienceEditor = !!(window.Sitecore && window.Sitecore.WebEditSettings && window.Sitecore.WebEditSettings.editing);

            _resolve();
        }, false);


        // Wait for window loaded
        window.addEventListener('load', () => {
            if (!this.isExperienceEditor) {
                return;
            }

            require('./chromeTypes');
        }, false);
    }


    /**
     * Register events what should be transferred through DOM with jquery
     * */
    _registerDOMEvents(...events) {
        if (!$) {
            return;
        }

        events.forEach(event => this.mediator.on(event, (chrome, ...rest) => {
            let element;

            // If no Chrome available - event cannot be fired through DOM
            if (!(chrome instanceof Sitecore.PageModes.Chrome)) {
                return;
            }

            element = $(chrome.element);

            // If event from placeholder
            if ('placeholder' === chrome.type.key()) {
                //and we have rendering chrome instance
                if (rest[0].type instanceof Sitecore.PageModes.ChromeTypes.Rendering) {

                    // Trigger customEvent on rendering DOM element
                    $(rest[0].element[0]).trigger(event, [chrome, ...rest]);

                } else {

                    // Trigger customEvent on placeholder parent DOM element
                    element.first().parent().trigger(event, [chrome, ...rest]);

                }
            } else if (element.length) {
                // Trigger customEvent on Chrome DOM element
                element.trigger(event, [chrome, ...rest]);
            } else {
                throw `[bee-core] Cannot transfer event ${event} on DOM because of no DOM element specified.`;
            }
        }));
    }

    /**
     * Generate Abstract Components tree
     *
     * @return {Object}
     * */
    generateACT(selector) {
        const OPEN = `[kind='open']`;
        const CLOSE = `[kind='close']`;
        const PLACEHOLDER = `code[chrometype='placeholder']`;
        const RENDERING = `code[chrometype='rendering']`;
        const CHROME_SELECTOR = `${PLACEHOLDER}${OPEN}, ${RENDERING}${OPEN}, ${PLACEHOLDER}${CLOSE}, ${RENDERING}${CLOSE}`;

        let chromes,
            root,
            DOM,

            _level = 0;

        if ('development' === process.env.NODE_ENV) {
            console.time('ACT generated');
        }

        root = {type: 'root'};

        DOM = cloneDOM(selector);

        chromes = generateFlattenChromeList(DOM);

        if (!chromes.length) {
            return;
        }

        flattenListToACT(chromes, root);

        root.template = DOM.outerHTML;

        if ('development' === process.env.NODE_ENV) {
            console.timeEnd('ACT generated');
        }

        return root;


        /**
         * Clone HTML Element
         *
         * @param {string} selector
         *
         * @return {HTMLElement}
         * */
        function cloneDOM(selector) {
            let el = document.querySelector(selector);

            if (!el) {
                throw `[beeCore] Cannot find element with selector "${selector}"`;
            }

            return el.cloneNode(true);
        }


        /**
         * Generate flatten list of open/close chrome rags
         *
         * @param {jQuery} DOM
         *
         * @return {Array} Chromes list
         * */
        function generateFlattenChromeList(DOM) {
            let result = [],
                chromeElements = DOM.querySelectorAll(CHROME_SELECTOR);

            if (!chromeElements.length) {
                return result;
            }

            Array.prototype.forEach.call(chromeElements, function (el) {
                let type,
                    isMatching;

                if (matchesSelector(el, OPEN)) {
                    _level++;
                } else if (matchesSelector(el, CLOSE)) {
                    _level--;
                    return;
                }

                type = resolveChromeType(el);
                isMatching = ['rendering', 'placeholder'].indexOf(type) > -1;

                if (isMatching) {
                    result.push({
                        level  : _level,
                        type   : type,
                        id     : el.id,
                        openTag: el
                    });
                }
            });

            return result;
        }


        /**
         * Convert flatten chrome elements list to Abstract Components Tree
         *
         * @param {Array<Object>} chromeElements    Flatten list of chrome objects
         * @param {object} data                     ACT Root object
         *
         * @void
         * */
        function flattenListToACT(chromeElements, data) {
            (function loop(collection, scopeLevel) {
                let chrome = chromeElements.shift(),
                    scopeCollection = [],
                    result;

                result = {
                    id  : chrome.id,
                    type: chrome.type
                };

                if ('placeholder' === chrome.type) {
                    result.renderings = scopeCollection;
                }

                // Push me to the scope collection;
                if (collection instanceof Array) {
                    collection.push(result);
                } else {
                    collection[chrome.id] = result;
                }


                // If next item is child - open new scope
                if (chromeElements.length && chromeElements[0].level > scopeLevel) {
                    loop(chrome.type === 'placeholder' ? scopeCollection : result, scopeLevel + 1); // jump in
                }

                result.openTag = chrome.openTag;
                result.closeTag = findNext(chrome.openTag, `${chrome.type === 'placeholder' ? PLACEHOLDER : RENDERING}${CLOSE}`);
                result.template = getTemplate(result);

                // Go to next sibling
                if (chromeElements.length && chromeElements[0].level === scopeLevel) {
                    loop(collection, scopeLevel);
                }
            })(data, 1);
        }


        /**
         * Resolve type of chrome element
         *
         * @param {HTMLElement} el
         *
         * @return {string}     Chrome type
         * */
        function resolveChromeType(el) {
            if (matchesSelector(el, PLACEHOLDER)) {
                return 'placeholder';
            } else if (matchesSelector(el, RENDERING)) {
                return 'rendering';
            }
        }


        /**
         * Get HTML template string of related Chrome
         *
         * @param {object} chrome
         *
         * @return {string}     Template string
         * */
        function getTemplate(chrome) {
            let content, phantom, temp, parentElement;

            content = nextUntil(chrome.openTag, chrome.closeTag);
            temp = evalHTML('<div />');

            if ('placeholder' === chrome.type) {
                parentElement = chrome.openTag.parentElement;
                phantom = evalHTML(`<ee-phantom-placeholder :link="'${chrome.id}'"></ee-phantom-placeholder>`);
                parentElement.parentElement.insertBefore(phantom, parentElement);

                parentElement.appendChild(evalHTML(`<template v-for="rendering in data.renderings"><ee-phantom-rendering :data="rendering"></ee-phantom-rendering></template>`));

                content = [parentElement]
            }

            // Detach chrome tags
            document.createDocumentFragment().appendChild(chrome.openTag);
            document.createDocumentFragment().appendChild(chrome.closeTag);

            //_.flattenDeep([openTag, content, closeTag]).forEach(el => temp.appendChild(el));
            content.forEach(el => temp.appendChild(el));

            return temp.innerHTML;
        }


        /**
         * Evaluate HTML string to live DOM
         *
         * @param {string} data     html string
         *
         * @return {HTMLElement | Array<HTMLElement>}
         * */
        function evalHTML(data) {
            let temp = document.createElement('div');

            temp.innerHTML = data;

            return temp.childNodes.length > 1 ? temp.childNodes : temp.firstChild;
        }


        /**
         * Check is selector matches to provided element
         *
         * @param {HTMLElement} el
         *
         * @param {string | HTMLElement} selector
         * */
        function matchesSelector(el, selector) {
            let fn = Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector;

            matchesSelector = function (el, selector) {
                if (el.nodeType !== 1) {
                    return false;
                }

                return 'object' === typeof selector
                    ? el === selector
                    : fn.call(el, selector);
            };

            return matchesSelector.apply(null, arguments);
        }


        /**
         * Get next sibling nodes until element with matched selector
         *
         * @param {HTMLElement} el                  Start element
         * @param {string | HTMLElement} selector   Selector of End element
         *
         * @return {Array<HTMLElement>}
         * */
        function nextUntil(el, selector) {
            let result = [];

            while (el = el.nextSibling) {
                if (matchesSelector(el, selector)) {
                    break;
                }

                result.push(el);
            }

            return result;
        }


        /**
         * Find first matched sibling after provided element
         *
         * @param {HTMLElement} el
         * @param {string|HTMLElement} selector
         *
         * @return {HTMLElement | null}
         * */
        function findNext(el, selector) {
            while (el = el.nextSibling) {
                if (matchesSelector(el, selector)) {
                    return el;
                }
            }

            return null;
        }
    }
}

module.exports = new BeeCore();