// reserved for custom typings
/* tslint:disable:no-require-imports */
import http = require('http');
import bunyan = require('bunyan');
/* tslint:enable:no-require-imports */
import { requestAuthorization, requestFileInterface } from 'restify';

interface Request extends http.ServerRequest {
  header: (key: string, defaultValue?: string) => any;
  accepts: (type: string) => boolean;
  is: (type: string) => boolean;
  getLogger: (component: string) => any;
  contentLength: number;
  contentType: string;
  href: () => string;
  log: bunyan.Logger;
  id: string;
  path: () => string;
  query: any;
  secure: boolean;
  time: () => [number, number];
  timers: Array<{name: string, time: [number, number]}>;
  params: any;
  files?: { [name: string]: requestFileInterface };
  isSecure: () => boolean;
  /** available when bodyParser plugin is used */
  body?: any;
  /** available when authorizationParser plugin is used */
  username?: string;
  /** available when authorizationParser plugin is used */
  authorization?: requestAuthorization;
}
