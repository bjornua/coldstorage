"use strict";
var Immutable = require("immutable");

var format = function (msg) {
    var args = Immutable.Seq(arguments);
    args = args.skip(1).map(JSON.stringify).toList();

    msg = Immutable.Seq(msg.split("{}"));
    msg = msg.skip(1).reduce(function (r, v, k) {
        if (args.has(k)) {
            return r + args.get(k) + v;

        }
        return r + "{}" + v;
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

var assertType = function(object, type, name) {
    assert((typeof object) === type, "{} must be of type {}", name, type);
};

module.exports = {
    format: format,
    assert: assert,
    assertType: assertType
};
