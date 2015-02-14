"use strict";
var Immutable = require("immutable");

var Action = require("./action");


var Store = Immutable.Record({
    emitterKey: undefined,
    emitterFunc: undefined
}, 'Store');

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

var createStore = function (emitterKey, emitterFunc) {
    assert('string' === typeof emitterKey, 'emitterKey must be of type string');
    assert('function' === typeof emitterFunc, 'emitterFunc must be of type function');
    return new Store({emitterKey: emitterKey, emitterFunc: emitterFunc});
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


var createDispatcher = function (emitters) {

};



module.exports = {
    createDispatcher: createDispatcher,
    createStore: createStore,
    createActions: createActions
};
