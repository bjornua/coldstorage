/*global require, module */
"use strict";
var coldstorage = require("./index");
var Immutable = require("immutable");

var noop = function () { return; };

exports.createStore = {
    normal: function (test) {
        var state = coldstorage.createStore("name", noop);
        test.deepEqual(state.toJS(), {key: "name", func: noop, _state: {}});
        test.done();
    },
    wrongName: function (test) {
        Immutable.Seq.of(undefined, 1234, null, [], {}).forEach(function (val) {
            test.throws(
                function () { coldstorage.createStore(val, noop); },
                /^"key" must be of type "string"$/
            );
        });
        test.done();
    }
};

exports.createActions = {
    normal: function (test) {
        coldstorage.createActions("1");
        test.done();
    },
    empty: function (test) {
        test.throws(
            function () { coldstorage.createActions(); },
            /^You didn't specify any action names$/
        );
        test.done();
    }
};
exports.createDispatcher = {
    empty: function (test) {
        var dispatcher = coldstorage.createDispatcher();
        test.deepEqual(dispatcher.stores.toJS(), []);
        test.done();
    },
    nonStore: function (test) {
        test.throws(
            function () {coldstorage.createDispatcher([1, 2]); },
            /^Every item in `stores` must be created by coldstorage\.createStore$/
        );
        test.done();
    },
    normal: function (test) {
        var store = coldstorage.createStore("lololo", function () {
            return;
        });

        console.log(store);
        test.done();
    }
};
