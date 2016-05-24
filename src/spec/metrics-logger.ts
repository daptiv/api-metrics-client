'use strict';
import * as metricsLogger from '../metrics-logger';
import { StatsDOptions } from '../statsd';
import { Route, RouteSpec } from 'restify';

describe('metrics-logger', () => {
    let serverSpy = jasmine.createSpyObj('server', ['on']);
    let statsDOptions: StatsDOptions = {
        host: 'test.test.com'
    };
    let serverOnSpy: jasmine.Spy;
    let logger;
    let statsDSpy;
    let mockRequest = jasmine.createSpyObj('mockRequest', ['']);
    let mockResponse = jasmine.createSpyObj('mockResponse', ['']);
    let mockRoute = <Route>{};
    let routeSpec: RouteSpec;

    beforeEach(() => {
        statsDSpy = jasmine.createSpyObj('statsDSpy', ['timing']);
        metricsLogger.register(serverSpy, statsDOptions);
        logger = new metricsLogger.MetricsLogFactory(statsDSpy).createLogger();
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

    describe('metrics key', () => {
        beforeEach(() => {
            mockRequest.timers = [{name: 'route-1', time: [5, 0]}];
            mockRoute.name = 'route-1';
        });

        it('should return empty key when routeSpec is null', () => {
            mockRoute.spec = null;

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith('', 5000);
        });

        it('should remove the leading / before processing path', () => {
            routeSpec.path = '/tasks';
            mockRoute.spec = routeSpec;

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith('tasks.200', jasmine.any(Number));
        });

        it('should convert . in path to _', () => {
            routeSpec.path = '/tasks.flagged';
            mockRoute.spec = routeSpec;

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith('tasks_flagged.200', jasmine.any(Number));
        });

        it('should convert : in path to _', () => {
            routeSpec.path = '/tasks:flagged';
            mockRoute.spec = routeSpec;

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith('tasks_flagged.200', jasmine.any(Number));
        });

        it('should convert / in path to .', () => {
            routeSpec.path = '/tasks/flagged';
            mockRoute.spec = routeSpec;

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith('tasks.flagged.200', jasmine.any(Number));
        });

        it('should append lowercased method when method is defined', () => {
            routeSpec.method = 'GET';
            mockRoute.spec = routeSpec;

            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith('tasks.get.200', jasmine.any(Number));
        });

        it('should append statusCode if it exists', () => {
            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith('tasks.200', jasmine.any(Number));
        });

        it('should not append statusCode if it does not exist', () => {
            mockResponse.statusCode = null;
            logger(mockRequest, mockResponse, mockRoute);

            expect(statsDSpy.timing).toHaveBeenCalledWith('tasks', jasmine.any(Number));
        });
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
