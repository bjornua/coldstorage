"use strict";
var Immutable = require("immutable");

var Action = require("./action");


var Store = Immutable.Record({
    emitterKey: undefined,
    emitterFunc: undefined
}, 'Store');

var createStore = function (emitterKey, emitterFunc) {
    if ('string' !== typeof emitterKey) {
        throw new TypeError('emitterKey must be of type string');
    }
    if ('function' !== typeof emitterFunc) {
        throw new TypeError('EmitterFunc must be of type function');
    }
    return new Store({emitterKey: emitterKey, emitterFunc: emitterFunc});
};

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
}

var createDispatcher = function () {

};



module.exports = {
    createDispatcher: createDispatcher,
    createStore: createStore
};
