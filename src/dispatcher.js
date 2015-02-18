
"use strict";
var Immutable = require("immutable");
var Utils = require("./utils");
var Store = require("./store");

var DispatcherState = Immutable.Record({
    stores: Immutable.Map(),
    storesState: Immutable.Map()
}, "DispatcherState");

var dispatch = function (state, action, payload) {
    var emits = Immutable.Map({
        action: payload
    });
    // var waiting = Immutable.OrderedSet();

    var get = function (what) {
        if (!emits.has(what)) {
            var oldstate = state.storesState.get(what, Immutable.Map());
            var func = state.stores.get(what).func;
            var res = func(oldstate, get);
            emits = emits.set(what, res);
            return res;
        }
        return emits.get(what);
    };

    var newState = state.stores.map(function (val, key) {
        return get(key);
    });
    return state.set("storesState", newState);
};

var wrapDispatcher = function (state) {
    var dispatchWrapped = function (action, payload) {
        return wrapDispatcher(dispatch(state, action, payload));
    };
    return Object.freeze({
        state: state,
        dispatch: dispatchWrapped
    });
};

var createDispatcher = function (stores) {
    stores = Immutable.fromJS(stores);

    if (stores === undefined) {
        stores = Immutable.List();
    }
    Utils.assert(stores instanceof Immutable.List, "Stores must be an Array, Immutable.List, or undefined");
    Utils.assert(stores.every(function (val) {
        return val instanceof Store.Store;
    }), "Every item in `stores` must be created by Coldstorage.createStore");

    stores = stores.toSetSeq().toMap().mapKeys(function (key) {
        return key.key;
    });
    return wrapDispatcher(new DispatcherState({stores: stores}));
};



module.exports = {
    createDispatcher: createDispatcher
};
