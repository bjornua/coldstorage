"use strict";

var Immutable = require("immutable");
var Utils = require("./utils");
var Store = Immutable.Record({
    id: undefined,
    update: undefined,
    serialize: undefined
}, "Store");

var createStore = function (options) {
    options = Immutable.fromJS(options);
    Utils.assert(Immutable.Map.isMap(options), "Options must be a map");

    var id = options.get("id");
    var update = options.get("update");
    var serialize = options.get("serialize", true);
    Utils.assertType(id, "string", "id");
    Utils.assertType(update, "function", "update");
    Utils.assertType(serialize, "boolean", "serialize");

    return new Store({id: id, update: update, serialize: serialize});
};


module.exports = {
    Store: Store,
    createStore: createStore
};
