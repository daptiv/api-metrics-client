import { RouteSpec } from 'restify';

export class MetricsKeyBuilder {
    fromRouteSpec(routeSpec: RouteSpec): string {
        if (!routeSpec) {
            return '';
        }

        let key: string;
        let path = <string | RegExp>routeSpec.path;
        if (typeof path !== 'string') {
            key = this.regexpToKey(<RegExp>path);
        } else {
            key = this.pathToKey(<string>path);
        }
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
            .replace(/^\//, '') // remove leading slash if present
            .replace(/[\.:]/g, '_')
            .replace(/\//g, '.');
    }

    private regexpToKey(regex: RegExp): string {
        let path = regex.toString();
        // extract pattern where pattern is:
        // /pattern/  /^pattern/  /pattern$/  or  /^pattern$/
        let pattern = path.replace(/^\/\^?([^$]*)[\$]?\/$/, '$1');
        let key = pattern
            .replace(/^\\\//, '') // remove leading slash
            .replace(/\\\/$/, '') // remove trailing slash
            .replace(/([^\\])\./g, '$1_') // replace all . (any one character placeholder) with _
            .replace(/\\\//g, '.') // replace all \/ with .
            .replace(/\\./g, '_') // replace all escaped characters with _
            .replace(/[^A-Za-z0-9_|\.]/g, '_') // replace all non-alphanumeric characters (not including _ and .) with _
            ;

        return `regex.${key}`;
    }
}
