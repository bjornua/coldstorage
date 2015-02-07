/*global require, module */
'use strict';
var coldstorage = require('./coldstorage');
var Immutable = require('immutable');

var noop = function () { return; };

exports.create = {
    empty: function (test) {
        var state = coldstorage.create([]);
        test.equal(state.listeners.size, 0);
        test.equal(state.emitters.size, 0);
        test.equal(state.actions.size, 0);
        test.done();
    },
    missingDepsArg: function (test) {
        test.throws(function () {
            coldstorage.create([[]]);
        }, /^Listens must be a non-empty array\.$/);
        test.throws(function () {
            coldstorage.create([['A', [], noop]]);
        }, /^Listens must be a non-empty array\.$/);
        test.done();
    },
    single: function (test) {
        var state = coldstorage.create([['A', ['action'], noop]]);
        var listeners = state.listeners;
        var emitters = state.emitters;
        var actions = state.actions;
        test.strictEqual(listeners.size, 1);
        test.strictEqual(listeners.has('action'), true);
        test.strictEqual(listeners.has('A'), false);
        test.strictEqual(listeners.get('action').size, 1);
        test.strictEqual(listeners.getIn(['action', 0, 'emits']), 'A');
        test.strictEqual(emitters.size, 1);
        test.strictEqual(emitters.has('action'), false);
        test.strictEqual(emitters.has('A'), true);
        test.strictEqual(emitters.getIn(['A', 0, 'emits']), 'A');
        test.strictEqual(actions.has('action'), true);
        test.strictEqual(actions.get('action').size, 1);
        test.strictEqual(actions.getIn(['action', 0, 'emits']), 'A');
        test.done();
    },
    cycle1: function (test) {
        test.throws(function () {
            coldstorage.create([['A', ['A', 'action1'], noop]]);
        }, /^Cycle detected in "action1"$/);
        test.done();
    },
    cycle2: function (test) {
        test.throws(function () {
            coldstorage.create([
                ['A', ['action2', 'B'], noop],
                ['B', ['A'], noop]
            ]);
        }, /^Cycle detected in "action2"$/);
        test.done();
    },
    dupe: function (test) {
        test.throws(function () {
            coldstorage.create([
                ['A', ['action'], function () { return 1; }],
                ['A', ['action'], function () { return 1; }]
            ]);
        }, /^"action": "A" emits twice$/);

        test.done();
    }
};
exports.dispatch = {
    unhandledAction: function (test) {
        var dispatcher = coldstorage.create([]);

        test.throws(
            function () { dispatcher.dispatch('action', ''); },
            /^Action "action" is unhandled$/);
        test.done();
    },
    single: function (test) {
        var dispatcher = coldstorage.create([
            ['A', ['action'], function () { return 'lololoo'; }]
        ]);
        var action = dispatcher.actions.get('action');
        test.strictEqual(action.get(0).emits, 'A');

        dispatcher = dispatcher.dispatch('action', {});
        var stores = dispatcher.stores;

        test.strictEqual(stores.size, 1);
        test.strictEqual(stores.get('A'), 'lololoo');

        test.done();
    },
    triple: function (test) {
        var dispatcher = coldstorage.create([
            ['C', ['greet', 'B'], function (greet, B) { return 'Bonjour ' + greet.get('who') + '! == ' + B; }],
            ['A', ['greet'], function (greet) { return 'Hello ' + greet.get('who'); }],
            ['B', ['A'], function (A) { return A + '!'; }]
        ]);
        var action = dispatcher.actions.get('greet');
        test.strictEqual(action.get(0).emits, 'A');
        test.strictEqual(action.get(1).emits, 'B');

        dispatcher = dispatcher.dispatch('greet', {who: 'World'});
        var stores = dispatcher.stores;
        test.strictEqual(stores.size, 3);
        test.strictEqual(stores.get('A'), 'Hello World');
        test.strictEqual(stores.get('B'), 'Hello World!');
        test.strictEqual(stores.get('C'), 'Bonjour World! == Hello World!');

        test.done();
    }
};

exports.action = {
    create: function (test) {
        var actions = coldstorage.createActions(['login', 'logout']);
        test.notStrictEqual(actions.login, undefined);
        test.ok(actions.login instanceof coldstorage.Action);
        test.strictEqual(actions.login.name, 'login');
        test.strictEqual(actions.logout.name, 'logout');
        test.strictEqual(actions.a, undefined);
        test.ok(Object.isFrozen(actions));

        test.throws(
            function () { coldstorage.createActions([undefined]); },
            /^Action name must be of type string$/
        );
        test.throws(
            function () { coldstorage.createActions([1]); },
            /^Action name must be of type string$/
        );
        test.throws(
            function () { coldstorage.createActions([]); },
            /^You didn't specify any action names$/
        );

        test.done();
    }
};

exports.store = {
    create: function (test) {
        var store = coldstorage.createStore('test');
        test.strictEqual(store.name, 'test');
        test.ok(Immutable.is(store.nodes, Immutable.List()));
        test.done();
    },
    noName: function (test) {
        test.throws(function () {
            var store = coldstorage.createStore();
        }, /Store name must be of type string/);
        test.done();
    },
    on: function (test) {
        var store = coldstorage.createStore('test');
        test.ok('function' === typeof store.on);
        test.throws(function () {
            store.on([{}]);
        }, /^Cannot listen object of type object$/);
        test.throws(function () {
            store.on([undefined]);
        }, /^Cannot listen object of type undefined$/);

        store = store.on();

        test.done();
    }
};


exports.realWorld = {
    realWorld: function (test) {
        var actions = coldstorage.createActions(['login', 'logout']);

        var userStore = coldstorage.createStore('user');
        userStore = userStore.on([actions.login], function (login) {
            var authed = login.get('username') === 'admin' && login.get('password') === '1234';
            return this.set('authed', authed);
        });

        userStore = userStore.on([actions.logout], function () {
            return this.set('authed', false);
        });
        var alertStore = coldstorage.createStore('alert');

        alertStore = alertStore.on([userStore], function (user) {
            var authed = user.get('authed');
            if (authed === true) {
                return this.set('message', 'You were logged in');
            }
            return this.set('message', 'You were logged out');
        });

        var dispatcher = coldstorage.fromStores([
            userStore,
            alertStore
        ]);
        var login_ok = dispatcher.dispatch(actions.login, {'username': 'admin', 'password': '1234'});
        var login_fail = dispatcher.dispatch(actions.login, {'username': 'admin', 'password': '1235'});

        test.deepEqual(login_ok.stores.toJS(), {user: {authed: true}, alert: {message: "You were logged in"}});
        test.deepEqual(login_fail.stores.toJS(), {user: {authed: false}, alert: {message: "You were logged out"}});

        test.done();
    }
};