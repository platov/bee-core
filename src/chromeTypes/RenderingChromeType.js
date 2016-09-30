import override from '../helpers/override';
import beeCore from '../';

const EVENT_PREFIX = `rendering:`;
const EVENT_BEFORE_UPDATE = `${EVENT_PREFIX}before-update`;
const EVENT_UPDATE = `${EVENT_PREFIX}update`;
const EVENT_BEFORE_HANDLE_MESSAGE = `${EVENT_PREFIX}before-handleMessage`;
const EVENT_HANDLE_MESSAGE = `${EVENT_PREFIX}handleMessage`;

let Obj = Sitecore.PageModes.ChromeTypes.Rendering.prototype;


/**
 * Handle Update rendering behavior on rendering updating
 * */
override('update', Obj,
    function () {
        beeCore.mediator.emit(EVENT_BEFORE_UPDATE, this.chrome);
    },
    function () {
        beeCore.mediator.emit(EVENT_UPDATE, this.chrome);
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

beeCore._registerDOMEvents(EVENT_BEFORE_UPDATE, EVENT_UPDATE, EVENT_BEFORE_HANDLE_MESSAGE, EVENT_HANDLE_MESSAGE);