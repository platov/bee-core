'use strict';

import override from '../utils/override';
import beeCore from '../';

const EVENT_PREFIX = `chromeManager:`;
const EVENT_BEFORE_RESET_CHROMES = `${EVENT_PREFIX}before-resetChromes`;
const EVENT_RESET_CHROMES = `${EVENT_PREFIX}resetChromes`;

/**
 * Handle Reset Chromes behavior
 * */
override('resetChromes', Sitecore.PageModes.ChromeManager,
    function () {
        beeCore.mediator.emit(EVENT_BEFORE_RESET_CHROMES);
    },
    function () {
        beeCore.mediator.emit(EVENT_RESET_CHROMES);
    }
);