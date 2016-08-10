'use strict';
import { RouteSpec } from 'restify';

export class ApiStatKeyBuilder {
    fromRouteSpec(routeSpec: RouteSpec, statusCode: number, error?: Error): string {
        let key = this.convertRouteSpecToKey(routeSpec);
        if (!key) {
          return '';
        }

        key += '.' + this.generateStatusSuffix(error, statusCode);
        return key;
    }

    private generateStatusSuffix(error: Error, statusCode: number): string {
        let status = 'success';
        if (error || typeof statusCode !== 'number' || statusCode >= 400 || statusCode === 0) {
            status = 'failure';
        }

        let statusCodeKey = 'unknown';
        if (typeof statusCode === 'number') {
            statusCodeKey = '' + Math.floor(statusCode / 100) + 'xx';
        }

        let suffix = `${status}.${statusCodeKey}`;
        return suffix;
    }

    private convertRouteSpecToKey(routeSpec: RouteSpec): string {
      if (!routeSpec) {
          return '';
      }

      let key: string = '';
      let path = <string | RegExp>routeSpec.path;
      // TODO: This should really check for string and for RegExp typeof
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
            .replace(/[^A-Za-z0-9_|\.]/g, '_'); // replace all non-alphanumeric characters (not including _ and .) with _

        return `regex.${key}`;
    }
}
