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

            if(chrome.element.length) {
                element = $(chrome.element);
            } else if (chrome.__element && chrome.__element.length) {
                element = $(chrome.__element);
            } else {
                return;
            }


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
}

module.exports = new BeeCore();
