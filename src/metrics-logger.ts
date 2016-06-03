'use strict';
//import { Request } from './custom-typings';
import { StatsDClient } from './statsd-client';
import { MetricsKeyBuilder } from './metrics-key-builder';

/**
 * tuple of [seconds, nanoseconds]
 */
type HighResolutionTime = [number, number];

export const DEFAULT_KEY_NAME: string = 'handler-0';

export function registerHandledRouteTimingMetrics(server: Server, StatsDClientOptions: StatsDClientOptions) {
    let StatsDClient: StatsDClient = new StatsDClient(StatsDClientOptions);
    let metricsKeyBuilder: MetricsKeyBuilder = new MetricsKeyBuilder();
    let logger = new MetricsLogFactory(StatsDClient, metricsKeyBuilder).createLogger();

    server.on('after', (request: Request, response: Response, route: Route, error) => {
        logger(request, response, route);
    });
}

export class MetricsLogFactory {
    constructor(private StatsDClient: StatsDClient, private metricsKeyBuilder: MetricsKeyBuilder) {
    }

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
                this.StatsDClient.timing(key, time);
            }
        };
    }

    private toMilliseconds(hrTime: HighResolutionTime): number {
        let milliSeconds = hrTime[0] * 1000;
        milliSeconds += hrTime[1] / 1000000;
        return milliSeconds;
    }
};
