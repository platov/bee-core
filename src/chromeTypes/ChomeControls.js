'use strict';

import override from '../utils/override';
import beeCore from '../';

const EVENT_PREFIX = `chromeControls:`;
const EVENT_BEFORE_RENDER_COMMAND = `${EVENT_PREFIX}before-renderCommandTag`;
const EVENT_RENDER_COMMAND = `${EVENT_PREFIX}renderCommandTag`;

override('renderCommandTag', Sitecore.PageModes.ChromeControls.prototype,
    function (__shared, command, renderingChrome) {
        beeCore.mediator.emit(EVENT_BEFORE_RENDER_COMMAND, renderingChrome, this, command);
    },
    function (__shared, command, renderingChrome) {
        beeCore.mediator.emit(EVENT_RENDER_COMMAND, renderingChrome, __shared.nativeResult[0], this, command);
    }
);