'use strict';
import * as logger from '../metrics-logger';
import { StatsDOptions } from '../statsd';
import { Route } from 'restify';

describe('metrics-logger', () => {
    let serverSpy = jasmine.createSpyObj('server', ['on']);
    let statsDOptions: StatsDOptions = {
        host: 'test.test.com'
    };
    let serverOnSpy: jasmine.Spy;
    let log;
    let statsDSpy;
    let mockRequest = jasmine.createSpyObj('mockRequest', ['time']);
    let mockRoute = <Route>{};

    beforeEach(() => {
        statsDSpy = jasmine.createSpyObj('statsDSpy', ['timing']);
        logger.setStatsD(statsDSpy);
        logger.register(serverSpy, statsDOptions);
        serverOnSpy = serverSpy.on;
        log = serverOnSpy.calls.argsFor(0)[1];
    });

    it('should register server \'after\' event handler', () => {
        expect(serverSpy.on).toHaveBeenCalledWith('after', jasmine.any(Function));
    });

    it('when request timer not available for route should record time for default handler', () => {
        mockRequest.timers = [];
        mockRequest.time.and.returnValue([5, 0]);
        mockRoute.name = 'route-name';

        log(mockRequest, jasmine.any, mockRoute, jasmine.any);

        expect(statsDSpy.timing).toHaveBeenCalledWith(logger.DEFAULT_KEY_NAME, jasmine.any(Number));
    });

    it('when request timer is available for route should record time for route name', () => {
        mockRequest.timers = [{name: 'route-1', time: 10}, {name: 'route-2', time: 20}, {name: 'route-3', time: 30}];
        mockRequest.time.and.returnValue([5, 0]);
        mockRoute.name = 'route-2';

        log(mockRequest, jasmine.any, mockRoute, jasmine.any);

        expect(statsDSpy.timing).toHaveBeenCalledWith(mockRoute.name, jasmine.any(Number));
    });

    it('should convert request time (seconds only) to ms', () => {
        mockRequest.timers = [{name: 'route-1', time: 10}];
        mockRequest.time.and.returnValue([5, 0]);
        mockRoute.name = 'route-name';

        log(mockRequest, jasmine.any, mockRoute, jasmine.any);

        expect(statsDSpy.timing).toHaveBeenCalledWith(jasmine.any(String), 5000);
    });

    it('should convert request time (seconds & ns) to ms', () => {
        mockRequest.timers = [{name: 'route-1', time: 10}];
        mockRequest.time.and.returnValue([5, 2000000]);
        mockRoute.name = 'route-name';

        log(mockRequest, jasmine.any, mockRoute, jasmine.any);

        expect(statsDSpy.timing).toHaveBeenCalledWith(jasmine.any(String), 5002);
    });

    it('should convert request time (ns only) to ms', () => {
        mockRequest.timers = [{name: 'route-1', time: 10}];
        mockRequest.time.and.returnValue([0, 1000010]);
        mockRoute.name = 'route-name';

        log(mockRequest, jasmine.any, mockRoute, jasmine.any);

        expect(statsDSpy.timing).toHaveBeenCalledWith(jasmine.any(String), 1.000010);
    });

});
