import override from '../helpers/override';
import beeCore from '../';

const EVENT_PREFIX = `chrome:`;
const EVENT_BEFORE_EMPTY = `${EVENT_PREFIX}before-empty`;
const EVENT_EMPTY = `${EVENT_PREFIX}empty`;
const EVENT_BEFORE_REMOVE = `${EVENT_PREFIX}before-remove`;
const EVENT_REMOVE = `${EVENT_PREFIX}remove`;

let Obj = Sitecore.PageModes.Chrome.prototype;

/**
 * Handle Emptying chrome behavior
 * */
override('empty', Obj,
    function () {
        beeCore.mediator.emit(EVENT_BEFORE_EMPTY, this);
    },
    function () {
        beeCore.mediator.emit(EVENT_EMPTY, this);
    }
);

/**
 * Handle Remove chrome behavior
 * */
override('remove', Obj,
    function () {
        beeCore.mediator.emit(EVENT_BEFORE_REMOVE, this);
    },
    function () {
        beeCore.mediator.emit(EVENT_REMOVE, this);
    }
);

beeCore._registerDOMEvents(EVENT_BEFORE_EMPTY, EVENT_EMPTY, EVENT_BEFORE_REMOVE, EVENT_REMOVE);