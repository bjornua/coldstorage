'use strict';

var Immutable = require('immutable');
var Action = require('./action');

var Store = Immutable.Record({
    name: undefined,
    nodes: Immutable.List(),
    on: function (deps, f) {
        deps = Immutable.List(deps);
        deps = deps.map(function (val) {
            if (val instanceof Store) {
                return val.name;
            }
            if (val instanceof Action.Action) {
                return val;
            }
            throw new TypeError('Cannot listen object of type ' + typeof val);
        });

        return this.set('nodes', this.nodes.push(
            Immutable.List.of(this.name, deps, f)
        ));
    }
}, 'Store');

var createStore = function (name) {
    if ('string' !== typeof name) {
        throw new TypeError('Store name must be of type string');
    }
    return new Store({name: name});
};

module.exports.createStore = createStore;