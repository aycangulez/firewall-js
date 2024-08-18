const is = require('fn-arg-validator');
const find = require('lodash/fp/find');
const includes = require('lodash/fp/includes');
const callsites = require('callsites');

const firewall = (function () {
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

    function createProxiedObject(locations, objToProxy) {
        is.valid(is.array, is.object, arguments);
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
                return Reflect.set(...arguments);
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
