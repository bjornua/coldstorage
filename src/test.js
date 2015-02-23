/*global require, module */
"use strict";
var Coldstorage = require("./index");
var Immutable = require("immutable");

var noop = function () { return; };

exports.createStore = {
    normal: function (test) {
        var state = Coldstorage.createStore({
            id: "name",
            update: noop
        });
        test.deepEqual(state.toJS(), {id: "name", update: noop, serialize: true});
        test.done();
    },
    wrongName: function (test) {
        Immutable.Seq.of(undefined, 1234, null, [], {}).forEach(function (val) {
            test.throws(
                function () { Coldstorage.createStore({id: val, update: noop}); },
                /^"id" must be of type "string"$/
            );
        });
        test.done();
    }
};

exports.createActions = {
    normal: function (test) {
        Coldstorage.createActions("1");
        test.done();
    },
    empty: function (test) {
        test.throws(
            function () { Coldstorage.createActions(); },
            /^You didn't specify any action names$/
        );
        test.done();
    }
};
exports.createDispatcher = {
    empty: function (test) {
        var dispatcher = Coldstorage.createDispatcher();
        test.strictEqual(typeof dispatcher.dispatch, "function");
        test.done();
    },
    nonStore: function (test) {
        test.throws(
            function () { Coldstorage.createDispatcher([1, 2]); },
            /^Every item in `stores` must be created by Coldstorage\.createStore$/
        );
        test.done();
    },
    normalAndSerialize: function (test) {
        var store = Coldstorage.createStore({
            id: "a",
            update: function (old) {
                return old.set("hello", "hi");
            }
        });
        var dispatcher = Coldstorage.createDispatcher([
            store
        ]);
        dispatcher = dispatcher.dispatch("something");
        test.deepEqual(
            dispatcher.serialize(),
            {"a": {"hello": "hi"}}
        );
        test.done();
    },
    deserialize: function (test) {
        var storeA = Coldstorage.createStore({
            id: "a",
            update: function (old) {
                return old.set("some", "value");
            },
            serialize: true
        });
        var storeB = Coldstorage.createStore({
            id: "b",
            update: function (old) {
                return old.set("some", "value");
            },
            serialize: false
        });

        var dispatcher = Coldstorage.createDispatcher([storeA, storeB]);
        test.deepEqual(dispatcher.get([storeB]), undefined);
        dispatcher = dispatcher.deserialize({"a": {"some": "value"}, "b": {"other": "value"}});

        test.deepEqual(dispatcher.get([storeB]).toJS(), {"some": "value"});

        test.deepEqual(
            dispatcher.serialize(),
            {"a": {"some": "value"}}
        );
        test.done();
    },
    cycle2: function (test) {
        var storeA, storeB;
        storeA = Coldstorage.createStore({
            id: "a",
            update: function (old, get) {
                get(storeB);
            }
        });
        storeB = Coldstorage.createStore({
            id: "b",
            update: function (old, get) {
                get(storeA);
            }
        });
        var dispatcherA = Coldstorage.createDispatcher([storeA, storeB]);
        var dispatcherB = Coldstorage.createDispatcher([storeB, storeA]);
        test.throws(
            function () { dispatcherA.dispatch("something"); },
            /^Cycle detected "a → b → a"$/
        );
        test.throws(
            function () { dispatcherB.dispatch("something"); },
            /^Cycle detected "b → a → b"$/
        );
        test.done();
    },
    cycle1: function (test) {
        var store;
        store = Coldstorage.createStore({
            id: "a",
            update: function (old, get) {
                get(store);
            }
        });
        var dispatcher = Coldstorage.createDispatcher([store]);
        test.throws(
            function () { dispatcher.dispatch("something"); },
            /^Cycle detected "a → a"$/
        );
        test.done();
    },
    get: function (test) {
        var actions = Coldstorage.createActions("called", "notcalled");
        Coldstorage.createDispatcher([Coldstorage.createStore({
            id: "a",
            update: function (old, get) {
                test.deepEqual(get(actions.called).toJS(), {});
                test.strictEqual(get(actions.notcalled), undefined);
                return old;
            }
        })]).dispatch(actions.called, {});

        Coldstorage.createDispatcher([Coldstorage.createStore({
            id: "a",
            update: function (old, get) {
                test.deepEqual(get(actions.called).toJS(), {});
                test.strictEqual(get(actions.notcalled), undefined);
                return old;
            }
        })]).dispatch(actions.called);

        test.done();
    }
};
