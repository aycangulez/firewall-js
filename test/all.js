const chai = require('chai');
const should = chai.should();
const firewall = require('../firewall');
const { testService, UserService, square } = require('./service');

describe('firewall-js', function () {
    it('should access object property', function () {
        const fwService = firewall.allow(['test'], testService);
        fwService.prop1.should.equal('hello');
    });

    it('should set object property', function () {
        const fwService = firewall.allow(['test'], testService);
        fwService.prop2 = 'there';
        fwService.prop2.should.equal('there');
    });

    it('should define object property', function () {
        const fwService = firewall.allow(['test'], testService);
        Object.defineProperty(fwService, 'prop4', {
            value: 42,
        });
        fwService.prop4.should.equal(42);
        delete fwService.prop4;
    });

    it('should get own property descriptor', function () {
        const fwService = firewall.allow(['test'], testService);
        Object.getOwnPropertyDescriptor(fwService, 'prop1').value.should.equal('hello');
    });

    it('should get prototype', function () {
        const fwService = firewall.allow(['test'], testService);
        (fwService instanceof Object).should.equal(true);
    });

    it('should set prototype', function () {
        const fwService = firewall.allow(['test'], testService);
        Object.setPrototypeOf(fwService, {});
        (fwService instanceof Object).should.equal(true);
    });

    it('should delete object property', function () {
        const fwService = firewall.allow(['test'], testService);
        delete fwService.prop2;
        fwService.should.not.include({ prop2: 'world' });
        fwService.prop2 = 'world';
    });

    it('should access object method', function () {
        const fwService = firewall.allow(['test'], testService);
        fwService.increment(1).should.equal(2);
    });

    it('should access own keys', function () {
        const fwService = firewall.allow(['test'], testService);
        const keys = [];
        for (let k in fwService) {
            keys.push(k);
        }
        keys.should.include('prop1', 'prop2', 'prop3', 'increments');
    });

    it('should call a function', function () {
        var fwFunc = firewall.allow(['test'], square);
        fwFunc(5).should.equal(25);
    });

    it('should create a new object', function () {
        var fwService = firewall.allow(['test'], UserService);
        new fwService().create('Katniss', 'Everdeen').getFullName().should.equal('Katniss Everdeen');
    });

    it('should not access object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop1;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop1');
        }
    });

    it('should not access nested object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop3.subProp1;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop3');
        }
    });

    it('should not set object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop2 = 'there';
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop2');
        }
    });

    it('should not define object property', function () {
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

    it('should not get own property descriptor', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            Object.getOwnPropertyDescriptor(fwService, 'prop1').value;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for prop1');
        }
    });

    it('should not get prototype', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService instanceof Object;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for getting prototype');
        }
    });

    it('should not set prototype', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            Object.setPrototypeOf(fwService, {});
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for setting prototype');
        }
    });

    it('should not delete object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            delete fwService.prop2;
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for deleting property');
        }
    });

    it('should not access object method', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.increment(1);
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for increment');
        }
    });

    it('should not access own keys', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            for (let k in fwService) {
            }
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for observing own keys');
        }
    });

    it('should not call a function', function () {
        const fwFunc = firewall.allow(['some-dir'], square);
        try {
            fwFunc();
        } catch (e) {
            e.message.should.include('Access denied for calling function');
        }
    });

    it('should not create a new object', function () {
        const fwService = firewall.allow(['some-dir'], UserService);
        try {
            new fwService();
            should.fail();
        } catch (e) {
            e.message.should.include('Access denied for creating new object');
        }
    });
});
