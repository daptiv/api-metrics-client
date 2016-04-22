/* tslint:disable:no-require-imports */
import StatsdClient = require('statsd-client');
/* tslint:enable:no-require-imports */

export interface StatsDOptions {
    host: string;
    prefix?: string;
}

export class StatsD {
    private client: StatsdClient;

    constructor(options: StatsDOptions) {
        this.client = new StatsdClient(options);
    }

    counter(key: string, value: number) {
        this.client.counter(key, value);
    }

    gauge(key: string, value: number) {
        this.client.gauge(key, value);
    }

    increment(key: string) {
        this.client.increment(key);
    }

    timing(key: string, timeInMilliseconds: number) {
        this.client.timing(key, timeInMilliseconds);
    }
}

