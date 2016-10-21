import EventEmitter from 'eventemitter3';
import $ from 'jquery';

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
     * Register events what should be transfered through DOM with jquery
     * */
    _registerDOMEvents(...events) {
        let self = this;

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
                throw `[bee-core] Cannot transfer event ${event} on DOM because of no DOM element spcified.`;
            }
        }));
    }

    /**
     * Generate Abstract Components tree
     *
     * @return {Array} ACT collection
     * */
    generateACT() {
        let chromeElements,
            flattenChromeElements = [],
            result = [],
            _level = 0;

        const OPEN = `[kind='open']`;
        const CLOSE = `[kind='close']`;
        const PLACEHOLDER = `code[chrometype='placeholder']`;
        const RENDERING = `code[chrometype='rendering']`;
        const SELECTOR = `${PLACEHOLDER}${OPEN}, ${RENDERING}${OPEN}, ${PLACEHOLDER}${CLOSE}, ${RENDERING}${CLOSE}`;

        if ('development' === process.env.NODE_ENV) {
            console.time('ACT generated');
        }

        chromeElements = $(document.body).find(SELECTOR);

        if (!chromeElements.length) {
            return result;
        }

        // Generate flatten list of open/close chrome rags
        chromeElements.each(function () {
            let el = $(this),
                isPlaceholder = false,
                isRendering = false;

            if (el.is(OPEN)) {
                _level++;
            } else if (el.is(CLOSE)) {
                _level--;
                return;
            }

            if (el.is(PLACEHOLDER)) {
                isPlaceholder = true;
            } else if (el.is(RENDERING)) {
                isRendering = true;
            }

            if (isPlaceholder || isRendering) {
                flattenChromeElements.push({
                    level : _level,
                    type  : isPlaceholder ? 'placeholder' : 'rendering',
                    title : el.attr(isPlaceholder ? 'key' : 'hintname'),
                    chrome: el[0]
                });
            }
        });

        // Convert flatten chrome elements list to Abstract Components Tree
        (function loop(collection, scopeLevel) {
            let chrome = flattenChromeElements.shift(),
                scopeCollection;

            chrome.children = scopeCollection = [];

            // Push me to the scope collection;
            collection.push(chrome);

            // If next item is child - open new scope
            if (flattenChromeElements.length && flattenChromeElements[0].level > scopeLevel) {
                loop(scopeCollection, scopeLevel + 1); // jump in
            }

            // Go to next sibling
            if (flattenChromeElements.length && flattenChromeElements[0].level === scopeLevel) {
                loop(collection, scopeLevel);
            }
        })(result, 1);

        if ('development' === process.env.NODE_ENV) {
            console.timeEnd('ACT generated');
        }

        return result;
    }
}

module.exports = new BeeCore();