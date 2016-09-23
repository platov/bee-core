class BeeCore {
    constructor() {
        this.isExperienceEditor = false;
        this.mediator = void 0;
    }

    init(mediator) {
        var self = this;

        if (mediator) {
            this.mediator = mediator;
        }

        if (!this.mediator) {
            throw '[BeeCore] Mediator is missing.';
        }

        require('./chromeTypes');

        (onload => {
            window.onload = function () {
                if ('function' === typeof onload) {
                    onload.apply(window, [...arguments]);
                }

                if (!window.Sitecore || !window.Sitecore.WebEditSettings || !window.Sitecore.WebEditSettings.editing) {
                    return;
                }

                self.isExperienceEditor = true;

                this.mediator.emit('beeCore:ready', this);
            }
        })(window.onload);

        this.init = function () {
            console.warn('BeeCore is already initialized.')
        };
    }
}

module.exports = new BeeCore();