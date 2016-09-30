import EventEmitter from 'eventemitter3';
import $ from 'jquery';

class BeeCore {
    constructor() {
        var self = this;

        this.isExperienceEditor = false;
        this.mediator = new EventEmitter();

        (onload => {
            window.onload = function () {
                if ('function' === typeof onload) {
                    onload.apply(window, [...arguments]);
                }

                if (!window.Sitecore || !window.Sitecore.WebEditSettings || !window.Sitecore.WebEditSettings.editing) {
                    return;
                }

                self.isExperienceEditor = true;

                require('./chromeTypes');

                self.mediator.emit('beeCore:ready', this);
            }
        })(window.onload);
    }

    _registerDOMEvents(...events) {
        let self = this;

        if (!$) {
            return;
        }

        events.forEach(event => this.mediator.on(event, (chrome, ...rest) => {
            let element;

            // If no Chrome available - event cannot be fired through DOM
            if (!(chrome instanceof Sitecore.PageModes.Chrome)) {
                return
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
                throw `[bee-core] Cannot transfer event ${event} to DOM because of no DOM element spcified.`;
            }
        }));
    }
}

module.exports = new BeeCore();