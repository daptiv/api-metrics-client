'use strict';
import * as metricsLogger from '../metrics-logger';
import { MetricsKeyBuilder } from '../metrics-key-builder';
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
    let metricsKeyBuilder = new MetricsKeyBuilder();
    let mockRequest;
    let mockResponse;
    let mockRoute = <Route>{};
    let routeSpec: RouteSpec;

    beforeEach(() => {
        statsDSpy = jasmine.createSpyObj('statsDSpy', ['timing']);
        mockRequest = jasmine.createSpyObj('mockRequest', ['time']);
        mockResponse = jasmine.createSpyObj('mockResponse', ['header']);

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

    it('when response Response-Time header is available should record time for route', () => {
        mockResponse.header.and.callFake((headerName) => { return headerName === 'Response-Time' ? 123 : null });

        logger(mockRequest, mockResponse, mockRoute);

        expect(statsDSpy.timing).toHaveBeenCalledWith('tasks.200', 123);
    });

    it('when response Response-Time header is unavailable should record time for route', () => {
        spyOn(Date,'now').and.callFake(() => { return 40 });
        mockRequest.time.and.callFake(() => { return 30 });
        mockResponse.header.and.callFake((headerName) => { return null });

        logger(mockRequest, mockResponse, mockRoute);

        expect(statsDSpy.timing).toHaveBeenCalledWith('tasks.200', 10);
    });

    it('when both response Response-Time header and request time is unavailable should not record time', () => {
        mockResponse.header.and.callFake((headerName) => { return null });

        logger(mockRequest, mockResponse, mockRoute);

        expect(statsDSpy.timing).not.toHaveBeenCalled();
    });
});
