import { MetricsKeyBuilder } from './metrics-key-builder';
import { Request, Response, Route, RouteSpec, Server } from 'restify';
import { StatsD } from './statsd';

export class MetricsLogger {
    constructor(
        private server: Server,
        private metricsKeyBuilder: MetricsKeyBuilder,
        private statsd: StatsD,
        private auditLogger) {

        this.server.on('after', (request: Request, response: Response, route: Route, error) => {
            let routeSpec: RouteSpec = route && route.spec;
            let key: string = this.metricsKeyBuilder.fromRouteSpec(routeSpec);

            let time = Math.max(new Date().getTime() - request.time, 0);
            if (time) {
                this.statsd.timing(key, time);
            }
            auditLogger(request, response, route, error);
        });
    }
}
