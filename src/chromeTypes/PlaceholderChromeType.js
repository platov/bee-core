import override from '../helpers/override';
import beeCore from '../';

const EVENT_PREFIX = `placeholder:`;
const EVENT_INSERT = `${EVENT_PREFIX}insert`;
const EVENT_BEFORE_INSERT = `${EVENT_PREFIX}before-insert`;
const EVENT_MOVE = `${EVENT_PREFIX}move`;
const EVENT_POP = `${EVENT_PREFIX}pop`;
const EVENT_BEFORE_REMOVE = `${EVENT_PREFIX}before-removeRendering`;
const EVENT_REMOVE = `${EVENT_PREFIX}removeRendering`;

var Obj = Sitecore.PageModes.ChromeTypes.Placeholder.prototype;

/**
 * Handle Insert behavior on rendering creation
 * */
override('insertRendering', Obj,
    function (data) {
        data.position = this._insertPosition;

        beeCore.mediator.emit(EVENT_BEFORE_INSERT, this.chrome, data.position);
    },

    function (data, renderingData) {
        let el,
            newRenderingUID,
            newRenderingChrome;

        el = document.createElement('div');

        el.innerHTML = renderingData.html;

        newRenderingUID = el.children[0].id.substring(2);
        newRenderingChrome = this._getChildRenderingByUid(newRenderingUID);

        setTimeout(() => beeCore.mediator.emit(EVENT_INSERT, this.chrome, newRenderingChrome, data.position), 500);
    }
);

/**
 * Handle Insert, Pop, Move behaviors on moving rendering around on the page
 * */
override(
    'insertRenderingAt', Obj,

    function (data, control, position) {
        data.oldPlaceholder = control.type.getPlaceholder();
        data.newPlaceholder = this.chrome;

        if (data.oldPlaceholder !== data.newPlaceholder) {
            beeCore.mediator.emit(EVENT_POP, data.oldPlaceholder, control);
        }
    },

    function (data, control, position) {
        if (data.oldPlaceholder !== data.newPlaceholder) {
            beeCore.mediator.emit(EVENT_INSERT, this.chrome, control, position);
        } else {
            beeCore.mediator.emit(EVENT_MOVE, data.oldPlaceholder, control, position);
        }
    }
);


/**
 * Handle Remove Rendering behavior
 * */
override('deleteControl', Obj,
    function (data, control) {
        mediator.emit(EVENT_BEFORE_REMOVE, this.chrome, control)
    },

    function (data, control) {
        setTimeout(() => mediator.emit(EVENT_REMOVE, this.chrome, control), 250)
    }
);
