import override from '../helpers/override';
import beeCore from '../';

const EVENT_PREFIX = `placeholder:`;
const EVENT_BEFORE_INSERT = `${EVENT_PREFIX}before-insertRendering`;
const EVENT_INSERT = `${EVENT_PREFIX}insertRendering`;
const EVENT_MOVE = `${EVENT_PREFIX}moveRendering`;
const EVENT_POP = `${EVENT_PREFIX}popRendering`;
const EVENT_BEFORE_REMOVE = `${EVENT_PREFIX}before-removeRendering`;
const EVENT_REMOVE = `${EVENT_PREFIX}removeRendering`;

let Obj = Sitecore.PageModes.ChromeTypes.Placeholder.prototype;

/**
 * Handle Insert behavior on rendering creation
 * */
override('insertRendering', Obj,
    function (__shared, data) {
        __shared.position = this._insertPosition;

        beeCore.mediator.emit(EVENT_BEFORE_INSERT, this.chrome, __shared.position, data.html);
    },

    function (__shared, data) {
        let el, newRenderingUID, renderingChrome;

        el = document.createElement('div');
        el.innerHTML = data.html;

        newRenderingUID = el.children[0].id.substring(2);
        renderingChrome = this._getChildRenderingByUid(newRenderingUID);

        renderingChrome.element.stop(true, true);

        beeCore.mediator.emit(EVENT_INSERT, this.chrome, renderingChrome, __shared.position);
    }
);

/**
 * Handle Insert, Pop, Move behaviors on moving rendering around on the page
 * */
override(
    'insertRenderingAt', Obj,

    function (__shared, renderingChrome, position) {
        __shared.oldPlaceholder = renderingChrome.type.getPlaceholder();
        __shared.newPlaceholder = this.chrome;

        if (__shared.oldPlaceholder !== __shared.newPlaceholder) {
            beeCore.mediator.emit(EVENT_POP, __shared.oldPlaceholder, renderingChrome);
        }
    },

    function (__shared, renderingChrome, position) {
        if (__shared.oldPlaceholder !== __shared.newPlaceholder) {
            beeCore.mediator.emit(EVENT_INSERT, this.chrome, renderingChrome, position);
        } else {
            beeCore.mediator.emit(EVENT_MOVE, this.chrome, renderingChrome, position);
        }
    }
);


/**
 * Handle Remove Rendering behavior
 * */
override('deleteControl', Obj,
    function (__shared, renderingChrome) {
        beeCore.mediator.emit(EVENT_BEFORE_REMOVE, this.chrome, renderingChrome)
    },

    function (__shared, renderingChrome) {
        setTimeout(() => beeCore.mediator.emit(EVENT_REMOVE, this.chrome, renderingChrome), 250)
    }
);


beeCore._registerDOMEvents(EVENT_BEFORE_INSERT, EVENT_INSERT, EVENT_MOVE, EVENT_POP, EVENT_BEFORE_REMOVE, EVENT_REMOVE);