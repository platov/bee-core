'use strict';

import override from '../utils/override';
import beeCore from '../';

const EVENT_PREFIX = `rendering:`;
const EVENT_BEFORE_UPDATE = `${EVENT_PREFIX}before-update`;
const EVENT_UPDATE = `${EVENT_PREFIX}update`;
const EVENT_BEFORE_END_ACTIVATION = `${EVENT_PREFIX}before-endActivation`;
const EVENT_END_ACTIVATION = `${EVENT_PREFIX}endActivation`;
const EVENT_BEFORE_HANDLE_MESSAGE = `${EVENT_PREFIX}before-handleMessage`;
const EVENT_HANDLE_MESSAGE = `${EVENT_PREFIX}handleMessage`;

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

override('_endActivation', Obj,
    function (__shared, data) {
        beeCore.mediator.emit(EVENT_BEFORE_END_ACTIVATION, this.chrome);
    },
    function (__shared, data) {
        beeCore.mediator.emit(EVENT_END_ACTIVATION, this.chrome);
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