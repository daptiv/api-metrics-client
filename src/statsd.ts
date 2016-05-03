/* tslint:disable:no-require-imports */
import StatsdClient = require('statsd-client');
/* tslint:enable:no-require-imports */

export interface StatsDOptions {
    host: string;
    prefix?: string;
    statsdClient?: StatsdClient;
}

export class StatsD {
    private client: StatsdClient;
    private prefix: string;
    constructor(options: StatsDOptions) {
        this.prefix = options.prefix;
        this.client = options.statsdClient || new StatsdClient({host: options.host});
    }

    counter(key: string, value: number) {
        this.client.counter(this.processKey(key), value);
    }

    gauge(key: string, value: number) {
        this.client.gauge(this.processKey(key), value);
    }

    increment(key: string) {

        this.client.increment(this.processKey(key));
    }

    timing(key: string, timeInMilliseconds: number) {
        this.client.timing(this.processKey(key), timeInMilliseconds);
    }

    private processKey(key: string): string {
        return !this.prefix
            ? key
            : `${this.prefix}.${key}`;
    }
}
