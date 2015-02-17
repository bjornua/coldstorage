"use strict";
var Immutable = require("immutable");
var utils = require("./utils");
var Action = require("./action");
var Store = require("./store");

var Dispatcher = Immutable.Record({
    stores: Immutable.Map(),
    _state: Immutable.Map()
}, "Dispatcher");

var createDispatcher = function (stores) {
    stores = Immutable.fromJS(stores);

    if (stores === undefined) {
        stores = Immutable.List();
    }

    utils.assert(Immutable.List.isList(stores), "Stores must be an Array, Immutable.List, or undefined");
    utils.assert(stores.every(function (val) {
        return val instanceof Store.Store;
    }), "Every item in `stores` must be created by coldstorage.createStore");
    return Object.freeze({
        dispatch: new Dispatcher(),
        stores: stores
    });
};

module.exports = {
    createDispatcher: createDispatcher,
    createStore: Store.createStore,
    createActions: Action.createActions
};
