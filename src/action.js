"use strict";
var Immutable = require("immutable");
var utils = require("./utils");

var Action = Immutable.Record({
    prefix: undefined,
    name: undefined
}, "Action");


var id = 0;
var createActions = function () {
    var actions = Immutable.List(arguments);

    utils.assert(actions.size > 0, "You didn't specify any action names");

    var obj = {};
    if (actions.some(function (val) { return typeof val !== "string"; })) {
        throw new Error("\"Action\" must be of type \"string\"");
    }
    actions = actions.map(function (name) {
        var list = new Action({prefix: id, name: name});
        obj[name] = list;
    });
    id += 1;
    return Object.freeze(obj);
};

module.exports = {
    Action: Action,
    createActions: createActions
};
