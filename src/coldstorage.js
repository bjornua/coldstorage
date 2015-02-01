'use strict';

var _ = require('lodash');
var Immutable = require('immutable');


var DispatchNode = Immutable.Record({
    listens: Immutable.Set(),
    emits: undefined,
    callback: undefined
});

function format(msg) {
    var args = _.toArray(arguments).slice(1);
    msg = msg.split('{}');
    msg = _.map(msg, function (m, i) {
        if (i + 1 === msg.length) {
            return [m];
        }
        return [m, JSON.stringify(args[i])];
    });
    msg = _.flatten(msg);
    return msg.join("");
}


var getTotalListeningNodes = function (action, listeners) {
    var waiting = Immutable.Stack(listeners.get(action));
    var visited = Immutable.OrderedSet();
    var node;

    while (!waiting.isEmpty()) {
        node = waiting.first();
        waiting = waiting.shift();

        if (!visited.has(node)) {
            visited = visited.add(node);
            waiting = waiting.unshiftAll(listeners.get(node.emits, Immutable.List()));
        }
    }
    return visited;
};
var generateQueue = function (action, listeners) {
    var nodes = getTotalListeningNodes(action, listeners);
    var emitters = Immutable.Set();
    var queue = Immutable.List();
    nodes.forEach(function (node) {
        if (emitters.has(node.emits)) {
            throw new Error(format('{}: {} emits twice', action, node.emits));
        }
        emitters = emitters.add(node.emits);
    });
    var isReady = function (node) {
        return emitters.intersect(node.listens).isEmpty();
    };
    var node;
    while (!nodes.isEmpty()) {
        node = nodes.find(isReady);
        if (node === undefined) {
            throw new Error(format('Cycle detected in {}', action));
        }
        nodes = nodes.remove(node);
        emitters = emitters.remove(node.emits);
        queue = queue.push(node);
    }
    return queue;
};

var initState = new (Immutable.Record({
    stores: Immutable.Map(),
    listeners: Immutable.Map(),
    emitters: Immutable.Map(),
    actions: Immutable.Map(),
    init: function (nodesData) {
        var actions = this.actions;
        var listeners = this.listeners;
        var emitters = this.emitters;
        Immutable.fromJS(nodesData).forEach(function (nodeData) {
            var node = new DispatchNode();
            node = node.set('emits', nodeData.get(0));

            if (!Immutable.List.isList(nodeData.get(1)) || nodeData.get(1).isEmpty()) {
                throw new Error('Listens must be a non-empty array.');
            }
            node = node.mergeIn(['listens'], nodeData.get(1));
            node = node.set('callback', nodeData.get(2));
            if (node.emits === undefined) {
                throw new Error('Missing emit target.');
            }
            node.listens.forEach(function (emitter) {
                listeners = listeners.update(emitter, Immutable.List(), function (l) {
                    return l.unshift(node);
                });
            });
            emitters = emitters.update(node.emits, Immutable.List(), function (l) {
                return l.unshift(node);
            });
        });
        var actionKeys = Immutable.Set(listeners.keys()).subtract(emitters.keys());
        actionKeys.forEach(function (actionName) {
            actions = actions.set(actionName, generateQueue(actionName, listeners, emitters));
        });

        return this.merge({
            listeners: listeners,
            emitters: emitters,
            actions: actions
        });
    },
    dispatch: function (actionID, payload) {
        if (!this.actions.has(actionID)) {
            throw new Error(format('Action {} is unhandled', actionID));
        }
        var nodes = this.actions.get(actionID);
        var actionEmit = Immutable.Map().set(actionID, payload);
        var emitted = Immutable.Map();
        nodes.forEach(function (node) {
            var stores = this.stores.merge(emitted).merge(actionEmit);
            var availStores = node.listens.add(node.emits).toMap().map(function (storeID) {
                return stores.get(storeID);
            });
            var res = node.get('callback')(availStores);

            emitted = emitted.set(node.emits, res);
        }, this);
        return this.mergeIn(['stores'], emitted);
    }
}))();
var create = function (nodesData) {
    var state = initState;
    return state.init(nodesData);
};

module.exports = {
    create: create,
    createActions: require('./action').createActions,
    createStore: require('./store').createActions
};