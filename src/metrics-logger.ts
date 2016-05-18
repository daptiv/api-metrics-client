'use strict';
import { Request } from './custom-typings';
import { Route, Response, Server } from 'restify';
import { StatsD, StatsDOptions } from './statsd';
import * as _ from 'lodash';

type HighResolutionTime = [number, number]; // [seconds, nanoseconds]

export const DEFAULT_KEY_NAME: string = 'handler-0';

let statsD: StatsD;
export function setStatsD(value) {
    statsD = value;
}

export function register(server: Server, statsDOptions: StatsDOptions) {
    if (!statsD) {
        statsD = new StatsD(statsDOptions);
    }

    server.on('after', (request: Request, response: Response, route: Route, error) => {
        let key: string;

        let timer = _.find(request.timers, (item) => {
            return item['name'] === route.name;
        });

        if (timer) {
            key = route.name;
        } else {
            key = DEFAULT_KEY_NAME;
        }

        let time = toMilliseconds(request.time());
        if (time) {
            statsD.timing(key, time);
        }
    });
}

function toMilliseconds(hrTime: HighResolutionTime): number {
    let milliSeconds = hrTime[0] * 1000;
    milliSeconds += hrTime[1] / 1000000;
    return milliSeconds;
}
