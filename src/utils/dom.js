'use strict';

/**
 * Dom manipulations utility
 * */
let domUtils = {
    /**
     * Find element
     *
     * @param {string} selector
     * @param {HTMLElement} context
     *
     * @return {HTMLElement}
     * */
    find(selector, context) {
        let el = (context || document).querySelectorAll(selector);

        if (!el || !el.length) {
            throw `[beeCore] Cannot find element with selector "${selector}"`;
        }

        return el;
    },


    /**
     * Clone HTML Element
     *
     * @param {String} target
     *
     * @return {HTMLElement}
     * */
    clone(target) {
        let el;

        if ('string' === typeof target) {
            el = this.find(target)[0];
        } else if (target instanceof HTMLElement) {
            el = target;
        } else {
            throw '[beeCore.dom.clone] Invalid arguments.';
        }

        return el.cloneNode(true);
    },


    /**
     * Evaluate HTML string to live DOM
     *
     * @param {String} data     html string
     *
     * @return {HTMLElement | Array<HTMLElement>}
     * */
    eval(data) {
        let temp = document.createElement('div');

        temp.innerHTML = data;

        return temp.childNodes.length > 1 ? temp.childNodes : temp.firstChild;
    },


    /**
     * Check is selector matches to provided element
     *
     * @param {HTMLElement} el
     *
     * @param {String | HTMLElement} selector
     *
     * @return {Boolean}
     * */
    is(el, selector) {
        let match = Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector;

        this.is = function (el, selector) {
            if (el.nodeType !== 1) {
                return false;
            }

            return 'object' === typeof selector
                ? el === selector
                : match.call(el, selector);
        };

        return this.is.apply(null, arguments);
    },


    /**
     * Get next sibling nodes until element with matched selector
     *
     * @param {HTMLElement} el                  Start element
     * @param {String | HTMLElement} selector   Selector of End element
     * @param {Boolean} onlyElements            Only match Nodes with type === 1
     *
     * @return {Array<HTMLElement>}
     * */
    nextUntil(el, selector, onlyElements) {
        let result = [];

        while (el = el.nextSibling) {
            if (this.is(el, selector)) {
                break;
            }

            if (onlyElements && el.nodeType !== 1) {
                continue;
            }

            result.push(el);
        }

        return result;
    },


    /**
     * Find first matched sibling after provided element
     *
     * @param {HTMLElement} el
     * @param {string|HTMLElement} selector
     *
     * @return {HTMLElement | null}
     * */
    nextMatch(el, selector) {
        while (el = el.nextSibling) {
            if (this.is(el, selector)) {
                return el;
            }
        }

        return null;
    },


    /**
     * Detach element
     *
     * @param {HTMLElement} el
     *
     * @void
     * */
    detach(el) {
        el.parentNode.removeChild(el);
    },


    /**
     * Insert before
     *
     * @param {HTMLElement} targetEl
     * @param {HTMLElement} el
     *
     * @void
     * */
    insertBefore(targetEl, el){
        targetEl.parentElement.insertBefore(el, targetEl);
    }
};

export default domUtils;