import EventEmitter from 'eventemitter3';

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
}

module.exports = new BeeCore();