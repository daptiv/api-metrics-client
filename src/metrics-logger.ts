'use strict';
import { Request } from './custom-typings';
import { Route, RouteSpec, Response, Server } from 'restify';
import { StatsD, StatsDOptions } from './statsd';

/**
 * tuple of [seconds, nanoseconds]
 */
type HighResolutionTime = [number, number];

export const DEFAULT_KEY_NAME: string = 'handler-0';

export function register(server: Server, statsDOptions: StatsDOptions) {
    let statsD: StatsD = new StatsD(statsDOptions);
    let logger = new MetricsLogFactory(statsD).createLogger();

    server.on('after', (request: Request, response: Response, route: Route, error) => {
        logger(request, response, route);
    });
}

export class MetricsLogFactory {
    constructor(private statsD: StatsD) {
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
            let key: string = this.fromRouteSpecAndStatus(routeSpec, response.statusCode);
            let time = this.toMilliseconds(timer.time);
            if (time) {
                this.statsD.timing(key, time);
            }
        };
    }

    private fromRouteSpecAndStatus(routeSpec: RouteSpec, statusCode?: number): string {
        if (!routeSpec) {
            return '';
        }

        let path: string = routeSpec.path.slice(1);
        let key: string = this.pathToKey(path);

        if (routeSpec.method) {
            key = `${key}.${routeSpec.method.toLowerCase()}`;
        }
        if (statusCode) {
            key = `${key}.${statusCode}`;
        }
        return key;
    }

    private toMilliseconds(hrTime: HighResolutionTime): number {
        let milliSeconds = hrTime[0] * 1000;
        milliSeconds += hrTime[1] / 1000000;
        return milliSeconds;
    }

    private pathToKey(path: string): string {
        return (path || '')
            .replace(/[\.:]/g, '_')
            .replace(/\//g, '.');
    }
};
