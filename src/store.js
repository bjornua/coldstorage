'use strict';

var Immutable = require('immutable');

var Store = Immutable.Record({
    name: undefined,
    nodes: Immutable.List(),
    on: function (deps, f) {
        deps = Immutable.List(deps);
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
    return new Store({name: name});
};

module.exports.createStore = createStore;