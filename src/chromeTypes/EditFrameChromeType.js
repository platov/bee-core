import override from '../helpers/override';
import beeCore from '../';

const EVENT_PREFIX = `editFrame:`;
const EVENT_BEFORE_UPDATE_START = `${EVENT_PREFIX}before-updateStart`;
const EVENT_UPDATE_START = `${EVENT_PREFIX}updateStart`;
const EVENT_BEFORE_UPDATE_END = `${EVENT_PREFIX}before-updateEnd`;
const EVENT_UPDATE_END = `${EVENT_PREFIX}updateEnd`;

let Obj = Sitecore.PageModes.ChromeTypes.EditFrame.prototype;

/**
 * Handle Update Start behavior
 * */
override('updateStart', Obj,
    function () {
        beeCore.mediator.emit(EVENT_BEFORE_UPDATE_START, this.chrome);
    },
    function () {
        beeCore.mediator.emit(EVENT_UPDATE_START, this.chrome);
    }
);

/**
 * Handle Update End behavior
 * */
override('updateEnd', Obj,
    function () {
        beeCore.mediator.emit(EVENT_BEFORE_UPDATE_END, this.chrome);
    },
    function () {
        beeCore.mediator.emit(EVENT_UPDATE_END, this.chrome);
    }
);