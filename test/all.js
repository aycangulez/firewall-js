const chai = require('chai');
const should = chai.should();
const firewall = require('../firewall');
const { testService, UserService, extensibilityTest, square } = require('./service');

describe('should', function () {
    it('access to object property', function () {
        const fwService = firewall.allow(['test'], testService);
        fwService.prop1.should.equal('hello');
    });

    it('access to object property from file only', function () {
        const fwService = firewall.allow(['test/all.js'], testService);
        fwService.prop1.should.equal('hello');
    });

    it('access to nested object property', function () {
        const fwService = firewall.allow(['test'], testService);
        fwService.prop3.subProp1.should.equal('deep down');
    });

    it('set object property', function () {
        const fwService = firewall.allow(['test'], testService);
        fwService.prop2 = 'there';
        fwService.prop2.should.equal('there');
    });

    it('define object property', function () {
        const fwService = firewall.allow(['test'], testService);
        Object.defineProperty(fwService, 'prop4', {
            value: 42,
        });
        fwService.prop4.should.equal(42);
        delete fwService.prop4;
    });

    it('get own property descriptor', function () {
        const fwService = firewall.allow(['test'], testService);
        Object.getOwnPropertyDescriptor(fwService, 'prop1').value.should.equal('hello');
    });

    it('get prototype', function () {
        const fwService = firewall.allow(['test'], testService);
        (fwService instanceof Object).should.equal(true);
    });

    it('set prototype', function () {
        const fwService = firewall.allow(['test'], testService);
        Object.setPrototypeOf(fwService, {});
        (fwService instanceof Object).should.equal(true);
    });

    it('delete object property', function () {
        const fwService = firewall.allow(['test'], testService);
        delete fwService.prop2;
        fwService.should.not.include({ prop2: 'world' });
        fwService.prop2 = 'world';
    });

    it('access object method', function () {
        const fwService = firewall.allow(['test'], testService);
        fwService.increment(1).should.equal(2);
    });

    it('access own keys', function () {
        const fwService = firewall.allow(['test'], testService);
        const keys = [];
        for (let k in fwService) {
            keys.push(k);
        }
        keys.should.include('prop1', 'prop2', 'prop3', 'increments');
    });

    it('check the extensibility of object', function () {
        const fwService = firewall.allow(['test'], extensibilityTest);
        Object.isExtensible(fwService).should.equal(true);
    });

    it('prevent the extensibility of object', function () {
        const fwService = firewall.allow(['test'], extensibilityTest);
        Object.preventExtensions(fwService);
        Object.isExtensible(fwService).should.equal(false);
    });

    it('call a function', function () {
        var fwFunc = firewall.allow(['test'], square);
        fwFunc(5).should.equal(25);
    });

    it('create a new object', function () {
        const fwService = firewall.allow(['test'], UserService);
        new fwService().create('Katniss', 'Everdeen').getFullName().should.equal('Katniss Everdeen');
    });
});

describe('should not', function () {
    it('access to object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop1;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop1');
        }
    });

    it('access to object property from file', function () {
        const fwService = firewall.allow(['test/all'], testService);
        try {
            fwService.prop1;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop1');
        }
    });

    it('access to nested object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop3.subProp1;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop3');
        }
    });

    it('set object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop2 = 'there';
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop2');
        }
    });

    it('define object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            Object.defineProperty(fwService, 'prop4', {
                value: 42,
            });
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop4');
        }
    });

    it('get own property descriptor', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            Object.getOwnPropertyDescriptor(fwService, 'prop1').value;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop1');
        }
    });

    it('get prototype', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService instanceof Object;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for getting prototype');
        }
    });

    it('set prototype', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            Object.setPrototypeOf(fwService, {});
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for setting prototype');
        }
    });

    it('delete object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            delete fwService.prop2;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for deleting property');
        }
    });

    it('access object method', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.increment(1);
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for increment');
        }
    });

    it('access own keys', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            for (let k in fwService) {
            }
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for observing own keys');
        }
    });

    it('check the extensibility of object', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            Object.isExtensible(fwService);
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for checking extensibility');
        }
    });

    it('prevent the extensibility of object', function () {
        const fwService = firewall.allow(['some-dir'], extensibilityTest);
        try {
            Object.preventExtensions(fwService);
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for preventing extensions');
        }
    });

    it('call a function', function () {
        const fwFunc = firewall.allow(['some-dir'], square);
        try {
            fwFunc();
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for calling function');
        }
    });

    it('create a new object', function () {
        const fwService = firewall.allow(['some-dir'], UserService);
        try {
            new fwService();
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for creating new object');
        }
    });
});
