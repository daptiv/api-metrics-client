'use strict';
import { ApiStatKeyBuilder } from './api-stat-key-builder';
import { DaptivStatsLogger } from './daptiv-stats-logger';
import { Server, RouteSpec, Response, Request, Route } from 'restify';

export class ApiStatsLoggerFactory {
    private apiStatKeyBuilder: ApiStatKeyBuilder;
    private logRouteStatsFn: Function;

    constructor(private statsLogger: DaptivStatsLogger) {
        this.apiStatKeyBuilder = new ApiStatKeyBuilder();
        this.logRouteStatsFn = this.getRouteStatsLoggerFn();
    }

    registerStatsLoggerForAllRoutes(server: Server): void {
        server.on('after', (request: Request, response: Response, route: Route, error: Error): void => {
            this.logRouteStatsFn(request, response, route, error);
        });
    }

    // TODO: Should be private, but there are some unit tests that REALLY want to call this directly.
    getRouteStatsLoggerFn() {
        return (request: Request, response: Response, route: Route, error: Error) => {
            let routeSpec: RouteSpec = route && route.spec;
            let statusCode = this.getStatusCode(response);
            let key = this.apiStatKeyBuilder.fromRouteSpec(routeSpec, statusCode, error);

            let responseTime = this.getResponseTime(request, response);
            if (responseTime) {
                this.statsLogger.timing(key, responseTime);
            }

            this.statsLogger.increment(key);
        };
    }

    private getStatusCode(response: Response): number {
        let statusCode = (response && typeof response.statusCode === 'number')
            ? response.statusCode
            : null;
        return statusCode;
    }

    private getResponseTime(request: Request, response: Response): number {
        let responseTime = response.header('Response-Time');
        if (typeof (responseTime) !== 'number') {
            responseTime = Date.now() - request.time;
        }
        return responseTime;
    }

}
