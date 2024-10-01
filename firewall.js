// @ts-check

const is = require('fn-arg-validator');
const find = require('lodash/fp/find');
const includes = require('lodash/fp/includes');
const isSymbol = require('lodash/fp/isSymbol');
const callsites = require('callsites');

is.config.throw = true;

function firewall() {
    /**
     * @param {string[]} locations
     * @param {string | symbol} prop
     */
    function throwIfCallerNotAuthorized(locations, prop) {
        is.valid(is.array, is.oneOf(is.maybeString, isSymbol), arguments);
        const caller = find((c) => c.getFileName() && !includes('firewall-js/firewall.js')(c.getFileName()))(
            callsites()
        );
        const callerFileName = caller ? caller.getFileName() : '';

        if (
            callerFileName &&
            !find((location) => {
                if (!includes('.')(location)) {
                    location += '/';
                }
                const fullPath = (process.env.PWD + '/' + location).replace(/\/{2,}/g, '/');
                return includes(fullPath)(callerFileName) || includes('node_modules')(callerFileName);
            })(locations)
        ) {
            const err = `Access denied for ${prop.toString()} from ${callerFileName}:${caller.getLineNumber()}:${caller.getColumnNumber()}`;
            throw new Error(err);
        }
    }

    /**
     * @param {string[]} locations
     * @param {Object} objToProxy
     * @returns {Object}
     */
    function createProxiedObject(locations, objToProxy) {
        is.valid(is.array, is.object, arguments);
        const proxied = new Proxy(objToProxy, {
            apply: function (target, thisArg, argumentsList) {
                throwIfCallerNotAuthorized(locations, 'calling function');
                // @ts-expect-error
                return Reflect.apply(...arguments);
            },
            construct(target, args) {
                throwIfCallerNotAuthorized(locations, 'creating new object');
                // @ts-expect-error
                return Reflect.construct(...arguments);
            },
            defineProperty(target, prop, descriptor) {
                throwIfCallerNotAuthorized(locations, prop);
                // @ts-expect-error
                return Reflect.defineProperty(...arguments);
            },
            deleteProperty(target, prop) {
                throwIfCallerNotAuthorized(locations, 'deleting property');
                // @ts-expect-error
                return Reflect.deleteProperty(...arguments);
            },
            get: function (target, prop, receiver) {
                throwIfCallerNotAuthorized(locations, prop);
                // @ts-expect-error
                return Reflect.get(...arguments);
            },
            getOwnPropertyDescriptor(target, prop) {
                throwIfCallerNotAuthorized(locations, prop);
                // @ts-expect-error
                return Reflect.getOwnPropertyDescriptor(...arguments);
            },
            getPrototypeOf(target) {
                throwIfCallerNotAuthorized(locations, 'getting prototype');
                // @ts-expect-error
                return Reflect.getPrototypeOf(...arguments);
            },
            has: function (target, prop) {
                throwIfCallerNotAuthorized(locations, prop);
                // @ts-expect-error
                return Reflect.has(...arguments);
            },
            isExtensible(target) {
                throwIfCallerNotAuthorized(locations, 'checking extensibility');
                // @ts-expect-error
                return Reflect.isExtensible(...arguments);
            },
            ownKeys: function (target) {
                throwIfCallerNotAuthorized(locations, 'observing own keys');
                // @ts-expect-error
                return Reflect.ownKeys(...arguments);
            },
            preventExtensions(target) {
                throwIfCallerNotAuthorized(locations, 'preventing extensions');
                // @ts-expect-error
                return Reflect.preventExtensions(...arguments);
            },
            set: function (target, prop, value) {
                throwIfCallerNotAuthorized(locations, prop);
                // @ts-expect-error
                return Reflect.set(...arguments);
            },
            setPrototypeOf(target, prototype) {
                throwIfCallerNotAuthorized(locations, 'setting prototype');
                // @ts-expect-error
                return Reflect.setPrototypeOf(...arguments);
            },
        });
        return proxied;
    }

    /**
     * @param {string[]} locations Allowed paths
     * @param {Object} targetObj Target object
     * @returns {Object} Proxied object
     */
    this.allow = function (locations, targetObj) {
        is.valid(is.array, is.object, arguments);
        return createProxiedObject(locations, targetObj);
    };

    return this;
}

module.exports = firewall();
