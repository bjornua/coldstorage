"use strict";

var Immutable = require("immutable");
var utils = require("./utils");
var Store = Immutable.Record({
    key: undefined,
    func: undefined,
    _state: Immutable.Map()
}, "Store");

var createStore = function (key, func) {
    utils.assertType(key, "string", "key");
    utils.assertType(func, "function", "func");
    return new Store({key: key, func: func});
};


module.exports = {
    Store: Store,
    createStore: createStore
};
