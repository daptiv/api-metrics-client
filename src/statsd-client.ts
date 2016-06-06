// include statsd-client typings in package, otherwise will have missing definitions
////<reference path="../typings/main/ambient/statsd-client/index.d.ts" />

/* tslint:disable:no-require-imports */
import { StatsD } from 'node-dogstatsd';
/* tslint:enable:no-require-imports */

export interface StatsDClientOptions {
    host: string;
    port?: number;
    socket?: string;
    prefix?: string;
    globalTags?: string[];
    statsd?: StatsD;
}

export class StatsDClient {
    private client: StatsD;
    private prefix: string;

    constructor(options: StatsDClientOptions) {
        this.prefix = this.cleanPrefix(options.prefix);
        this.client = options.statsd || new StatsD(options.host, options.port, options.socket, { global_tags: options.globalTags });
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
