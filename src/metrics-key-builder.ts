import { RouteSpec } from 'restify';

export class MetricsKeyBuilder {
    fromRouteSpec(routeSpec: RouteSpec): string {
        if (!routeSpec) {
            return '';
        }

        let path: string = routeSpec.path.slice(1);
        let key: string = this.pathToKey(path);
        if (routeSpec.method) {
            key = `${key}.${routeSpec.method.toLowerCase()}`;
        }
        return key;
    }

    fromUrl(url: string): string {
        if (!url) {
            return '';
        }

        let idxQueryString;
        let idxEnd = (idxQueryString = url.indexOf('?')) === -1
            ? url.length
            : idxQueryString;

        let protocolSeperator: string = '://';
        let idx = url.indexOf(protocolSeperator);
        idx = idx === -1
            ? 0
            : idx + protocolSeperator.length;
        let idxStart = url.indexOf('/', idx) + 1;

        let path = url.substring(idxStart, idxEnd);

        return this.pathToKey(path);
    }

    private pathToKey(path: string): string {
        return (path || '')
            .replace(/[\.:]/g, '_')
            .replace(/\//g, '.');
    }
}
