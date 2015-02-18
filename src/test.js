/*global require, module */
"use strict";
var Coldstorage = require("./index");
var Immutable = require("immutable");

var noop = function () { return; };

exports.createStore = {
    normal: function (test) {
        var state = Coldstorage.createStore("name", noop);
        test.deepEqual(state.toJS(), {key: "name", func: noop, _state: {}});
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
        Coldstorage.createDispatcher();
        test.done();
    },
    nonStore: function (test) {
        test.throws(
            function () {Coldstorage.createDispatcher([1, 2]); },
            /^Every item in `stores` must be created by Coldstorage\.createStore$/
        );
        test.done();
    },
    normal: function (test) {
        var store = Coldstorage.createStore("lololo", function (old) {
            return old.set("hello", "hi");
        });

        var dispatcher = Coldstorage.createDispatcher([
            store
        ]);
        test.strictEqual(typeof dispatcher.dispatch, "function");
        dispatcher = dispatcher.dispatch("something");

        test.done();
    }
};
