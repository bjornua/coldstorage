var Action = require("./action");
var Store = require("./store");
var Dispatcher = require("./dispatcher");

module.exports = {
    createDispatcher: Dispatcher.createDispatcher,
    createStore: Store.createStore,
    createActions: Action.createActions
};
