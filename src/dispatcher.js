
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
    var waiting = Immutable.OrderedSet();

    var get = function (what) {
        if (emits.has(what)) {
            return emits.get(what);
        }
        Utils.assert(
            !waiting.has(what),
            "Cycle detected {}",
            waiting.toSeq().concat([what]).map(function(val) { return val.key; }).join(" → "));

        var oldstate = state.storesState.get(what, Immutable.Map());
        var func = state.stores.get(what).func;

        waiting = waiting.add(what);
        var res = func(oldstate, get);
        waiting.remove(what);

        emits = emits.set(what, res);
        return res;
    };

    var newState = state.stores.map(function (val, key) {
        return get(key);
    });
    return state.set("storesState", newState);
};
var serialize = function (state) {
    return state.stores.filter(function (store) {
        return store.exports;
    }).map(function (val, key) {
        return state.storesState.get(key);
    }).mapKeys(function (key) {
        return key.key;
    }).toJS();
};

var wrapDispatcher = function (state) {
    var dispatchWrapped = function (action, payload) {
        return wrapDispatcher(dispatch(state, action, payload));
    };
    var serializeWrapped = function () {
        return serialize(state);
    };
    return Object.freeze({
        state: state,
        serialize: serializeWrapped,
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
        return key;
    });
    return wrapDispatcher(new DispatcherState({stores: stores}));
};



module.exports = {
    createDispatcher: createDispatcher
};
