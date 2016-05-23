'use strict';
import { Request } from './custom-typings';
import { Route, Response, Server } from 'restify';
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
        logger(request, route);
    });
}

export class MetricsLogFactory {
    constructor(private statsD: StatsD) {
    }

    createLogger() {
        return (request: Request, route: Route) => {
            let key: string;

            let timer = request.timers.find((item) => {
                return item.name === route.name || item.name === DEFAULT_KEY_NAME;
            });

            if (timer) {
                key = timer.name;
                let time = toMilliseconds(timer.time);

                if (time) {
                    this.statsD.timing(key, time);
                }
            }
        };
    }
};

function toMilliseconds(hrTime: HighResolutionTime): number {
    let milliSeconds = hrTime[0] * 1000;
    milliSeconds += hrTime[1] / 1000000;
    return milliSeconds;
}
