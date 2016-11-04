export default function override(key, object, before, after) {
    var native = object[key];

    object[key] = function () {
        var data = {};

        if ('function' === typeof before) {
            before.call(this, data, ...arguments);
        }

        data.nativeResult = native.apply(this, arguments);

        if ('function' === typeof after) {
            after.call(this, data, ...arguments);
        }

        return data.nativeResult;
    };
};