'use strict';
import { MetricsKeyBuilder } from './metrics-key-builder';
import { Server, RouteSpec, Response, Request, Route } from 'restify';
import { DaptivMetricsLogger } from 'daptiv-metrics-logger';

/**
 * tuple of [seconds, nanoseconds]
 */
type HighResolutionTime = [number, number];

export const DEFAULT_KEY_NAME: string = 'handler-0';

export function registerHandledRouteTimingMetrics(server: Server, metricsLogger: DaptivMetricsLogger) {
  // A logger and metricsKeyBuilder should NOT be created here, they should be provided by the caller.
    let metricsKeyBuilder: MetricsKeyBuilder = new MetricsKeyBuilder();
    let apiMetricsLogger = new ApiMetricsLoggerFactory(metricsLogger, metricsKeyBuilder).createLogger();

    server.on('after', (request: Request, response: Response, route: Route, error) => {
        apiMetricsLogger(request, response, route);
    });
}

export class ApiMetricsLoggerFactory {
    constructor(private metricsLogger: DaptivMetricsLogger, private metricsKeyBuilder: MetricsKeyBuilder) {}

    createLogger() {
        return (request: Request, response: Response, route: Route) => {
            // Ignore requests without timers, e.g. OPTIONS
            if (!request.timers) {
                return;
            }

            let timer = request.timers.find((item) => {
                return item.name === route.name || item.name === DEFAULT_KEY_NAME;
            });
            if (!timer) {
                return;
            }

            let routeSpec: RouteSpec = route && route.spec;
            let key: string = this.metricsKeyBuilder.fromRouteSpecAndStatus(routeSpec, response.statusCode);
            let time = this.toMilliseconds(timer.time);
            if (time) {
                this.metricsLogger.timing(key, time);
            }

            // TODO: increment success and failure (4XX, 5XX)
        };
    }

    private toMilliseconds(hrTime: HighResolutionTime): number {
        let milliSeconds = hrTime[0] * 1000; // seconds to milliseconds
        milliSeconds += hrTime[1] / 1000000; // nanoseconds to milliseconds
        return milliSeconds;
    }
};
