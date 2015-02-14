/*global require, module */
'use strict';
var coldstorage = require('./coldstorage');
var Immutable = require('immutable');

var noop = function () { return; };

exports.createStore = {
    normal: function (test) {
        var state = coldstorage.createStore('name', noop);

        test.deepEqual(state.toJS(), {emitterKey: 'name', emitterFunc: noop});
        test.done();
    },
    wrongName: function (test) {
        Immutable.Seq.of(undefined, 1234, null, [], {}).forEach(function (val) {
            test.throws(
                function () { coldstorage.createStore(val, noop); },
                /^emitterKey must be of type string$/
            );
        });
        test.done();
    }
};