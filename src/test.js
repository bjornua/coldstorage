/*global require, module */
"use strict";
var Coldstorage = require("./index");
var Immutable = require("immutable");

var noop = function () { return; };

exports.createStore = {
    normal: function (test) {
        var state = Coldstorage.createStore("name", noop);
        test.deepEqual(state.toJS(), {key: "name", func: noop, _state: {}, exports: true});
        test.done();
    },
    wrongName: function (test) {
        Immutable.Seq.of(undefined, 1234, null, [], {}).forEach(function (val) {
            test.throws(
                function () { Coldstorage.createStore(val, noop); },
                /^"key" must be of type "string"$/
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
            function () {Coldstorage.createDispatcher([1, 2]); },
            /^Every item in `stores` must be created by Coldstorage\.createStore$/
        );
        test.done();
    },
    normalAndSerialize: function (test) {
        var store = Coldstorage.createStore("a", function (old) {
            return old.set("hello", "hi");
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
        var storeA = Coldstorage.createStore("a", function (old) {
            return old.set("some", "value");
        }, true);
        var storeB = Coldstorage.createStore("b", function (old) {
            return old.set("some", "value");
        }, false);
        var dispatcher = Coldstorage.createDispatcher([
            storeA,
            storeB
        ]);
        test.deepEqual(dispatcher.get(storeB).toJS(), {});
        dispatcher = dispatcher.deserialize({"a": {"some": "value"}, "b": {"other": "value"}});

        test.deepEqual(dispatcher.get(storeB).toJS(), {"some": "value"});

        test.deepEqual(
            dispatcher.serialize(),
            {"a": {"some": "value"}}
        );
        test.done();
    },
    cycle: function (test) {
        var storeA, storeB;
        storeA = Coldstorage.createStore("a", function (old, get) {
            get(storeB);
        });
        storeB = Coldstorage.createStore("b", function (old, get) {
            get(storeA);
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
    }
};
