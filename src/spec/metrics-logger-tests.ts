'use strict';
import * as metricsLogger from '../metrics-logger';
import { MetricsKeyBuilder } from '../metrics-key-builder';
import { Route, RouteSpec } from 'restify';

describe('metrics-logger', () => {
    let serverSpy = jasmine.createSpyObj('server', ['on']);
    let statsDOptions: StatsDClientOptions = {
        host: 'test.test.com'
    };
    let serverOnSpy: jasmine.Spy;
    let logger;
    let statsDSpy;
    let metricsKeyBuilder = new MetricsKeyBuilder();
    let mockRequest = jasmine.createSpyObj('mockRequest', ['']);
    let mockResponse = jasmine.createSpyObj('mockResponse', ['']);
    let mockRoute = <Route>{};
    let routeSpec: RouteSpec;

    beforeEach(() => {
        statsDSpy = jasmine.createSpyObj('statsDSpy', ['timing']);
        metricsLogger.registerHandledRouteTimingMetrics(serverSpy, statsDOptions);
        logger = new metricsLogger.MetricsLogFactory(statsDSpy, metricsKeyBuilder).createLogger();
        mockResponse.statusCode = 200;
        routeSpec = {
            path: '/tasks',
            method: null,
            versions: [],
            name: 'routeHandlerName'
        };
        mockRoute.spec = routeSpec;
    });

    it('should register server \'after\' event handler', () => {
        serverOnSpy = serverSpy.on;
        expect(serverSpy.on).toHaveBeenCalledWith('after', jasmine.any(Function));
    });

    it('when request timer not available for route should not record time', () => {
        mockRequest.timers = [];

        logger(mockRequest, mockResponse, mockRoute);

        expect(statsDSpy.timing).not.toHaveBeenCalled();
    });

    it('when request timer is available for route should record time for route', () => {
        mockRequest.timers = [{name: 'route-1', time: [0, 10]}, {name: 'route-2', time: [0, 20]}, {name: 'route-3', time: [0, 30]}];
        mockRoute.name = 'route-2';

        logger(mockRequest, mockResponse, mockRoute);

        expect(statsDSpy.timing).toHaveBeenCalledWith('tasks.200', jasmine.any(Number));
    });

    describe('metrics timer\'s time', () => {
        it('should be converted (seconds only) to ms', () => {
            mockRequest.timers = [{name: 'route-1', time: [5, 0]}];
            mockRoute.name = 'route-1';

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith(jasmine.any(String), 5000);
        });

        it('should be converted (seconds & ns) to ms', () => {
            mockRequest.timers = [{name: 'route-1', time: [5, 2000000]}];
            mockRoute.name = 'route-1';

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith(jasmine.any(String), 5002);
        });

        it('should be converted (ns only) to ms', () => {
            mockRequest.timers = [{name: 'route-1', time: [0, 1000010]}];
            mockRoute.name = 'route-1';

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith(jasmine.any(String), 1.000010);
        });
    });
});
