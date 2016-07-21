'use strict';
import { Request } from './custom-typings';
import { Route, RouteSpec, Response, Server } from 'restify';
import { StatsD, StatsDOptions } from './statsd';
import { MetricsKeyBuilder } from './metrics-key-builder';

/**
 * tuple of [seconds, nanoseconds]
 */
type HighResolutionTime = [number, number];

export const DEFAULT_KEY_NAME: string = 'handler-0';

export function registerHandledRouteTimingMetrics(server: Server, statsDOptions: StatsDOptions) {
    let statsD: StatsD = new StatsD(statsDOptions);
    let metricsKeyBuilder: MetricsKeyBuilder = new MetricsKeyBuilder();
    let logger = new MetricsLogFactory(statsD, metricsKeyBuilder).createLogger();

    server.on('after', (request: Request, response: Response, route: Route, error) => {
        logger(request, response, route);
    });
}

export class MetricsLogFactory {
    constructor(private statsD: StatsD, private metricsKeyBuilder: MetricsKeyBuilder) {
    }

    createLogger() {
        return (request: Request, response: Response, route: Route) => {
            var latency = response.header('Response-Time');

            if (typeof (latency) !== 'number') {
                latency = Date.now() - request.time();
            }

            if (!latency) {
                return;
            }

            let routeSpec: RouteSpec = route && route.spec;

            let key: string = this.metricsKeyBuilder.fromRouteSpecAndStatus(routeSpec, response.statusCode);
            this.statsD.timing(key, latency);
        };
    }
};
