"use strict";
var Immutable = require("immutable");

var Action = require("./action");

var Store = Immutable.Record({
    key: undefined,
    func: undefined,
    _state: Immutable.Map()
}, 'Store');

var Dispatcher = Immutable.Record({
    '': undefined,
    _state: Immutable.Map()
}, 'Dispatcher');

var format = function (msg) {
    var args = Immutable.Seq(arguments);
    args = args.skip(1).map(JSON.stringify).toList();

    msg = Immutable.Seq(msg.split("{}"));
    msg = msg.skip(1).reduce(function (r, v, k) {
        if (args.has(k)) {
            return r + args.get(k) + v;

        }
        return r + '{}' + v;
    }, msg.first());

    return msg;
};

var assert = function (condition, msg) {
    if (msg !== undefined) {
        var args = Immutable.Seq(arguments).skip(2);
        args = Immutable.Seq.of(msg).concat(args);
        msg = format.apply(null, args.toJS());
    } else {
        msg = format("Assertion failed", condition);
    }

    if (condition === false || condition === undefined) {
        throw new Error(msg);
    }
};

var createStore = function (key, func) {
    assert('string' === typeof key, 'key must be of type string');
    assert('function' === typeof func, 'func must be of type function');
    return new Store({key: key, func: func});
};
var Immutable = require('immutable');

var Action = Immutable.Record({
    prefix: undefined,
    name: undefined
}, 'Action');


var id = 0;
var createActions = function () {
    var actions = Immutable.List(arguments);

    assert(actions.size > 0, "You didn't specify any action names");

    var obj = {};
    actions = actions.map(function (name) {
        assert('string' === typeof name, 'Action name must be of type string');
        var list = new Action({prefix: id, name: name});
        obj[name] = list;
    });
    id += 1;
    return Object.freeze(obj);
};


var createDispatcher = function (stores) {
    stores = Immutable.fromJS(stores);

    if (stores === undefined) {
        stores = Immutable.List();
    }

    assert(Immutable.List.isList(stores), 'Stores must be an Array or undefined');
    assert(stores.every(function (val) {
        return val instanceof Store;
    }), 'Every item in `stores` must be created by coldstorage.createStore');

    return Object.freeze({
        stores: stores
    });
};



module.exports = {
    createDispatcher: createDispatcher,
    createStore: createStore,
    createActions: createActions
};
