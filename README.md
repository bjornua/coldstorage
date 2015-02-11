# coldstorage

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]
Immutable dispatcher for the flux architecture.

### Features:

* Fully immutable API. `dispatcher.dispatch` returns a new state.
* Uses and some times returns  https://github.com/facebook/immutable-js objects.
* Changes can only be initiated by actions
* Stores can listen to stores
* Stores can listen to actions
* Stores can listen to many stores/actions at once
* Built-in early detection of cycles avoids infinite loops.

## Installing
Coldstorage is implemented using CommonJS. Currently coldstorage is distributed using `npm`. It can be installed by running
```shell
npm install coldstorage
```
in your project.

Coldstorage runs both in Node and the browser via browserify (or the like).

# Example Usage:
## Creating actions
You create actions by passing an array of strings into `coldstorage.createActions`:
```javascript
var actions = coldstorage.createActions(['login', 'logout']);
```
##Creating the stores
```javascript
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
```
## Initializing the dispatcher
```javascript
var dispatcher = coldstorage.fromStores([
    userStore,
    alertStore
]);
```
## Dispatching actions
```javascript
var dispatcher = dispatcher.dispatch(actions.login, {'username': 'admin', 'password': '1234'});
var userstore = dispatcher.stores.get('user');

// Prints true
console.log(userstore.get('authed'));
// Prints admin
console.log(userstore.get('username'));
```
# Contribution
Requests and discussion are very welcomed in https://github.com/bjornua/coldstorage/issues

# License
`coldstorage` is BSD-licensed.

[npm-image]: https://img.shields.io/npm/v/coldstorage.svg?style=flat-square
[npm-url]: https://npmjs.org/package/coldstorage
[travis-image]: https://img.shields.io/travis/bjornua/coldstorage/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/bjornua/coldstorage
[downloads-image]: http://img.shields.io/npm/dm/coldstorage.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/coldstorage
