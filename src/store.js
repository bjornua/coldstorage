'use strict';

var Immutable = require('immutable');
var Action = require('./action');

var Store = Immutable.Record({
    name: undefined,
    nodes: Immutable.List(),
    on: function (deps, f) {
        deps = Immutable.List(deps);

        var wrongVal = deps.filter(function (val) {
            return !(val instanceof Action.Action) && !(val instanceof Store);
        });
        if (wrongVal.size > 0) {
            throw new TypeError('Cannot listen to object of type ' + typeof wrongVal.get(0));
        }

        deps = deps.map(function (val) {
            if (val instanceof Store) {
                return val.name;
            }
            return val;
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