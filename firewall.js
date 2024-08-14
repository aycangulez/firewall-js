const is = require('fn-arg-validator');
const includes = require('lodash/fp/includes');
const find = require('lodash/fp/find');
const callsites = require('callsites');

const firewall = (function () {
    const proxiedObjs = new WeakSet();

    function throwIfCallerNotAuthorized(locations, prop) {
        is.valid(is.array, is.string, arguments);
        const caller = find((c) => !includes('firewall-js/firewall.js')(c.getFileName()))(callsites());
        const callerFileName = caller ? caller.getFileName() : '';
        if (
            !find((location) => {
                const fullPath = (process.env.PWD + '/' + location).replace(/\/+/g, '/');
                return includes(fullPath)(callerFileName);
            })(locations)
        ) {
            const err = `Access denied to ${prop} from ${callerFileName}:${caller.getLineNumber()}:${caller.getColumnNumber()}`;
            throw new Error(err);
        }
    }

    // Credit for recursive set: https://stackoverflow.com/a/40164194
    function createProxiedObject(locations, objToProxy) {
        is.valid(is.array, is.object, arguments);
        // Recursively ensure object is deeply proxied
        for (let i in objToProxy) {
            let subObj = objToProxy[i];
            if (subObj !== null && typeof subObj === 'object' && !proxiedObjs.has(subObj)) {
                objToProxy[i] = createProxiedObject(subObj);
            }
        }
        let proxied = new Proxy(objToProxy, {
            construct(target, args) {
                throwIfCallerNotAuthorized(locations, 'creating a new object');
                return Reflect.construct(...arguments);
            },
            get: function (target, prop, receiver) {
                throwIfCallerNotAuthorized(locations, prop);
                return Reflect.get(...arguments);
            },
            set: function (target, prop, value) {
                throwIfCallerNotAuthorized(locations, prop);

                // Proxy nested objects
                if (value !== null && typeof value === 'object' && !proxiedObjs.has(value)) {
                    value = createProxiedObject(value);
                }
                target[prop.toString()] = value;

                return Reflect.set(...arguments);
            },
        });
        proxiedObjs.add(proxied);
        return proxied;
    }

    this.allow = function (locations, targetObj) {
        is.valid(is.array, is.object, arguments);
        return createProxiedObject(locations, targetObj);
    };

    return this;
})();

module.exports = firewall;
