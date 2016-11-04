'use strict';

import EventEmitter from 'eventemitter3';

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
}

module.exports = new BeeCore();
