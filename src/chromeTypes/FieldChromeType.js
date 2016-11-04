'use strict';

import _debounce from 'lodash/debounce';
import override from '../utils/override';
import beeCore from '../';

const EVENT_PREFIX = `field:`;
const EVENT_BEFORE_MODIFIED = `${EVENT_PREFIX}before-setModified`;
const EVENT_MODIFIED = `${EVENT_PREFIX}setModified`;
const EVENT_BEFORE_PERSIST = `${EVENT_PREFIX}before-persist`;
const EVENT_PERSIST = `${EVENT_PREFIX}persist`;

let Obj = Sitecore.PageModes.ChromeTypes.Field.prototype;

/**
 * Handle Field modifications
 * */
override('setModified', Obj,
    _debounce(function () {
        beeCore.mediator.emit(EVENT_BEFORE_MODIFIED, this.chrome);
    }, 0),
    _debounce(function () {
        beeCore.mediator.emit(EVENT_MODIFIED, this.chrome);
    }, 0)
);


override('persistValue', Obj,
    function () {
        beeCore.mediator.emit(EVENT_BEFORE_PERSIST, this.chrome);
    },
    function () {
        beeCore.mediator.emit(EVENT_PERSIST, this.chrome);
    }
);