// include statsd-client typings in package, otherwise will have missing definitions
///<reference path="../typings/main/ambient/statsd-client/index.d.ts" />

/* tslint:disable:no-require-imports */
import StatsdClient = require('statsd-client');
/* tslint:enable:no-require-imports */

export interface StatsDOptions {
    host: string;
    prefix?: string;
    statsdClient?: StatsdClient;
}

const DEBUG_STATSD: boolean = false;

export class StatsD {
    private client: StatsdClient;
    private prefix: string;
    constructor(options: StatsDOptions) {
        this.prefix = this.cleanPrefix(options.prefix);
        this.client = options.statsdClient || new StatsdClient({host: options.host, debug: DEBUG_STATSD});
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

    private cleanPrefix(prefix: string): string {
        if (!prefix) {
            return null;
        }
        return prefix.toLowerCase().replace(/[^a-z0-9\.]/g, '_');
    }
}
