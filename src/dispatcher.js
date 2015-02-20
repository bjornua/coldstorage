
"use strict";
var Immutable = require("immutable");
var Utils = require("./utils");
var Store = require("./store");

var DispatcherState = Immutable.Record({
    stores: Immutable.OrderedMap(),
    storesState: Immutable.Map()
}, "DispatcherState");

var dispatch = function (state, emits) {
    var get, getStore;
    var waiting = Immutable.OrderedSet();

    getStore = function(whatStore) {
        return get(whatStore.key);
    };

    get = function (what) {
        if (emits.has(what)) {
            return emits.get(what);
        }
        Utils.assert(
            !waiting.has(what),
            "Cycle detected {}",
            waiting.toSeq().concat([what]).join(" → ")
        );

        var oldstate = state.storesState.get(what, Immutable.Map());
        var func = state.stores.get(what).func;

        waiting = waiting.add(what);
        var res = func(oldstate, getStore);
        waiting.remove(what);

        emits = emits.set(what, res);
        return res;
    };

    var newState = state.stores.map(getStore);
    return state.set("storesState", newState);
};

var dispatchAction = function (state, action, payload) {
    var emits = Immutable.Map({
        action: payload
    });
    return dispatch(state, emits);
};

var serialize = function (state) {
    var lol = state.stores.filter(function (val, store) {
        return state.stores.get(store).exports && state.storesState.has(store);
    }).map(function (val, store) {
        return state.storesState.get(store);
    }).toJS();
    return lol;
};

var deserialize = function (state, object) {
    object = Immutable.fromJS(object);
    Utils.assert(Immutable.Map.isMap(object), "Object must be a map");

    object = object.filter(function (val, key) {
        return state.stores.has(key) && state.stores.get(key).exports;
    });

    return dispatch(state, object);
};

var getStoreState = function (state, store) {
    return state.storesState.get(store.key, Immutable.Map());
};

var wrapDispatcher = function (state) {
    var dispatchWrapped = function (action, payload) {
        return wrapDispatcher(dispatchAction(state, action, payload));
    };
    var serializeWrapped = function () {
        return serialize(state);
    };
    var getWrapped = function (store) {
        return getStoreState(state, store);
    };
    var deserializeWrapped = function (object) {
        return wrapDispatcher(deserialize(state, object));
    };
    return Object.freeze({
        state: state,
        get: getWrapped,
        serialize: serializeWrapped,
        deserialize: deserializeWrapped,
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
