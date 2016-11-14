'use strict';

import override from '../utils/override';
import beeCore from '../';

const EVENT_PREFIX = `rendering:`;
const EVENT_BEFORE_UPDATE = `${EVENT_PREFIX}before-update`;
const EVENT_UPDATE = `${EVENT_PREFIX}update`;
const EVENT_BEFORE_HANDLE_MESSAGE = `${EVENT_PREFIX}before-handleMessage`;
const EVENT_HANDLE_MESSAGE = `${EVENT_PREFIX}handleMessage`;
const EVENT_BEFORE_UPDATE_VARIATION_CACHE = `${EVENT_PREFIX}before-updateVariationCache`;
const EVENT_UPDATE_VARIATION_CACHE = `${EVENT_PREFIX}updateVariationCache`;
const EVENT_BEFORE_UPDATE_CONDITION_CACHE = `${EVENT_PREFIX}before-updateConditionCache`;
const EVENT_UPDATE_CONDITION_CACHE = `${EVENT_PREFIX}updateConditionCache`;

let Obj = Sitecore.PageModes.ChromeTypes.Rendering.prototype;


/**
 * Handle Update rendering behavior on rendering updating
 * */
override('update', Obj,
    function (__shared, data) {
        beeCore.mediator.emit(EVENT_BEFORE_UPDATE, this.chrome, data);
    },
    function (__shared, data) {
        beeCore.mediator.emit(EVENT_UPDATE, this.chrome, data);
    }
);

override('handleMessage', Obj,
    function (__shared, message) {
        beeCore.mediator.emit(EVENT_BEFORE_HANDLE_MESSAGE, this.chrome, message);
    },
    function (__shared, message) {
        beeCore.mediator.emit(EVENT_HANDLE_MESSAGE, this.chrome, message);
    }
);

override('updateVariationCache', Obj,
    function (__shared, variation) {
        beeCore.mediator.emit(EVENT_BEFORE_UPDATE_VARIATION_CACHE, this.chrome, variation);
    },
    function (__shared, variation) {
        beeCore.mediator.emit(EVENT_UPDATE_VARIATION_CACHE, this.chrome, variation);
    }
);

override('updateVariationCache', Obj,
    function (__shared, variation) {
        beeCore.mediator.emit(EVENT_BEFORE_UPDATE_VARIATION_CACHE, this.chrome, variation);
    },
    function (__shared, variation) {
        beeCore.mediator.emit(EVENT_UPDATE_VARIATION_CACHE, this.chrome, variation);
    }
);

override('updateConditionCache', Obj,
    function (__shared, variation) {
        beeCore.mediator.emit(EVENT_BEFORE_UPDATE_CONDITION_CACHE, this.chrome, variation);
    },
    function (__shared, variation) {
        beeCore.mediator.emit(EVENT_UPDATE_CONDITION_CACHE, this.chrome, variation);
    }
);