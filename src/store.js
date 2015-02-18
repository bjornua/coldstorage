"use strict";

var Immutable = require("immutable");
var utils = require("./utils");
var Store = Immutable.Record({
    key: undefined,
    func: undefined,
    exports: undefined,
    _state: Immutable.Map()
}, "Store");

var createStore = function (key, func, exports) {
    if (exports === undefined) {
        exports = true;
    }
    utils.assertType(key, "string", "key");
    utils.assertType(func, "function", "func");
    utils.assertType(exports, "boolean", "exports");

    return new Store({key: key, func: func, exports: exports});
};


module.exports = {
    Store: Store,
    createStore: createStore
};
