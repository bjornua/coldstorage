'use strict';

var Immutable = require('immutable');

var Action = Immutable.Record({
    prefix: undefined,
    name: undefined
}, 'Action');


var id = 0;
var createActions = function (actions) {
    actions = Immutable.List(actions);

    if (actions.size === 0) {
        throw new Error("You didn't specify any action names");
    }

    var obj = {};
    actions = actions.map(function (name) {
        if ('string' !== typeof name) {
            throw new TypeError('Action name must be of type string');
        }
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