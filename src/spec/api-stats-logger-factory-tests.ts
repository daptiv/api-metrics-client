'use strict';
import { ApiStatsLoggerFactory } from '../api-stats-logger-factory';
import { DaptivStatsLogger } from '../daptiv-stats-logger';
import { Route, RouteSpec } from 'restify';

describe('api-stats-logger-factory', () => {
    let serverSpy = jasmine.createSpyObj('server', ['on']);
    let serverOnSpy: jasmine.Spy;
    let logger;
    let statsDSpy;
    let mockRequest;
    let mockResponse;
    let mockRoute = <Route>{};
    let routeSpec: RouteSpec;
    let statsLogger: DaptivStatsLogger;
    let expectedSampleRate = 1;
    let expectedTags: string[] = [];

    beforeEach(() => {
        statsDSpy = jasmine.createSpyObj('statsDSpy', ['timing', 'increment']);
        mockRequest = jasmine.createSpyObj('mockRequest', ['time']);
        mockResponse = jasmine.createSpyObj('mockResponse', ['header']);

        let statsLoggerOpts = {
            prefix: 'bobo',
            client: statsDSpy
        };
        statsLogger = new DaptivStatsLogger(statsLoggerOpts);
        let statsLoggerFactory = new ApiStatsLoggerFactory(statsLogger);
        statsLoggerFactory.registerStatsLoggerForAllRoutes(serverSpy);

        logger = statsLoggerFactory.getRouteStatsLoggerFn();

        mockResponse.statusCode = 200;
        routeSpec = {
            path: '/tasks',
            method: 'GET',
            versions: [],
            name: 'routeHandlerName'
        };
        mockRoute.spec = routeSpec;
    });

    it("should register server 'after' event handler", () => {
        serverOnSpy = serverSpy.on;
        expect(serverSpy.on).toHaveBeenCalledWith('after', jasmine.any(Function));
    });

    it('when response Response-Time header is available should record time for route', () => {
        mockResponse.header.and.callFake((headerName) => {
            return headerName === 'Response-Time' ? 123 : null;
        });

        logger(mockRequest, mockResponse, mockRoute, null);

        expect(statsDSpy.timing).toHaveBeenCalledWith('bobo.tasks.get.success.2xx', 123, expectedSampleRate, expectedTags);
    });

    it('when response Response-Time header is unavailable should record time for route', () => {
        spyOn(Date, 'now').and.callFake(() => { return 40; });
        mockRequest.time = 30;
        mockResponse.header.and.callFake((headerName) => { return null; });

        logger(mockRequest, mockResponse, mockRoute, null);

        expect(statsDSpy.timing).toHaveBeenCalledWith('bobo.tasks.get.success.2xx', 10, expectedSampleRate, expectedTags);
    });

    it('when both response Response-Time header and request time is unavailable should not record time', () => {
        mockResponse.header.and.callFake((headerName) => { return null; });

        logger(mockRequest, mockResponse, mockRoute, null);

        expect(statsDSpy.timing).not.toHaveBeenCalled();
    });
});
