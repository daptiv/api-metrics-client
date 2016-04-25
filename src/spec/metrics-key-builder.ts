import { MetricsKeyBuilder } from '../metrics-key-builder';
import { RouteSpec } from 'restify';

describe('MetricsKeyBuilder', () => {
    let builder: MetricsKeyBuilder;

    beforeEach(() => {
        builder = new MetricsKeyBuilder();
    });

    describe('fromUrl', () => {
        it('should convert .\'s to underscores', () => {
            expect(builder.fromUrl('http://daptiv.com/page.html.tmpl')).toEqual('page_html_tmpl');
        });

        it('should convert /\'s to .\'s', () => {
            expect(builder.fromUrl('http://daptiv.com/deep/resource/here')).toEqual('deep.resource.here');
        });

        it('should strip query strings', () => {
            expect(builder.fromUrl('https://daptiv.io/users/123.456/tasks?start=12345')).toEqual('users.123_456.tasks');
        });
    });

    describe('fromRouteSpec', () => {
        let routeSpec: RouteSpec;

        beforeEach(() => {
            routeSpec = {
                path: '/tasks',
            method: null,
            versions: [],
            name: 'routeHandlerName'
            };
        });

        it('should return empty string when routeSpec is null', () => {
            expect(builder.fromRouteSpec(null)).toEqual('');
        });

        it('should remove the leading / before processing path', () => {
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks');
        });

        it('should convert . in path to _', () => {
            routeSpec.path = '/tasks.flagged';
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks_flagged');
        });

        it('should convert : in path to _', () => {
            routeSpec.path = '/tasks:flagged';
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks_flagged');
        });

        it('should convert / in path to .', () => {
            routeSpec.path = '/tasks/flagged';
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks.flagged');
        });

        it('should append lowercased method when method is defined', () => {
            routeSpec.method = 'GET';
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks.get');
        });
    });
});

