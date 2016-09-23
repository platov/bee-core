import override from '../helpers/override';
import beeCore from '../';

const EVENT_PREFIX = `chromeControls:`;
const EVENT_BEFORE_RENDER_COMMAND = `${EVENT_PREFIX}before-renderCommandTag`;
const EVENT_RENDER_COMMAND = `${EVENT_PREFIX}renderCommandTag`;

override('renderCommandTag', Sitecore.PageModes.ChromeControls.prototype,
    function (data, command, chrome) {
        beeCore.mediator.emit(EVENT_BEFORE_RENDER_COMMAND, chrome, this, command);
    },
    function (data, command, chrome) {
        beeCore.mediator.emit(EVENT_RENDER_COMMAND, chrome, data.nativeResult[0], this, command);
    }
);
