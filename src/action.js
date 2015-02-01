'use strict';

var Immutable = require('immutable');

var Action = Immutable.Record({
    prefix: undefined,
    name: undefined
}, 'Action');


var id = 0;
var createActions = function (actions) {
    actions = Immutable.List(actions);

    var obj = {};
    actions = actions.map(function (name) {
        var list = Immutable.List([id, name]);
        obj[name] = list;
    });
    id += 1;
    return Object.freeze(obj);
};


module.exports.createActions = createActions;
