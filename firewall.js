const is = require('fn-arg-validator');
const find = require('lodash/fp/find');
const includes = require('lodash/fp/includes');
const isSymbol = require('lodash/fp/isSymbol');
const callsites = require('callsites');

is.config.throw = true;

const firewall = (function () {
    function throwIfCallerNotAuthorized(locations, prop) {
        is.valid(is.array, is.oneOf(is.maybeString, isSymbol), arguments);
        const caller = find((c) => c.getFileName() && !includes('firewall-js/firewall.js')(c.getFileName()))(
            callsites()
        );
        const callerFileName = caller ? caller.getFileName() : '';

        if (
            callerFileName &&
            !find((location) => {
                const fullPath = (process.env.PWD + '/' + location).replace(/\/+/g, '/');
                return includes(fullPath)(callerFileName) || includes('node_modules')(callerFileName);
            })(locations)
        ) {
            const err = `Access denied for ${prop.toString()} from ${callerFileName}:${caller.getLineNumber()}:${caller.getColumnNumber()}`;
            throw new Error(err);
        }
    }

    function createProxiedObject(locations, objToProxy) {
        is.valid(is.array, is.object, arguments);
        let proxied = new Proxy(objToProxy, {
            apply: function (target, thisArg, argumentsList) {
                throwIfCallerNotAuthorized(locations, 'calling function');
                return Reflect.apply(...arguments);
            },
            construct(target, args) {
                throwIfCallerNotAuthorized(locations, 'creating new object');
                return Reflect.construct(...arguments);
            },
            defineProperty(target, prop, descriptor) {
                throwIfCallerNotAuthorized(locations, prop);
                return Reflect.defineProperty(...arguments);
            },
            deleteProperty(target, prop) {
                throwIfCallerNotAuthorized(locations, 'deleting property');
                return Reflect.deleteProperty(...arguments);
            },
            get: function (target, prop, receiver) {
                throwIfCallerNotAuthorized(locations, prop);
                return Reflect.get(...arguments);
            },
            getOwnPropertyDescriptor(target, prop) {
                throwIfCallerNotAuthorized(locations, prop);
                return Reflect.getOwnPropertyDescriptor(...arguments);
            },
            getPrototypeOf(target) {
                throwIfCallerNotAuthorized(locations, 'getting prototype');
                return Reflect.getPrototypeOf(...arguments);
            },
            has: function (target, prop) {
                throwIfCallerNotAuthorized(locations, prop);
                return Reflect.has(...arguments);
            },
            ownKeys: function (target) {
                throwIfCallerNotAuthorized(locations, 'observing own keys');
                return Reflect.ownKeys(...arguments);
            },
            set: function (target, prop, value) {
                throwIfCallerNotAuthorized(locations, prop);
                return Reflect.set(...arguments);
            },
            setPrototypeOf(target, prototype) {
                throwIfCallerNotAuthorized(locations, 'setting prototype');
                return Reflect.setPrototypeOf(...arguments);
            },
        });
        return proxied;
    }

    this.allow = function (locations, targetObj) {
        is.valid(is.array, is.object, arguments);
        return createProxiedObject(locations, targetObj);
    };

    return this;
})();

module.exports = firewall;
