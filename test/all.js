const chai = require('chai');
const should = chai.should();
const firewall = require('../firewall');
const { testService, UserService } = require('./service');

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

    it('should access object method', function () {
        const fwService = firewall.allow(['test'], testService);
        fwService.increment(1).should.equal(2);
    });

    it('should create a new object', function () {
        var fwService = firewall.allow(['test'], UserService);
        new fwService().create('Katniss', 'Everdeen').getFullName().should.equal('Katniss Everdeen');
    });

    it('should not access object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop1;
            try {
                should.fail();
            } catch (e) {}
        } catch (e) {
            e.message.should.include('Access denied to prop1');
        }
    });

    it('should not access nested object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop3.subProp1;
            try {
                should.fail();
            } catch (e) {}
        } catch (e) {
            e.message.should.include('Access denied to prop3');
        }
    });

    it('should not set object property', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.prop2 = 'there';
            try {
                should.fail();
            } catch (e) {}
        } catch (e) {
            e.message.should.include('Access denied to prop2');
        }
    });

    it('should not access object method', function () {
        const fwService = firewall.allow(['some-dir'], testService);
        try {
            fwService.increment(1);
            try {
                should.fail();
            } catch (e) {}
        } catch (e) {
            e.message.should.include('Access denied to increment');
        }
    });

    it('should not create a new object', function () {
        const fwService = firewall.allow(['some-dir'], UserService);
        try {
            new fwService();
            try {
                should.fail();
            } catch (e) {}
        } catch (e) {
            e.message.should.include('Access denied to creating a new object');
        }
    });
});